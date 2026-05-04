import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useRoomStore } from "@/store/useRoomStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  NoChatHistoryPlaceholder,
  MessagesLoadingSkeleton,
  MessageInput,
  MessageList,
  ChatHeader
} from "@/components/index";
import useSocket from "@/hooks/useSocket";
import { useFetchMessages } from "@/hooks/useMessage";
import { useQueryClient } from '@tanstack/react-query';
import { goToMsg } from "../lib/helper";
import ImageOverlayViewer from "./Messages/Files/ImageOverlayViewer";

const ChatContainer = () => {
  const { selectedRoom, updateRoomLastMessage } = useRoomStore();
  const { authUser } = useAuthStore();
  const { checkMessageAsSeen, targetForwardedMessage, setTargetForwardedMessage } = useChatStore();

  const queryClient = useQueryClient();
  const chatContainerRef = useRef(null);
  const messageEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isManualScroll, setIsManualScroll] = useState(false);

  // Fetch messages with useQuery
  const {
    data: messagesData,
    isLoading: isFetching,
  } = useFetchMessages(selectedRoom?._id);

  // Extract messages array from data
  const messages = useMemo(() => {
    if (!messagesData?.messages) return [];
    return messagesData.messages;
  }, [messagesData]);

  // ✅ اضافه کردن useEffect برای side effect
  // useEffect(() => {
  //   if (messagesData?.messages) {
  //     getMessagesByRoomId(messagesData.messages);
  //   }
  // }, [messagesData, getMessagesByRoomId]); // وابستگی‌ها

  // ===== WebSocket Handlers =====
  const handleNewMessage = useCallback(({ roomId, messages }) => {

    if (roomId !== selectedRoom?._id) return;
    checkMessageAsSeen(selectedRoom._id)

    queryClient.setQueryData(['messages', roomId], (old) => {
      if (!old?.messages) return old;


      // Add new message to the beginning of the array
      return {
        ...old,
        messages: [...old.messages, ...messages]
      };
    });
  }, [selectedRoom?._id, queryClient]);

  const handleRemoveMessage = useCallback(({ msgId, room }) => {

    queryClient.setQueryData(['messages', room._id], (old) => {
      if (!old?.messages) return old;

      return {
        ...old,
        messages: old.messages.filter((msg) => msg._id !== msgId)
      };
    });
    // updateRoomLastMessage(room)
  }, [selectedRoom?._id, queryClient]);




  useSocket("message:send", handleNewMessage);
  useSocket("message:remove", handleRemoveMessage);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
    setShowScrollBtn(!nearBottom);
  }, []);

  // Save scroll position on scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || !selectedRoom?._id) return;

    const saveScroll = () => {
      if (!isManualScroll) {
        localStorage.setItem(
          `scroll-${selectedRoom._id}`,
          container.scrollTop.toString()
        );
      }
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("scrollend", saveScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", saveScroll);
    };
  }, [selectedRoom?._id, handleScroll, isManualScroll]);

  // Restore scroll or scroll to bottom
  useEffect(() => {
    if (!selectedRoom?._id || !chatContainerRef.current || isFetching || targetForwardedMessage) return;

    const container = chatContainerRef.current;
    const savedScroll = localStorage.getItem(`scroll-${selectedRoom._id}`);

    setTimeout(() => {
      if (savedScroll && !isManualScroll) {
        container.scrollTop = parseInt(savedScroll, 10);
        localStorage.removeItem(`scroll-${selectedRoom._id}`);
      } else if (!savedScroll) {
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
    }, 100);
  }, [selectedRoom?._id, isFetching]);

  // Auto-scroll for new messages (only if user is near bottom)
  useEffect(() => {
    if (isNearBottom && !isManualScroll && messages.length > 0 && !isFetching && !targetForwardedMessage) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isNearBottom, isManualScroll, isFetching]);

  // Mark as read on room change
  useEffect(() => {
    console.log(messagesData);

    if (selectedRoom?._id && messagesData?.messages?.length > 0) {
      checkMessageAsSeen(selectedRoom._id);
    }
  }, [selectedRoom?._id, checkMessageAsSeen, messagesData]);

  // Manual scroll detection
  const handleWheel = useCallback(() => {
    setIsManualScroll(true);
    const timeout = setTimeout(() => setIsManualScroll(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (targetForwardedMessage) {
      const targetMsg = document.querySelector(`#msg_${targetForwardedMessage._id}`)

      if (!targetMsg) return

      goToMsg(null, targetForwardedMessage._id, messages)

      // ✅ بهتر: استفاده از requestAnimationFrame
      requestAnimationFrame(() => {
        setTargetForwardedMessage(null)
      });
    }
  }, [targetForwardedMessage, messagesData?.messages])

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">هیچ چتی انتخاب نشده است</p>
      </div>
    );
  }

  return (
    <>
      {selectedRoom && <ChatHeader />}

      <div
        ref={chatContainerRef}
        onWheel={handleWheel}
        className="
          flex-1 overflow-y-auto overflow-x-hidden 
          chat-scrollbar relative will-change-transform h-full
        "
        dir="rtl"
      >
        {messages.length > 0 ? (
          <MessageList
            messages={messages}
            textareaRef={textareaRef}
            messageEndRef={messageEndRef}
            chatContainerRef={chatContainerRef}
          />
        ) : isFetching ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={
              selectedRoom?.members
                ?.filter(m => m._id !== authUser?._id)[0]
                ?.name || selectedRoom.name
            }
          />
        )}

        {/* Invisible div for scrolling to bottom */}
        <div ref={messageEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
              setIsManualScroll(false);
            }}
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
            <ChevronDown className="w-6 h-6 text-white drop-shadow" />
          </motion.button>
        )}
      </AnimatePresence>

      <MessageInput textareaRef={textareaRef} />
      
    </>
  );
};

export default ChatContainer;