import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

import {
  NoChatsFound, UsersLoadingSkeleton,ChatIcon
} from './index'
import { useRoomtStore } from "../store/useRoomStore";

const ChatsList = () => {
  const { onlineUsers } = useAuthStore();
  const {
    getPrivateChats, allPrivateChat, selectedRoom, setSelectedRoom, isRoomsLoading,
    subscribeToNewRoom, unSubscribeToNewRoom


  } = useRoomtStore()

  useEffect(() => {
    getPrivateChats();
  }, [getPrivateChats]);

  useEffect(() => {
    subscribeToNewRoom()
    console.log(selectedRoom);
    
    return () => unSubscribeToNewRoom()
  }, [])

  if (isRoomsLoading) return <UsersLoadingSkeleton />;
  if (allPrivateChat.length === 0) 
    return <NoChatsFound title="هیچ مخاطبی وجود ندارد" type="مخاطب" />;

  return (
    <>
      {allPrivateChat.map((chat) => {
        const user = chat.user

        return (
          <div
            key={chat._id}
            className={`${selectedRoom?._id === chat._id ? "bg-cyan-500/30" : "bg-cyan-900/5"} py-2 px-4 rounded-lg cursor-pointer hover:bg-cyan-500/30 transition-color`}
            onClick={() => setSelectedRoom(chat)}
          >
            <div className="flex items-center justify-between">
              {/* left side */}
              <div className="flex items-center gap-3">
                <div className={`avatar ${onlineUsers.includes(user._id) ? "online" : "offline"}`}>
                    
                    <ChatIcon 
                    profile={user.profilePic}
                    name={user.name}
                    classProps="size-12"
                    />
                 
                </div>
                <h4 className="text-slate-200 font-medium truncate">{user.name}</h4>
              </div>
              {/* right side */}
              <div className="size-0 p-3.5 bg-indigo-900 text-xs rounded-md flex items-center justify-center font-bold">11</div>
            </div>
          </div>
        )
      })}
    </>
  );
}
export default ChatsList;
