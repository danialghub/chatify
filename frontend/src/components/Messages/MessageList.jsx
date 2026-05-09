import { useMemo } from "react";
import { Message } from "../index";
import { formatChatTime, injectDateMessages } from '@/lib/helper'
import { useChatStore } from '@/store/useChatStore'


function SystemMessage({ msg }) {
  return (
    <div
      className={`text-center text-white/60 transition-all duration-300 `}
    >
      <span className="px-4 py-1 text-sm bg-white/5 backdrop-blur-md rounded-full shadow">
        {msg.text}
      </span>
    </div>
  );
}


export default function MessageList({
  messages,
  authUser,
  selectedRoom,
  textareaRef,
  messageEndRef
}) {

  const msgs = useMemo(() => injectDateMessages(messages), [messages, selectedRoom?._id]);

  const { isMessageSending } = useChatStore()

  return (
    <div className="max-w-3xl mx-auto space-y-4 overflow-x-hidden">


        {msgs.map((msg, idx) => {
          const prev = msgs[idx - 1];
          const next = msgs[idx + 1];

          const isMyMessage = msg?.senderId?._id === authUser._id;
          const isSystem = msg.system;

          const isStillSame = next?.senderId?._id === msg?.senderId?._id;
          const isStillSystem = prev?.system === true;

          if (isSystem)
            return (
              <SystemMessage
                key={msg._id}
                msg={msg}
                isStillSystem={isStillSystem}
              />
            );

          return (
            <Message
              key={msg._id}
              msg={msg}
              isMyMessage={isMyMessage}
              isGroup={selectedRoom.isGroup}
              isStillSame={isStillSame}
              inputRef={textareaRef}
              isMessageSending={isMessageSending === msg._id}
            />
          );
        })}

        <div ref={messageEndRef} id="messageEndRef" />
    </div>
  );
}
