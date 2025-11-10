import { useState } from "react";
import {
  BorderAnimatedContainer, ProfileHeader, ActiveTabSwitch, PrivateRooms, GroupRooms, ChatContainer, NoConversationPlaceholder
} from '@/components/index'

import ChatSidebar from "@/components/ChatSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";


const ChatPage = () => {

  const { authUser } = useAuthStore();
  const {selectedRoom,activeTab } = useRoomStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="relative w-full sm:max-w-6xl h-screen sm:h-[95vh] overflow-hidden">

      <BorderAnimatedContainer>

        {/*  SIDEBAR */}
          <ChatSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(prev => !prev)}
            user={authUser}
          />
        
        {/* LEFT SIDE */}
        <div
          className={`h-full bg-slate-800/50 backdrop-blur-sm flex flex-col w-full md:w-1/3 ${selectedRoom && "max-md:hidden w-full"}`}
        >
          <ProfileHeader showSidebar={setIsSidebarOpen} />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <PrivateRooms /> : <GroupRooms />}
          </div>
        </div>

        {/* RIGHT SIDE */
          (
            <div
              className={`flex flex-col bg-slate-900/50 backdrop-blur-sm w-full md:w-2/3 ${!selectedRoom && "max-md:hidden"}`}
            >
              {selectedRoom ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          )
        }
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;


