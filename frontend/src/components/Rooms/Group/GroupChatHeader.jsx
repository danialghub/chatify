import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useRoomStore } from "@/store/useRoomStore";
import { useChatStore } from "@/store/useChatStore";
import { ChatIcon } from '@/components/index'


const GroupChatHeader = () => {
    const { selectedRoom, setSelectedRoom } = useRoomStore();
    const { setModalType } = useChatStore();

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
                <div>

                    <ChatIcon
                        profile={selectedRoom?.logo}
                        name={selectedRoom.name}
                        classProps="size-12 cursor-pointer"
                        onClick={() => setModalType("groupInfo")}
                    />

                </div>

                <div>
                    <h3 className="text-slate-200 font-medium">{selectedRoom.name}</h3>
                    <p className="text-slate-400 text-sm text-center" dir="rtl">
                        {`${selectedRoom.members.length} عضو`}
                    </p>
                </div>
            </div>

            <button onClick={() => setSelectedRoom(null)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
            </button>
        </div>
    );
}
export default GroupChatHeader;
