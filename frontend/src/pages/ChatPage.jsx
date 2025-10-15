import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

import {
  BorderAnimatedContainer, ProfileHeader, ActiveTabSwitch, ChatsList, ContactList, ChatContainer, NoConversationPlaceholder
} from '../components/index'

import ChatSidebar from "../components/ChatSidebar";
import { useAuthStore } from "../store/useAuthStore";


const ChatPage = () => {
  const { activeTab, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [messageModal, setMessageModal] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="relative w-full max-w-6xl  h-[95vh] overflow-hidden">
    

      <BorderAnimatedContainer>
        
        {/* LEFT SIDEBAR */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(prev => !prev)}
          user={authUser}
        />

        {/* LEFT SIDE */}
        <div
          className={`h-full bg-slate-800/50 backdrop-blur-sm flex flex-col w-full md:w-1/3 ${selectedUser && "max-md:hidden w-full"}`}
        >
          <ProfileHeader showSidebar={setIsSidebarOpen} />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */
          (
            <div
              className={`flex flex-col bg-slate-900/50 backdrop-blur-sm w-full md:w-2/3 ${!selectedUser && "max-md:hidden"}`}
            >
              {selectedUser ? <ChatContainer setMessage={setMessageModal} /> : <NoConversationPlaceholder />}
            </div>
          )
        }


      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;


