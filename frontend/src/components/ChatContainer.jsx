import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useRoomtStore } from "../store/useRoomStore";
import {
  PrivateChatHeader,
  GroupChatHeader,
  NoChatHistoryPlaceholder,
  MessagesLoadingSkeleton,
  MessageInput,
  Message
} from "./index";

const ChatContainer = () => {

  const {
    getMessagesByRoomId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const { selectedRoom } = useRoomtStore();
  const messageEndRef = useRef(null);
  const isPrivateChat = selectedRoom.type === "private"

  // 📩 گرفتن پیام‌ها
  useEffect(() => {
    if (!selectedRoom?._id) return;

    getMessagesByRoomId(selectedRoom._id);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedRoom,
    getMessagesByRoomId,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // 🔽 اسکرول خودکار
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {isPrivateChat
        ? <PrivateChatHeader />
        : <GroupChatHeader/>
      }


      <div
        className="flex-1 px-3 pr-5 overflow-y-auto py-8 will-change-transform transform-gpu scroll-smooth chat-scrollbar"
        dir="rtl"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => {
              const isMyMessage = msg.senderId._id === authUser._id;

              return (
                <Message
                  key={msg._id}
                  msg={msg}
                  isMyMessage={isMyMessage}
                  isGroup={selectedRoom.type === "group"}
                />
              );
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
