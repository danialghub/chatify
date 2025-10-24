import { useEffect } from "react"
import { AnimatePresence } from 'framer-motion'
import { UsersLoadingSkeleton, NoChatsFound, Room } from './index'
import { useRoomStore } from "../store/useRoomStore";
import useSocket from "../hooks/useSocket";

const GroupRooms = () => {
  const { allGroupChat, getAllGroups, isRoomsLoading, addToRooms } = useRoomStore()

  useSocket('room:new', addToRooms)

  useEffect(() => {
    getAllGroups();
  }, [getAllGroups]);

  if (isRoomsLoading) return <UsersLoadingSkeleton />;
  if (allGroupChat.length === 0)
    return <NoChatsFound title="هیچ گروهی وجود ندارد" type="گروه ایجاد کن" modalType="GroupCreate" />;

  return (
    <AnimatePresence>
      {allGroupChat.map((room) => (

        <Room
          key={room._id}
          room={room}
          name={room.name}
          logo={room?.logo}
        />
      ))}

    </AnimatePresence>
  );
}
export default GroupRooms;
