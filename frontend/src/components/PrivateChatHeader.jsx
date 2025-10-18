import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRoomtStore } from "../store/useRoomStore";
import { ChatIcon } from './index'


const PrivateChatContainer = () => {
  const { selectedRoom, setSelectedRoom, leaveRoom } = useRoomtStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedRoom.user._id)


  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") leaveRoom()
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedRoom]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >

      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"} `}>

          <ChatIcon
            profile={selectedRoom.user?.profilePic}
            name={selectedRoom.user.name}
            classProps="size-12"
          />

        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedRoom.user.name }</h3>
          <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <button onClick={leaveRoom}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default PrivateChatContainer;
