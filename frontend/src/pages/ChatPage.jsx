import { useState } from "react";
import {
  BorderAnimatedContainer, ProfileHeader, ActiveTabSwitch, PrivateRooms, GroupRooms, ChatContainer, NoConversationPlaceholder
} from '@/components/index'

import ChatSidebar from "@/components/ChatSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";
import ForwardOverlay from "../components/states/ForwardOverlay";
import { useChatStore } from "@/store/useChatStore";
import { ArrowLeft, Forward } from "lucide-react";

const ChatPage = () => {

  const { authUser } = useAuthStore();
  const { selectedRoom, activeTab, targetForwardRoom } = useRoomStore()
  const { forwardedMessage, setForwardMessage } = useChatStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const showRoomsOnMobile =
    !selectedRoom || (forwardedMessage && !targetForwardRoom);

  const showChatOnMobile =
    (selectedRoom && !forwardedMessage) || targetForwardRoom;


  return (
    <div
      id="appContainer"
      className="relative w-full sm:max-w-6xl h-[100dvh] sm:h-[95dvh] overflow-hidden">

      <BorderAnimatedContainer>

        {/*  SIDEBAR */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(prev => !prev)}
          user={authUser}
        />

        {/* LEFT SIDE */}
        <div
          className={`
    h-full bg-slate-800/50 backdrop-blur-sm flex flex-col
    w-full md:w-1/3
    ${!showRoomsOnMobile ? "max-md:hidden" : ""}
  `}
        >
          <ProfileHeader showSidebar={setIsSidebarOpen} />

          <div
            className={`sticky top-0 z-40 hidden
             ${forwardedMessage ? "max-sm:block" : "max-sm:hidden"}`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-b border-white/10">
              {/* Left */}
              <div className="flex items-center gap-2">
                <Forward className="w-4 h-4 text-sky-400" />
                <p className="text-sm font-medium text-white truncate">
                  Forward to...
                </p>
              </div>

              {/* Back */}
              <button
                onClick={() => setForwardMessage(null)}
                className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                بازگشت
              </button>
            </div>
          </div>

          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-2">
            {activeTab === "chats" ? <PrivateRooms /> : <GroupRooms />}
          </div>
        </div>

        {/* RIGHT SIDE */
          (
            <div
              className={`
    relative flex flex-col  backdrop-blur-sm
    w-full md:w-2/3  chat-bg 
    ${!showChatOnMobile ? "max-md:hidden" : ""}
  `}
            >
              {selectedRoom ? <ChatContainer /> : <NoConversationPlaceholder />}
              <ForwardOverlay />
            </div>
          )
        }
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;


