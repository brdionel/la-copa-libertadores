/**
 * Cálculo exacto de probabilidades de rivales (sin simulaciones).
 * Dado un equipo objetivo (ej. Boca), calcula la chance de que cada equipo
 * de cada bolillero termine en el mismo grupo, según restricciones (país, fase preliminar).
 */

function getGroupContainingTeam(groups, teamId) {
  for (const [groupId, slots] of Object.entries(groups)) {
    if ((slots || []).some((t) => t && t.id === teamId)) return groupId
  }
  return null
}

function getCountriesInGroup(slots) {
  return (slots || []).filter(Boolean).map((t) => t.country)
}

// Misma regla en todos los bombos: un país por grupo, salvo si entra o ya está un clasificado Fase 3 (repechaje)
function canPlaceInGroup(team, groupSlots) {
  const countriesInGroup = getCountriesInGroup(groupSlots)
  if (!countriesInGroup.includes(team.country)) return true
  return (
    team.fromPreliminar === true ||
    groupSlots.some((t) => t && t.country === team.country && t.fromPreliminar)
  )
}

/**
 * Equipos del bolillero que aún pueden ir al grupo (no colocados y pasan regla de país).
 */
export function getValidTeamsForGroupSlot(potTeams, groupSlots, placedById, potId) {
  return potTeams.filter(
    (t) =>
      !placedById.has(t.id) && canPlaceInGroup(t, groupSlots)
  )
}

/**
 * Probabilidad de que un equipo específico salga en el slot del grupo (uniforme entre válidos).
 */
export function probabilityFacingTeam({ potTeams, groupSlots, placedById, potId, teamId }) {
  const valid = getValidTeamsForGroupSlot(potTeams, groupSlots, placedById, potId)
  if (valid.length === 0) return 0
  const isInValid = valid.some((t) => t.id === teamId)
  return isInValid ? 1 / valid.length : 0
}

/**
 * Para un equipo objetivo (ej. Boca), devuelve las probabilidades por bolillero.
 * - targetTeamId: id del equipo del que queremos "vs quién puede caer"
 * Devuelve: { B: { b1: 0.125, b2: 0, ... }, C: {...}, D: {...} }
 * y por bolillero el total de válidos para mostrar "8 posibles → 12.5%"
 */
export function getDrawProbabilitiesForTarget(groups, pots, placedById, targetTeamId) {
  const groupId = getGroupContainingTeam(groups, targetTeamId)
  if (!groupId) return null

  const groupSlots = groups[groupId] || []
  const result = { byPot: {}, validCountByPot: {} }

  for (const potId of ['B', 'C', 'D']) {
    const potTeams = pots[potId] || []
    const valid = getValidTeamsForGroupSlot(potTeams, groupSlots, placedById, potId)
    const count = valid.length
    result.validCountByPot[potId] = count
    const probEach = count > 0 ? 1 / count : 0
    const byTeam = {}
    potTeams.forEach((t) => {
      byTeam[t.id] = valid.some((v) => v.id === t.id) ? probEach : 0
    })
    result.byPot[potId] = byTeam
  }

  return result
}

/**
 * Probabilidad de que caiga alguno de los equipos "deseados" (por país o ids).
 * desiredCountryNames: ej. ['Brasil','Perú'] → sumamos prob de todos los de esos países.
 */
export function probabilityDesiredRivals(byPot, potTeams, desiredCountryNames) {
  if (!desiredCountryNames || desiredCountryNames.length === 0) return null
  let sum = 0
  potTeams.forEach((t) => {
    if (desiredCountryNames.includes(t.country)) sum += byPot[t.id] || 0
  })
  return sum
}
