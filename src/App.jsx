import { useState, useMemo, useRef, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  pots,
  GROUP_NAMES,
  POT_ORDER,
  POT_LABEL,
  TARGET_TEAM_ID_PROB,
  FAVORITE_RIVAL_COUNTRIES,
} from './data/teams'
import { Pot } from './components/Pot'
import { Group } from './components/Group'
import { TeamCard } from './components/TeamCard'
import { BocaRivalsPanel } from './components/BocaRivalsPanel'
import { simulateDraw, getNextDrawStep } from './utils/draw'
import { getDrawProbabilitiesForTarget } from './utils/probability'
import './App.css'

function getInitialGroups() {
  const g = {}
  GROUP_NAMES.forEach((name) => {
    g[name] = [null, null, null, null]
  })
  return g
}

// Un país por grupo; excepción: Fase 3 (repechaje) — si el que colocamos o alguno ya en el grupo con ese país es fromPreliminar
function canPlaceCountrywise(team, groups, groupId) {
  const row = groups[groupId] || []
  const sameCountry = row.filter((t) => t && t.country === team.country)
  if (sameCountry.length === 0) return true
  return team.fromPreliminar === true || sameCountry.some((t) => t.fromPreliminar === true)
}

function getGroupContainingTeamId(groups, teamId, excludeGroupId) {
  for (const [name, slots] of Object.entries(groups)) {
    if (name === excludeGroupId) continue
    const has = (slots || []).some((t) => t && t.id === teamId)
    if (has) return name
  }
  return null
}

function getSlotOfTeam(groups, teamId) {
  for (const [groupId, slots] of Object.entries(groups)) {
    const idx = (slots || []).findIndex((t) => t && t.id === teamId)
    if (idx >= 0) return { groupId, slotIndex: idx }
  }
  return null
}

// Regla país en el grupo considerando que vamos a poner `team` en `slotIndex` (el resto del grupo son los otros slots)
function canPlaceInSlot(team, groups, groupId, slotIndex) {
  const row = groups[groupId] || []
  const others = row.filter((t, i) => i !== slotIndex && t)
  const sameCountry = others.filter((t) => t.country === team.country)
  if (sameCountry.length === 0) return true
  return team.fromPreliminar === true || sameCountry.some((t) => t.fromPreliminar === true)
}

// Primer grupo (A→H) con ese slot vacío donde el equipo puede ir (regla país)
function findFirstValidGroupForSlot(team, slotIndex, groups, groupNames) {
  for (const groupId of groupNames) {
    const row = groups[groupId] || []
    if (row[slotIndex] != null) continue
    if (!canPlaceInSlot(team, groups, groupId, slotIndex)) continue
    return groupId
  }
  return null
}

// Simula el estado de grupos después de colocar `team` en (targetGroupId, slotIndex); verifica que los demás del bolillero sigan teniendo algún grupo posible
function wouldStrandRemainingTeams(groups, team, targetGroupId, slotIndex, potId, groupNames) {
  const nextGroups = {}
  groupNames.forEach((g) => {
    nextGroups[g] = [...(groups[g] || [null, null, null, null])]
  })
  const currentSlot = getSlotOfTeam(groups, team.id)
  if (currentSlot) nextGroups[currentSlot.groupId][currentSlot.slotIndex] = null
  nextGroups[targetGroupId][slotIndex] = team
  const potTeams = pots[potId] || []
  const placedAfter = new Set(Object.values(nextGroups).flat().filter(Boolean).map((t) => t.id))
  const remainingInPot = potTeams.filter((t) => !placedAfter.has(t.id))
  for (const other of remainingInPot) {
    if (findFirstValidGroupForSlot(other, slotIndex, nextGroups, groupNames) === null) return other
  }
  return null
}

const TOAST_ERROR_HINTS = [
  'No puede',
  'Este slot',
  'ya está',
  'solo puede',
  'No hay',
  'Si colocás',
  'Solo podés',
  'No se pudo',
  'demasiados',
  'ningún grupo',
  'completar',
]

function App() {
  const [groups, setGroups] = useState(getInitialGroups)
  const [activeTeam, setActiveTeam] = useState(null)
  const [message, setMessage] = useState(null)
  const toastTimerRef = useRef(null)

  const showToast = useCallback((text, ms = 2500) => {
    if (!text) return
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setMessage(text)
    toastTimerRef.current = setTimeout(() => {
      setMessage(null)
      toastTimerRef.current = null
    }, ms)
  }, [])

  const placedById = useMemo(() => {
    const set = new Set()
    Object.values(groups).flat().filter(Boolean).forEach((t) => set.add(t.id))
    return set
  }, [groups])

  const potUnlocked = useMemo(() => {
    const allFrom = (key) => (pots[key] || []).every((t) => placedById.has(t.id))
    return {
      A: true,
      B: allFrom('A'),
      C: allFrom('A') && allFrom('B'),
      D: allFrom('A') && allFrom('B') && allFrom('C'),
    }
  }, [placedById])

  const currentPotId = useMemo(() => {
    return POT_ORDER.find(
      (key) => potUnlocked[key] && (pots[key] || []).some((t) => !placedById.has(t.id))
    )
  }, [potUnlocked, placedById])

  const targetTeam = useMemo(() => {
    for (const pot of Object.values(pots)) {
      const t = pot.find((x) => x.id === TARGET_TEAM_ID_PROB)
      if (t) return t
    }
    return null
  }, [])

  const probabilities = useMemo(
    () =>
      getDrawProbabilitiesForTarget(
        groups,
        pots,
        placedById,
        TARGET_TEAM_ID_PROB,
        FAVORITE_RIVAL_COUNTRIES
      ),
    [groups, placedById]
  )

  // Mouse: arrastre inmediato. Touch (Android/iOS): mantener ~200ms y luego arrastrar (evita que el scroll se coma el gesto)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 12 },
    })
  )

  const handleDragStart = (event) => {
    setActiveTeam(event.active.data.current?.team ?? null)
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setMessage(null)
  }

  const handleDragEnd = (event) => {
    setActiveTeam(null)
    const { active, over } = event
    if (!over) return

    const team = active.data.current?.team
    if (!team) return

    const overData = over.data.current ?? {}

    // Devolver al bolillero: soltar sobre el pot correspondiente
    if (overData.type === 'pot') {
      if (team.pot !== overData.potId) {
        showToast(`Solo podés devolver equipos al mismo bolillero (${POT_LABEL[team.pot]}).`, 3200)
        return
      }
      const current = getSlotOfTeam(groups, team.id)
      if (!current) return
      setGroups((prev) => {
        const next = { ...prev }
        const row = [...(next[current.groupId] || [null, null, null, null])]
        row[current.slotIndex] = null
        next[current.groupId] = row
        return next
      })
      showToast(`${team.name} devuelto al ${POT_LABEL[team.pot]}.`)
      return
    }

    // Soltar en un slot de grupo
    const { groupId, slotIndex, expectedPot } = overData
    if (groupId == null || expectedPot == null) return

    if (team.pot !== expectedPot) {
      showToast(`Este slot es para un equipo del ${POT_LABEL[expectedPot]}.`, 3200)
      return
    }

    let targetGroupId = groupId
    const targetValid = canPlaceInSlot(team, groups, groupId, slotIndex)
    if (!targetValid) {
      targetGroupId = findFirstValidGroupForSlot(team, slotIndex, groups, GROUP_NAMES)
      if (!targetGroupId) {
        showToast(`No hay grupo posible para ${team.name} en este slot (restricción de país).`, 3500)
        return
      }
    }

    const stranded = wouldStrandRemainingTeams(groups, team, targetGroupId, slotIndex, expectedPot, GROUP_NAMES)
    if (stranded) {
      showToast(
        `Si colocás ${team.name} acá, ${stranded.name} no tendría ningún grupo posible. Colocá primero a ${stranded.name} en un grupo válido.`,
        4000
      )
      return
    }

    const currentSlot = getSlotOfTeam(groups, team.id)
    setGroups((prev) => {
      const next = { ...prev }
      if (currentSlot) {
        const oldRow = [...(next[currentSlot.groupId] || [null, null, null, null])]
        oldRow[currentSlot.slotIndex] = null
        next[currentSlot.groupId] = oldRow
      }
      const row = [...(next[targetGroupId] || [null, null, null, null])]
      row[slotIndex] = team
      next[targetGroupId] = row
      return next
    })
    if (targetGroupId !== groupId) {
      showToast(`${team.name} no podía ir en el Grupo ${groupId} → asignado al Grupo ${targetGroupId}`)
    } else if (currentSlot) {
      showToast(`${team.name} → Grupo ${targetGroupId}`)
    }
  }

  const handleSimulateDraw = () => {
    const result = simulateDraw(pots, GROUP_NAMES)
    if (result.error) {
      showToast(result.error, 4000)
      return
    }
    setGroups(result.groups)
    showToast('Sorteo simulado correctamente.', 2800)
  }

  const handleReset = () => {
    setGroups(getInitialGroups())
    showToast('Sorteo reiniciado.')
  }

  const handleNextStep = () => {
    const step = getNextDrawStep(groups, pots, GROUP_NAMES)
    if (step.done) {
      showToast(step.error || 'Sorteo completo.', step.error ? 4000 : 2500)
      return
    }
    setGroups((prev) => {
      const next = { ...prev }
      const row = [...(next[step.groupId] || [null, null, null, null])]
      row[step.slotIndex] = step.team
      next[step.groupId] = row
      return next
    })
    showToast(`${step.team.name} → Grupo ${step.groupId}`)
  }

  const toastIsError = message && TOAST_ERROR_HINTS.some((h) => message.includes(h))

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">LA GLORIA ETERNA</h1>
          <p className="app__mobile-hint">
            En celular: <strong>mantené pulsado</strong> un equipo un instante y después <strong>arrastrá</strong> al grupo.
          </p>
          <div className="app__actions">
            <button type="button" className="btn btn--primary" onClick={handleSimulateDraw}>
              Simular sorteo
            </button>
            <button type="button" className="btn btn--secondary" onClick={handleNextStep}>
              Sortear siguiente
            </button>
            <button type="button" className="btn btn--secondary" onClick={handleReset}>
              Reiniciar
            </button>
          </div>
        </header>

        <div className="app__main">
          <section className="groups-section">
            <div className="groups">
              {GROUP_NAMES.map((name) => (
                <Group key={name} name={name} teams={groups[name]} />
              ))}
            </div>
            
          </section>

          <section className="pots-section">
            <div className="pots">
              {currentPotId ? (
                <Pot
                  key={currentPotId}
                  title={currentPotId}
                  teams={pots[currentPotId]}
                  placedById={placedById}
                  canDragFromPot={potUnlocked[currentPotId]}
                  probabilityByTeamId={probabilities?.byPot[currentPotId]}
                  validCount={probabilities?.validCountByPot[currentPotId]}
                  favoriteVsRest={probabilities?.favoriteVsRestByPot?.[currentPotId]}
                  targetName={targetTeam?.name}
                />
              ) : (
                <p className="pots-section__complete">Sorteo completo</p>
              )}
            </div>
          </section>

          <section>
          <BocaRivalsPanel groups={groups} groupNames={GROUP_NAMES} />
          </section>
        </div>
      </div>

      {message ? (
        <div
          className={`toast ${toastIsError ? 'toast--error' : ''}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
        </div>
      ) : null}

      <DragOverlay>
        {activeTeam ? (
          <div className="team-card team-card--overlay">
            <div className="team-card__badge-wrap" title={activeTeam.country}>
              <img src={activeTeam.badge} alt="" className="team-card__badge" />
              <img src={activeTeam.flag} alt={activeTeam.country} className="team-card__flag" />
            </div>
            <div className="team-card__info">
              <span className="team-card__name">{activeTeam.name}</span>
              {activeTeam.city && <span className="team-card__city">{activeTeam.city}</span>}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default App
