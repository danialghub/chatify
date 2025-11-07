import { memo, useEffect } from "react"
import { AnimatePresence } from 'framer-motion'
import { UsersLoadingSkeleton, NoChatsFound, Room } from '@/components/index'
import { useRoomStore } from "@/store/useRoomStore";
import useSocket from "@/hooks/useSocket";

const GroupRooms = memo(() => {
  const { groupRooms, getRooms, isRoomsLoading, addToRooms,updateGroupStates } = useRoomStore()

  useSocket('room:new', addToRooms)
  useSocket('room:update', updateGroupStates)

  useEffect(() => {
    getRooms({ isGroup: true });
  }, [getRooms]);

  if (isRoomsLoading) return <UsersLoadingSkeleton />;
  if (groupRooms.length === 0)
    return <NoChatsFound title="هیچ گروهی وجود ندارد" type="گروه ایجاد کن" modalType="GroupCreate" />;

  return (
    <AnimatePresence>
      {groupRooms.map((room) => (
        <Room
          key={room._id}
          room={room}
          name={room.name}
          logo={room?.logo}
        />
      ))}

    </AnimatePresence>
  );
})
export default GroupRooms;
