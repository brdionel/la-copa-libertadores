import { useDraggable } from '@dnd-kit/core'
import { FAVORITE_RIVAL_COUNTRIES, TARGET_TEAM_ID_PROB } from '../data/teams'

export function TeamCard({
  team,
  isInGroup = false,
  dragDisabled = false,
  probability,
  targetName,
  /** En el grupo de Boca: resaltar rivales favoritos (solo ahí) */
  favoriteInBocaGroup = false,
}) {
  const isBoca = team.id === TARGET_TEAM_ID_PROB
  const isFavoriteCountry = FAVORITE_RIVAL_COUNTRIES.includes(team.country)
  const isFavorite = !isInGroup ? isFavoriteCountry : favoriteInBocaGroup && isFavoriteCountry
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: team.id,
    data: { team, potId: team.pot },
    disabled: dragDisabled,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`team-card ${isInGroup ? 'team-card--in-slot' : 'team-card--draggable'} ${isDragging ? 'team-card--dragging' : ''} ${dragDisabled ? 'team-card--disabled' : ''} ${isFavorite ? 'team-card--favorite' : ''} ${isInGroup && isBoca ? 'team-card--boca' : ''}`}
      {...(dragDisabled ? {} : { ...listeners, ...attributes })}
    >
      <div className="team-card__badge-wrap" title={team.country}>
        <img src={team.badge} alt="" className="team-card__badge" />
        <img src={team.flag} alt={team.country} className="team-card__flag" />
      </div>
      <div className="team-card__info">
        <span className="team-card__name">{team.name}</span>
        {team.city && <span className="team-card__city">{team.city}</span>}
        {!isInGroup && probability != null && probability > 0 && targetName && (
          <span className={`team-card__prob ${isFavorite ? 'team-card__prob--favorite' : ''}`}>
            vs {targetName}: {(probability * 100).toFixed(1)}%
            {isFavorite ? ' ★' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
