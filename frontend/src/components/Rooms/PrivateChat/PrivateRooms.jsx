import { memo, useEffect } from "react";
import { AnimatePresence } from 'framer-motion'
import { NoChatsFound, UsersLoadingSkeleton, Room } from '@/components/index'
import { useRoomStore } from "@/store/useRoomStore";
import useSocket from "@/hooks/useSocket";
import { useAuthStore } from "@/store/useAuthStore";

const PrivateRooms = memo(() => {
  const { getRooms, privateRooms, isRoomsLoading, addToRooms } = useRoomStore()
  const { authUser } = useAuthStore()

  useSocket('room:new', addToRooms)

  useEffect(() => {
    getRooms({ isGroup: false });
  }, [getRooms]);


  if (isRoomsLoading) return <UsersLoadingSkeleton />;
  if (privateRooms.length === 0)
    return <NoChatsFound title="هیچ مخاطبی وجود ندارد" type="مخاطب پیدا کن" modalType="SearchingRooms" />;

  return (
    <AnimatePresence >
      {privateRooms.map((room) => {
        const user = room.otherMember

        return (
          < Room
            key={room._id}
            room={room}
            name={user.name}
            logo={user.profilePic}
            userId={user._id}
          />
        )
      })}
    </AnimatePresence>
  );
})
export default PrivateRooms;
