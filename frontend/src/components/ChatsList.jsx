import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import {
  NoChatsFound, UsersLoadingSkeleton
} from './index'

const ChatsList = () => {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`${selectedUser?._id === chat._id ? "bg-cyan-500/30" : "bg-cyan-500/5"} py-2 px-4 rounded-lg cursor-pointer hover:bg-cyan-500/30 transition-color`}
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center justify-between">
            {/* left side */}
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.name} />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{chat.name}</h4>
            </div>
            {/* right side */}
            <div className="size-0 p-3.5 bg-indigo-900 text-xs rounded-md flex items-center justify-center font-bold">11</div>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
