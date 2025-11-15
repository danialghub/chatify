import { Message } from "../index";
import { formatChatTime } from '@/lib/helper'

function SystemMessage({ msg, isStillSystem }) {
  return (
    <div className="text-center text-white/80">
      {!isStillSystem && (
        <div className="text-xs my-0.5 mt-10">{formatChatTime(msg.createdAt)}</div>
      )}
      <span className="px-4 py-1 text-sm bg-black/10 rounded">
        {msg.text}
      </span>
    </div>
  );
}


export default function MessageList({
  messages,
  authUser,
  selectedRoom,
  goToMsg,
  textareaRef,
  messageEndRef
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 overflow-x-hidden">
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];
        const next = messages[idx + 1];

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
            goToMsg={goToMsg}
            index={idx}
            inputRef={textareaRef}
          />
        );
      })}

      <div ref={messageEndRef} id="messageEndRef" />
    </div>
  );
}
