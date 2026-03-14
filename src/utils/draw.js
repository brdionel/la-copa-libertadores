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

// Simula grupos después de colocar `team` en (targetGroupId, slotIndex). ¿Algún otro del bolillero se quedaría sin ningún grupo posible?
function wouldStrandAny(groups, groupNames, potTeams, team, targetGroupId, slotIndex, placedById, potId) {
  const nextGroups = {}
  groupNames.forEach((g) => {
    nextGroups[g] = [...(groups[g] || [null, null, null, null])]
  })
  nextGroups[targetGroupId][slotIndex] = team
  const nextPlaced = new Set()
  Object.values(nextGroups)
    .flat()
    .filter(Boolean)
    .forEach((t) => nextPlaced.add(t.id))
  const remaining = potTeams.filter((t) => !nextPlaced.has(t.id))
  for (const other of remaining) {
    let hasValid = false
    for (const gid of groupNames) {
      if ((nextGroups[gid] || [])[slotIndex] != null) continue
      const valid = getValidTeamsForGroupSlot(potTeams, nextGroups[gid], nextPlaced, potId)
      if (valid.some((t) => t.id === other.id)) {
        hasValid = true
        break
      }
    }
    if (!hasValid) return true
  }
  return false
}

/**
 * Un solo paso del sorteo: se elige un equipo al azar del bolillero actual
 * y se lo coloca en el primer grupo (A, B, C…) donde sea válido y donde
 * ningún otro equipo del bolillero quede sin ningún grupo posible.
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

    const team = unplaced[Math.floor(Math.random() * unplaced.length)]
    for (const groupId of emptyInOrder) {
      const groupSlots = groups[groupId] || []
      const valid = getValidTeamsForGroupSlot(potTeams, groupSlots, placedById, potId)
      if (!valid.some((t) => t.id === team.id)) continue
      if (wouldStrandAny(groups, groupNames, potTeams, team, groupId, slotIndex, placedById, potId))
        continue
      return { groupId, slotIndex, team }
    }
    return { error: 'No hay grupo válido para este equipo sin dejar a otro sin opción.', done: true }
  }
  return { done: true }
}
