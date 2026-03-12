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

// Pueden coincidir dos del mismo país si alguno es de fase preliminar
function canPlaceInGroup(team, groups, groupId, slotIndex) {
  const slots = groups[groupId] || []
  const teamsInGroup = slots.filter(Boolean)
  const sameCountryTeams = teamsInGroup.filter((t) => t.country === team.country)
  if (sameCountryTeams.length === 0) return true
  const hasPreliminar = (t) => t.fromPreliminar === true
  return team.fromPreliminar || sameCountryTeams.some(hasPreliminar)
}

export function simulateDraw(pots, groupNames) {
  const groups = {}
  groupNames.forEach((name) => {
    groups[name] = [null, null, null, null]
  })

  // 1) Bolillero 1: cabezas de serie. Grupo A = campeón (Flamengo). B–H = sorteo con los otros 7.
  const potA = pots.A
  const campeon = potA.find((t) => t.id === CAMPEON_ID)
  const cabezasRestantes = shuffle(potA.filter((t) => t.id !== CAMPEON_ID))
  if (!campeon) return { error: 'No se encontró el campeón en el bolillero 1.', groups: null }

  groups.A[0] = campeon
  const otherGroups = groupNames.filter((g) => g !== 'A')
  otherGroups.forEach((groupId, i) => {
    groups[groupId][0] = cabezasRestantes[i]
  })

  // 2) Bolilleros 2, 3 y 4: en cada slot se elige un equipo que quepa y que no deje a otro sin grupo posible
  for (let slotIndex = 1; slotIndex < 4; slotIndex++) {
    const potId = POT_ORDER[slotIndex]
    const potTeams = pots[potId] || []
    const usedTeamIds = new Set()

    for (const groupId of groupNames) {
      const placedById = new Set()
      Object.values(groups).flat().filter(Boolean).forEach((t) => placedById.add(t.id))
      const valid = getValidTeamsForGroupSlot(potTeams, groups[groupId], placedById, potId)
      const available = shuffle(valid.filter((t) => !usedTeamIds.has(t.id)))
      let chosen = null
      for (const team of available) {
        if (wouldStrandAny(groups, groupNames, potTeams, team, groupId, slotIndex, placedById, potId)) continue
        chosen = team
        break
      }
      if (!chosen && available.length > 0) chosen = available[0]
      if (!chosen) {
        return {
          error: 'No se pudo completar el sorteo (restricción de países / fase preliminar). Intentá de nuevo.',
          groups: null,
        }
      }
      groups[groupId][slotIndex] = chosen
      usedTeamIds.add(chosen.id)
    }
  }

  return { groups, error: null }
}

// Simula grupos después de colocar `team` en (targetGroupId, slotIndex). ¿Algún otro del bolillero se quedaría sin ningún grupo posible?
function wouldStrandAny(groups, groupNames, potTeams, team, targetGroupId, slotIndex, placedById, potId) {
  const nextGroups = {}
  groupNames.forEach((g) => {
    nextGroups[g] = [...(groups[g] || [null, null, null, null])]
  })
  nextGroups[targetGroupId][slotIndex] = team
  const nextPlaced = new Set()
  Object.values(nextGroups).flat().filter(Boolean).forEach((t) => nextPlaced.add(t.id))
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
  Object.values(groups).flat().filter(Boolean).forEach((t) => placedById.add(t.id))

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
      if (wouldStrandAny(groups, groupNames, potTeams, team, groupId, slotIndex, placedById, potId)) continue
      return { groupId, slotIndex, team }
    }
    return { error: 'No hay grupo válido para este equipo sin dejar a otro sin opción.', done: true }
  }
  return { done: true }
}
