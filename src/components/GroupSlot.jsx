import { useDroppable } from '@dnd-kit/core'
import { TeamCard } from './TeamCard'
import { POT_LABEL } from '../data/teams'

const POT_FOR_SLOT = ['A', 'B', 'C', 'D']

export function GroupSlot({ groupId, slotIndex, team }) {
  const expectedPot = POT_FOR_SLOT[slotIndex]
  const droppableId = `slot-${groupId}-${slotIndex}`

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { groupId, slotIndex, expectedPot },
  })

  return (
    <div
      ref={setNodeRef}
      className={`group-slot ${isOver ? 'group-slot--over' : ''} ${team ? 'group-slot--filled' : ''}`}
      data-slot-pot={expectedPot}
    >
      {team ? (
        <TeamCard team={team} isInGroup />
      ) : (
        <span className="group-slot__placeholder">
          {POT_LABEL[expectedPot]}
        </span>
      )}
    </div>
  )
}
