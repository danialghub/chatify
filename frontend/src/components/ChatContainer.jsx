import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useRoomStore } from "@/store/useRoomStore";
import { formatChatTime } from '@/lib/helper'

import {
  PrivateChatHeader,
  GroupChatHeader,
  NoChatHistoryPlaceholder,
  MessagesLoadingSkeleton,
  MessageInput,
  Message
} from '@/components/index';
import useSocket from "../hooks/useSocket";

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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {!selectedRoom.isGroup
        ? <PrivateChatHeader />
        : <GroupChatHeader />
      }
      <div
        className="flex-1 px-3 pr-5 overflow-y-auto py-8 will-change-transform transform-gpu scroll-smooth chat-scrollbar" id="chatContainer"
        dir="rtl"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4 overflow-hidden">
            {messages.map((msg, idx) => {
              const isMyMessage = msg?.senderId?._id === authUser._id;
              const isFromSystem = msg.system
              const isStillSame = messages[idx + 1]?.senderId?._id === msg?.senderId?._id
              const isStillSystem = messages[idx - 1]?.system === isFromSystem


              return !isFromSystem ? (
                <Message
                  key={msg._id}
                  msg={msg}
                  isMyMessage={isMyMessage}
                  isGroup={selectedRoom.isGroup}
                  isStillSame={isStillSame}
                  goToMsg={goToMsg}
                  index={idx}
                />
              ) :
                (
                  <div key={msg._id} className="text-center text-white/80">
                    {!isStillSystem &&
                      <div className="text-xs my-0.5 mt-10">{formatChatTime(msg.createdAt)}</div>
                    }
                    <span className="px-4 py-1 text-sm bg-black/10 rounded">
                      {msg.text}
                    </span>
                  </div>
                )
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={selectedRoom?.user?.name || selectedRoom.name}
          />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
