import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useRoomStore } from "@/store/useRoomStore";
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from "lucide-react"
import {
  PrivateChatHeader,
  GroupChatHeader,
  NoChatHistoryPlaceholder,
  MessagesLoadingSkeleton,
  MessageInput,
  MessageList,

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
  const chatContainerRef = useRef(null)

  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // 📩 گرفتن پیام‌ها
  useEffect(() => {
    if (!selectedRoom?._id) return;
    checkMessageAsSeen(selectedRoom._id)
    getMessagesByRoomId(selectedRoom._id);
  }, [
    selectedRoom?._id
  ]);

  // 🔽 اسکرول خودکار
  useEffect(() => {

    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

  }, [isMessagesLoading]);

  useEffect(() => {
    const container = chatContainerRef.current;
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

  console.log('chat cvontainer');

  return (
    <>

      {selectedRoom.isGroup ? <GroupChatHeader /> : <PrivateChatHeader />}

      <div
        id="chatContainer"
        ref={chatContainerRef}
        className="
        flex-1  overflow-y-auto overflow-x-hidden 
         chat-scrollbar relative will-change-transform h-full
      "
        dir="rtl"
      >

        {!isMessagesLoading && messages.length > 0 ? (
          <MessageList
            messages={messages}
            textareaRef={textareaRef}
            messageEndRef={messageEndRef}
            chatContainerRef={chatContainerRef}
          />
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={selectedRoom?.members.filter(m => m._id !== authUser._id)[0]?.name || selectedRoom.name}
          />
        )}
     
      </div>

      {showScrollBtn && (
        <AnimatePresence>
          <motion.button
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() =>
              document.getElementById("chatContainer")?.scrollTo({
                top: document.getElementById("chatContainer").scrollHeight,
                behavior: "smooth",
              })
            }
            className="
          absolute w-10 bottom-32 left-6
          p-2 rounded-full z-[999]
          backdrop-blur-xl bg-white/10
          shadow-lg shadow-black/30
          border border-white/20
          hover:bg-white/20
          transition-all duration-300
          hover:scale-110 active:scale-95
        "
          >
            <ChevronDown
              className="w-6 h-6 text-white drop-shadow" />
          </motion.button>
        </AnimatePresence>
      )}

      <MessageInput textareaRef={textareaRef} />


    </>
  );

}

export default ChatContainer;
