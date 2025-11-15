import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";
import { useChatStore } from "@/store/useChatStore";
import { ChatIcon } from '@/components/index'
import { LoaderIcon } from "react-hot-toast";


const PrivateChatContainer = () => {
  const { selectedRoom, setSelectedRoom, removeRoom, isRemovingLoading } = useRoomStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { openModal } = useChatStore();
  const user = selectedRoom.members.filter(m => m._id !== authUser._id)[0]
  const isOnline = onlineUsers.includes(user._id)



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
            profile={user?.profilePic}
            name={user.name}
            classProps="!size-12"
          />

        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{user.name}</h3>
          <p className="text-slate-400 text-sm">{isOnline ? "آنلاین" : "آفلاین"}</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={() =>
            openModal(
              'Alert',
              {
                title: "حذف چت",
                onComplete: () => removeRoom(selectedRoom),
                size: "sm"
              })
          }
          disabled={isRemovingLoading}
          className="px-4 py-1 bg-red-500 text-white rounded disabled:bg-gray-600">
          {isRemovingLoading
            ? <div className="flex items-center justify-center">
              <LoaderIcon className="!size-6 animate-spin" />
            </div>
            : "حذف"
          }
        </button>
        <button onClick={() => setSelectedRoom(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default PrivateChatContainer;
