import { useEffect } from "react";
import { AnimatePresence } from 'framer-motion'
import { NoChatsFound, UsersLoadingSkeleton, Room } from './index'
import { useRoomStore } from "../store/useRoomStore";
import useSocket from "../hooks/useSocket";

const PrivateRooms = () => {
  const { getPrivateChats, allPrivateChat, isRoomsLoading,addToRooms } = useRoomStore()

  useSocket('room:new', addToRooms)

  useEffect(() => {
    getPrivateChats();
  }, [getPrivateChats]);


  if (isRoomsLoading) return <UsersLoadingSkeleton />;
  if (allPrivateChat.length === 0)
    return <NoChatsFound title="هیچ مخاطبی وجود ندارد" type="مخاطب پیدا کن" modalType="sendRequest" />;

  return (
    <AnimatePresence >
      {allPrivateChat.map((room) => {
        const user = room.members.user

        return (
          < Room
            key={room._id}
            room={room}
            name={user.name}
            logo={user?.profilePic}
            userId={user._id}
          />
        )
      })}
    </AnimatePresence>
  );
}
export default PrivateRooms;
