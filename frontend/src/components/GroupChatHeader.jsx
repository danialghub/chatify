import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useRoomtStore } from "../store/useRoomStore";
import { ChatIcon, GroupInfoModal } from '../components/index'
import useModal from "../hooks/useModal";

const GroupChatHeader = () => {
    const { selectedRoom, setSelectedRoom, leaveRoom } = useRoomtStore();
    const [showGroupInfo, toggleGroupInfo] = useModal()


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

            <GroupInfoModal
                room={selectedRoom}
                isOpen={showGroupInfo}
                onClose={toggleGroupInfo}
            />


            <div className="flex items-center space-x-3">
                <div>

                    <ChatIcon
                        profile={selectedRoom?.logo}
                        name={selectedRoom.name}
                        classProps="size-12"
                        onClick={toggleGroupInfo}
                    />

                </div>

                <div>
                    <h3 className="text-slate-200 font-medium">{selectedRoom.name}</h3>
                    <p className="text-slate-400 text-sm">
                        {`${selectedRoom.members.length} members`}
                    </p>
                </div>
            </div>

            <button onClick={leaveRoom}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
            </button>
        </div>
    );
}
export default GroupChatHeader;
