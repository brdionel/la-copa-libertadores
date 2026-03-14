import { GroupSlot } from './GroupSlot'

export function Group({ name, teams }) {
  return (
    <div className="group">
      <div className="group__letter">{name}</div>
      <div className="group__slots">
        {[0, 1, 2, 3].map((slotIndex) => (
          <GroupSlot
            key={slotIndex}
            groupId={name}
            slotIndex={slotIndex}
            team={teams[slotIndex]}
          />
        ))}
      </div>
    </div>
  )
}
