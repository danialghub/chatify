import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";
import { useChatStore } from "@/store/useChatStore";
import { ChatIcon } from '@/components/index'
import { LoaderIcon } from "react-hot-toast";


const ChatContainer = () => {
  const { selectedRoom, setSelectedRoom } = useRoomStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { openModal } = useChatStore();
  const isGroup = selectedRoom.isGroup
  const user = selectedRoom?.otherMember
  const isOnline =!isGroup && onlineUsers.includes(user._id)
  const name = isGroup ? selectedRoom.name : user.name
  const logo = isGroup ? selectedRoom.logo : user.profilePic
  const additionalInfo = isGroup
    ? `${selectedRoom.members.length} عضو`
    : isOnline ? "آنلاین" : "آفلاین"
  const room = isGroup ? selectedRoom : user

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedRoom(null)
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
            profile={logo}
            name={name}
            classProps="!size-12 cursor-pointer"
            onClick={() => openModal("RoomInfo", { isGroup, informations: room })}
          />

        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{name}</h3>
          <p className="text-slate-400 text-sm">{additionalInfo}</p>
        </div>
      </div>
      <button>
        <XIcon size={30}
          onClick={() => setSelectedRoom(null)}
        />
      </button>

    </div>
  );
}
export default ChatContainer;
