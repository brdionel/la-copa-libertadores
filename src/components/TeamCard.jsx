import { useDraggable } from '@dnd-kit/core'
import { DESIRED_RIVAL_COUNTRIES } from '../data/teams'

export function TeamCard({ team, isInGroup = false, dragDisabled = false, probability, targetName }) {
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
      className={`team-card ${isInGroup ? 'team-card--in-slot' : 'team-card--draggable'} ${isDragging ? 'team-card--dragging' : ''} ${dragDisabled ? 'team-card--disabled' : ''}`}
      {...(dragDisabled ? {} : { ...listeners, ...attributes })}
    >
      <div className="team-card__badge-wrap" title={team.country}>
        <img src={team.badge} alt="" className="team-card__badge" />
        <img src={team.flag} alt={team.country} className="team-card__flag" />
      </div>
      <div className="team-card__info">
        <span className="team-card__name">{team.name}</span>
        {team.city && <span className="team-card__city">{team.city}</span>}
        {!isInGroup && probability != null && probability > 0 && targetName && DESIRED_RIVAL_COUNTRIES.includes(team.country) && (
          <span className="team-card__prob">vs {targetName}: {(probability * 100).toFixed(1)}%</span>
        )}
      </div>
    </div>
  )
}
