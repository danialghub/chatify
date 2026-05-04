import { Message, ContextMenu } from "@/components/index";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useRoomStore } from "@/store/useRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import { injectDateMessages, goToMsg } from "@/lib/helper";
import useSocket from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";

function SystemMessage({ msg }) {

  return (
    <div
      id={msg._id}
      className={`text-center text-white/60 transition-all duration-300 `}
    >
      <span className="px-4 py-1 text-sm bg-slate-900/5 backdrop-blur-md rounded-lg shadow">
        {msg.text}
      </span>
    </div>
  );
}

const MessageList = ({
  messages,
  textareaRef,
  messageEndRef,
  chatContainerRef,
}) => {
  const [targetMsg, setTargetMsg] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const { isMessageSending } = useChatStore();
  const { selectedRoom } = useRoomStore();
  const { authUser } = useAuthStore();


  const queryClient = useQueryClient();

  const checkUserMessagesAsSeen = ({ roomId, seenBy }) => {

    queryClient.setQueryData(['messages', roomId], (old) => {
      console.log(roomId, seenBy);
      if (!old?.messages) return old;

      return {
        messages: old.messages.map(msg => msg.seenBy.length > 1 || msg.seenBy.includes(seenBy) ? msg : { ...msg, seenBy: [...msg.seenBy, seenBy] })
      }
    })
  }



  /** socket — seen sync */
  useSocket("message:seen", checkUserMessagesAsSeen);

  /** scroll to msg with flash animation */


  /** context menu positioning */
  const openMenuForMessage = useCallback(
    (e, isMyMessage, msg) => {
      e.preventDefault();
      chatContainerRef.current.style.overflowY = "hidden"
      const rect = e.currentTarget.getBoundingClientRect();
      const container = chatContainerRef?.current;
      if (!container) return;

      const crect = container.getBoundingClientRect();
      const menuW = isMyMessage ? 100 : 150;
      const menuH = isMyMessage ? 290 : 160;

      let x = isMyMessage
        ? rect.left - menuW - 18
        : rect.right + 18;

      let y = rect.bottom - crect.top + container.scrollTop;

      /** horizontal boundaries */
      if (x < crect.left) x = crect.left + 10;
      if (x + menuW > crect.right) x = crect.right - menuW - 10;

      /** vertical boundaries */
      const viewBottom = container.scrollTop + container.clientHeight;
      if (y + menuH > viewBottom) y = viewBottom - menuH - 12;
      if (y < container.scrollTop) y = container.scrollTop + 12;

      x -= crect.left;

      setTargetMsg(msg._id);
      setMenuPos({ x, y });
      setIsMenuOpen(true);
    },
    [chatContainerRef]
  );

  const closeMenu = () => {
    setIsMenuOpen(false);
    setTargetMsg(null);
    chatContainerRef.current.style.overflowY = "auto"
  };

  /** inject system dates only once via memo */
  const msgs = useMemo(() => injectDateMessages(messages), [messages, selectedRoom?._id]);


  return (
    <div className="relative py-6 px-3 pr-5 space-y-6 will-change-transform">
      {msgs.map((msg, idx) => {
        const next = msgs[idx + 1];
        const isStillSameSender =
          next?.senderId?._id === msg.senderId?._id;

        const isMyMessage = msg?.senderId?._id === authUser._id;
        const isPendingSend = isMessageSending === msg._id;

        return !msg.system ? (
          <Message
            key={msg._id}
            message={msg}
            isMyMessage={isMyMessage}
            isGroup={selectedRoom.isGroup}
            isStillSame={isStillSameSender}
            inputRef={textareaRef}
            isMessageSending={isPendingSend}
            openMenu={openMenuForMessage}
            goToMsg={goToMsg}
          />
        ) : (
          <SystemMessage
            key={msg._id}
            msg={msg}
          />
        );
      })}

      <ContextMenu
        targetId={targetMsg}
        roomId={selectedRoom._id}
        chatContainerRef={chatContainerRef}
        close={closeMenu}
        menuPos={menuPos}
        isOpen={isMenuOpen}
        textareaRef={textareaRef}

      />

      <div ref={messageEndRef} id="messageEndRef" />
    </div>
  );
};

export default memo(MessageList);
