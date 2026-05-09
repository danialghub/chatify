import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useRoomStore } from "@/store/useRoomStore";

import { ChevronDown } from "lucide-react"
import {
  PrivateChatHeader,
  GroupChatHeader,
  NoChatHistoryPlaceholder,
  MessagesLoadingSkeleton,
  MessageInput,
  MessageList
} from '@/components/index';
import useSocket from "@/hooks/useSocket";

const ChatContainer = () => {

  const {
    getMessagesByRoomId,
    checkMessageAsSeen,
    messages,
    isMessagesLoading,
    addToMessages,
    removeFromMessages,

  } = useChatStore();

  const { authUser } = useAuthStore();
  const { selectedRoom } = useRoomStore();

  //گوش دادن به پیام جدید
  useSocket('message:send', addToMessages)
  useSocket('message:remove', removeFromMessages)

  const messageEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  


  // 📩 گرفتن پیام‌ها
  useEffect(() => {
    if (!selectedRoom?._id) return;
    checkMessageAsSeen(selectedRoom._id)
    getMessagesByRoomId(selectedRoom._id);
  }, [

    getMessagesByRoomId,
  ]);

  // 🔽 اسکرول خودکار
  useEffect(() => {

    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

  }, [isMessagesLoading]);

  useEffect(() => {
    const container = document.getElementById("chatContainer");
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      // اگر 200px یا بیشتر از پایین فاصله گرفت → دکمه ظاهر شود
      setShowScrollBtn(distanceFromBottom > 400);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      {selectedRoom.isGroup ? <GroupChatHeader /> : <PrivateChatHeader />}

      <div
        id="chatContainer"
        className="
        flex-1 px-3 pr-5 overflow-y-auto py-8
        will-change-transform transform-gpu
        scroll-smooth chat-scrollbar relative
      "
        dir="rtl"
      >
        {!isMessagesLoading && messages.length > 0 ? (
          <MessageList
            messages={messages}
            authUser={authUser}
            selectedRoom={selectedRoom}
            textareaRef={textareaRef}
            messageEndRef={messageEndRef}
          />
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={selectedRoom?.user?.name || selectedRoom.name}
          />
        )}
      </div>

      {showScrollBtn && (
        <button
          onClick={() =>
            document.getElementById("chatContainer")?.scrollTo({
              top: document.getElementById("chatContainer").scrollHeight,
              behavior: "smooth",
            })
          }
          className="
          absolute w-10 bottom-32 left-6
          p-2 rounded-full
          backdrop-blur-xl bg-white/10
          shadow-lg shadow-black/30
          border border-white/20
          hover:bg-white/20
          transition-all duration-300
          hover:scale-110 active:scale-95
        "
        >
          <ChevronDown className="w-6 h-6 text-white drop-shadow" />
        </button>
      )}

      <MessageInput textareaRef={textareaRef} />
    </>
  );

}

export default ChatContainer;
