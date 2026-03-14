import { POT_ORDER, CAMPEON_ID } from '../data/teams'
import { getValidTeamsForGroupSlot } from './probability'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Asigna los 8 equipos de un bolillero a los 8 grupos en slotIndex (bijectión)
 * respetando país / Fase 3. Explora órdenes; no depende del orden A→H greedy.
 */
function assignPotLayerBacktrack(groups, groupNames, potTeams, slotIndex, potId) {
  const usedThisSlot = new Set()

  function placedById() {
    const s = new Set()
    Object.values(groups)
      .flat()
      .filter(Boolean)
      .forEach((t) => s.add(t.id))
    return s
  }

  function dfs(gIdx) {
    if (gIdx >= groupNames.length) return true
    const groupId = groupNames[gIdx]
    const row = groups[groupId]
    if (row[slotIndex] != null) return dfs(gIdx + 1)

    const placed = placedById()
    const valid = getValidTeamsForGroupSlot(potTeams, row, placed, potId)
    const candidates = shuffle(valid.filter((t) => !usedThisSlot.has(t.id)))

    for (const team of candidates) {
      usedThisSlot.add(team.id)
      row[slotIndex] = team
      if (dfs(gIdx + 1)) return true
      row[slotIndex] = null
      usedThisSlot.delete(team.id)
    }
    return false
  }

  return dfs(0)
}

export function simulateDraw(pots, groupNames) {
  const MAX_TRIES = 80

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const groups = {}
    groupNames.forEach((name) => {
      groups[name] = [null, null, null, null]
    })

    const potA = pots.A
    const campeon = potA.find((t) => t.id === CAMPEON_ID)
    const cabezasRestantes = shuffle(potA.filter((t) => t.id !== CAMPEON_ID))
    if (!campeon) return { error: 'No se encontró el campeón en el bolillero 1.', groups: null }

    groups.A[0] = campeon
    const otherGroups = groupNames.filter((g) => g !== 'A')
    otherGroups.forEach((groupId, i) => {
      groups[groupId][0] = cabezasRestantes[i]
    })

    let failed = false
    for (let slotIndex = 1; slotIndex < 4; slotIndex++) {
      const potId = POT_ORDER[slotIndex]
      const potTeams = pots[potId] || []
      if (
        !assignPotLayerBacktrack(groups, groupNames, potTeams, slotIndex, potId)
      ) {
        failed = true
        break
      }
    }

    if (!failed) return { groups, error: null }
  }

  return {
    error:
      'No se encontró una distribución válida tras varios intentos (restricción de países / Fase 3). Probá de nuevo.',
    groups: null,
  }
}

/**
 * ¿Se pueden colocar todos los equipos de `unplaced` en los grupos de `emptyGids`
 * (un equipo por grupo, slot slotIndex)? Backtracking exacto (evita falsos bloqueos
 * con varios del mismo país o restricciones encadenadas).
 */
function canCompletePotAssignments(
  gState,
  unplaced,
  emptyGids,
  slotIndex,
  potTeams,
  potId,
  pSet
) {
  if (unplaced.length === 0) return true
  if (unplaced.length !== emptyGids.length) return false
  const team = unplaced[0]
  const rest = unplaced.slice(1)
  const shuffledGids = shuffle([...emptyGids])
  for (const gid of shuffledGids) {
    const valid = getValidTeamsForGroupSlot(potTeams, gState[gid], pSet, potId)
    if (!valid.some((t) => t.id === team.id)) continue
    gState[gid][slotIndex] = team
    pSet.add(team.id)
    const nextEmpty = emptyGids.filter((g) => g !== gid)
    if (canCompletePotAssignments(gState, rest, nextEmpty, slotIndex, potTeams, potId, pSet))
      return true
    pSet.delete(team.id)
    gState[gid][slotIndex] = null
  }
  return false
}

function cloneGroupsState(groups, groupNames) {
  const o = {}
  groupNames.forEach((g) => {
    o[g] = [...(groups[g] || [null, null, null, null])]
  })
  return o
}

/**
 * Un paso válido = existe asignación completa del bolillero actual a los cupos libres.
 * @returns { { done: true } | { groupId, slotIndex, team } }
 */
export function getNextDrawStep(groups, pots, groupNames) {
  const placedById = new Set()
  Object.values(groups)
    .flat()
    .filter(Boolean)
    .forEach((t) => placedById.add(t.id))

  for (let slotIndex = 0; slotIndex < 4; slotIndex++) {
    const potId = POT_ORDER[slotIndex]
    const potTeams = pots[potId] || []
    const unplaced = potTeams.filter((t) => !placedById.has(t.id))
    if (unplaced.length === 0) continue

    const emptyInOrder = groupNames.filter(
      (groupId) => (groups[groupId] || [])[slotIndex] == null
    )
    if (emptyInOrder.length === 0) continue

    if (unplaced.length !== emptyInOrder.length) {
      return {
        error: 'Estado inconsistente: cupos libres y equipos del bolillero no coinciden.',
        done: true,
      }
    }

    // Orden TV: primero el grupo de letra más baja con cupo libre (B, luego C…), dentro de ese grupo equipo al azar.
    const tryTeams = shuffle([...unplaced])
    for (const groupId of emptyInOrder) {
      for (const team of tryTeams) {
        const groupSlots = groups[groupId] || []
        const valid = getValidTeamsForGroupSlot(potTeams, groupSlots, placedById, potId)
        if (!valid.some((t) => t.id === team.id)) continue

        const gState = cloneGroupsState(groups, groupNames)
        const pSet = new Set(placedById)
        gState[groupId][slotIndex] = team
        pSet.add(team.id)
        const rest = unplaced.filter((t) => t.id !== team.id)
        const restEmpty = emptyInOrder.filter((g) => g !== groupId)
        if (
          canCompletePotAssignments(gState, rest, restEmpty, slotIndex, potTeams, potId, pSet)
        ) {
          return { groupId, slotIndex, team }
        }
      }
    }

    return {
      error:
        'No hay forma de terminar este bolillero con las reglas de país (estado bloqueado). Reiniciá o corregí a mano.',
      done: true,
    }
  }
  return { done: true }
}
