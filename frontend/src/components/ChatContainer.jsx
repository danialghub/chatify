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

  const goToMsg = (id) => {
    const targetMsgIdx = messages.findIndex(msg => msg._id === id);
    const targetMsg = document.getElementById(`msg_${targetMsgIdx}`);

    if (!targetMsg) return;

    // اسکرول به سمت پیام
    targetMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // ساخت observer برای تشخیص ورود به viewport
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // وقتی وارد viewport شد:
          targetMsg.classList.add('flash');

          setTimeout(() => {
            targetMsg.classList.remove('flash');
          }, 1000);

          // بعد از اجرا فقط یکبار نظارت کن
          observerInstance.disconnect();
        }
      },
      { threshold: 0.5 } // یعنی حداقل ۵۰٪ از المنت داخل دید باشه
    );

    observer.observe(targetMsg);
  };


  // 📩 گرفتن پیام‌ها
  useEffect(() => {
    if (!selectedRoom?._id) return;
    checkMessageAsSeen(selectedRoom._id)
    getMessagesByRoomId(selectedRoom._id);
  }, [
    selectedRoom,
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
          goToMsg={goToMsg}
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
