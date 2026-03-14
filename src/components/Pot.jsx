import { useDroppable } from '@dnd-kit/core'
import { TeamCard } from './TeamCard'
import { POT_LABEL } from '../data/teams'

export function Pot({
  title,
  teams,
  placedById,
  canDragFromPot = true,
  probabilityByTeamId,
  validCount,
  targetName,
  favoriteVsRest,
}) {
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
        <>
          <p className="pot__valid-count">
            {validCount} posibles → {validCount > 0 ? `${(100 / validCount).toFixed(1)}%` : '—'} c/u
          </p>
          {favoriteVsRest && favoriteVsRest.nValid > 0 && (
            <p className="pot__favorite-prob">
              <span className="pot__favorite-prob__fav">
                Favoritos (BR/CO/VE/EC): {(favoriteVsRest.pFavorite * 100).toFixed(1)}%
              </span>
              <span className="pot__favorite-prob__sep"> · </span>
              <span className="pot__favorite-prob__rest">
                Resto: {(favoriteVsRest.pRest * 100).toFixed(1)}%
              </span>
              <span className="pot__favorite-prob__meta">
                {' '}({favoriteVsRest.nFavorite} de {favoriteVsRest.nValid} equipos válidos)
              </span>
            </p>
          )}
        </>
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
