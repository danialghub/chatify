import { memo } from "react";
import { ChatIcon } from './index'
import { TrashIcon ,Meh} from 'lucide-react'
const Message = memo(({ msg, isMyMessage, isGroup }) => {

  return (
    <div
      key={msg._id}
      className={`chat  ${!isMyMessage ? "chat-end" : "chat-start group"}`}
    >
      <div
        className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"
          } justify-center relative `}
      >

        <div
          className={`chat-bubble max-w-[70vw] sm:max-w-[30vw]  relative ${isMyMessage
            ? "bg-cyan-600 text-white"
            : "bg-slate-800 text-slate-200 "
            }`}
        >
          {msg.image && (
            <a href={msg.image} target="_blank">
            <img
              src={msg.image}
              alt="Shared"
              width={250}
              height={250}
              loading="lazy"
              className="rounded-lg object-cover w-full transition-transform duration-300 hover:scale-[1.02] "
            />
            </a>
          )}
          {msg.text && (
            <p
              className="mt-2  break-words text-right "

            >
              {msg.text}
            </p>
          )}
          <p className="text-xs  mt-2 opacity-75 flex items-center gap-1 justify-start">
            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

        </div>

        {/* آیکون گروه یا نگه‌دار خالی برای حفظ layout */}
        {isGroup ? (
          <ChatIcon
            profile={msg.senderId?.profilePic}
            name={msg?.senderId?.name}

          />
        ) : (
          <div className="size-3 shrink-0" />
        )}


        {isMyMessage &&
          <div
            tabIndex={-1}
            className="absolute  -bottom-12 p-4 w-[40vw] right-8  hidden group-hover:block text-white/40 font-bold ">
           <TrashIcon />
          </div>
        }

      </div>

    </div>
  )
});
export default Message