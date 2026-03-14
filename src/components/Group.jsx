import { GroupSlot } from './GroupSlot'

export function Group({ name, teams, isBocaGroup = false }) {
  return (
    <div className={`group ${isBocaGroup ? 'group--boca' : ''}`}>
      <div className="group__letter">
        {name}
        {isBocaGroup && <span className="group__badge-boca" aria-hidden>Boca</span>}
      </div>
      <div className="group__slots">
        {[0, 1, 2, 3].map((slotIndex) => (
          <GroupSlot
            key={slotIndex}
            groupId={name}
            slotIndex={slotIndex}
            team={teams[slotIndex]}
            favoriteInBocaGroup={isBocaGroup}
          />
        ))}
      </div>
    </div>
  )
}
