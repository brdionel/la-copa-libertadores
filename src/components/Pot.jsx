import { useDroppable } from '@dnd-kit/core'
import { TeamCard } from './TeamCard'
import { POT_LABEL } from '../data/teams'

export function Pot({ title, teams, placedById, canDragFromPot = true, probabilityByTeamId, validCount, targetName }) {
  const available = teams.filter((t) => !placedById.has(t.id))
  const showProb = targetName && probabilityByTeamId && ['B', 'C', 'D'].includes(title)
  const isLocked = !canDragFromPot

  const { isOver, setNodeRef } = useDroppable({
    id: `pot-${title}`,
    data: { type: 'pot', potId: title },
  })

  return (
    <div ref={setNodeRef} className={`pot ${isOver ? 'pot--over' : ''} ${isLocked ? 'pot--locked' : ''}`}>
      <h3 className="pot__title">{POT_LABEL[title]}</h3>
      {isLocked && (
        <p className="pot__locked-msg">Completá el bolillero anterior primero</p>
      )}
      {showProb && validCount != null && !isLocked && (
        <p className="pot__valid-count">{validCount} posibles → {validCount > 0 ? `${(100 / validCount).toFixed(1)}%` : '—'} cada uno</p>
      )}
      <div className="pot__teams">
        {available.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            dragDisabled={isLocked}
            probability={showProb ? probabilityByTeamId[team.id] : undefined}
            targetName={targetName}
          />
        ))}
      </div>
    </div>
  )
}
