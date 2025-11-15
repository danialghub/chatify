import { memo } from "react";
import { ChatIcon } from '@/components/index'
import { TrashIcon, ReplyIcon } from 'lucide-react'
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { handleSwipe, parseDynamicContent } from '@/lib/helper'
import StickerPreview from "./StickerPreview";

const Message = memo(({ msg, isMyMessage, isGroup, isStillSame, goToMsg, index, inputRef }) => {
  const { setReplyToMsg, removeMessage, isMessageSending ,openModal} = useChatStore()
  const { authUser } = useAuthStore()

  const isMyMsgRepliedByMe = msg?.replyTo?.senderId?._id === authUser._id && msg?.senderId?._id === authUser?._id

  const RepliedByMe = msg?.replyTo?.senderId?._id === authUser._id ? "شما" : msg?.replyTo?.senderId?.name


  const [_, isOnlySticker] = parseDynamicContent(msg.text)



  return (

    <div

      id={`msg_${index}`}

      className={`chat ${!isMyMessage ? "chat-end" : "chat-start group  transition-transform duration-200 will-change:transform relative "}`}
    >
      <div
        onTouchStart={(e) => handleSwipe(e, msg, setReplyToMsg, inputRef)}
        onMouseDown={(e) => {
          e.preventDefault();
          handleSwipe(e, msg, setReplyToMsg, inputRef);
        }}

        className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"
          } justify-center relative  `}
      >
        <div

          className={`chat-bubble max-w-[55vw] sm:max-w-[30vw] relative ${!msg.sticker && !isOnlySticker ? isMyMessage ? "bg-sky-600/50 text-white" : "bg-slate-800 text-slate-200 " : "bg-black/0"
            }`}
        >
          {/* 🩵 بخش Reply مثل تلگرام */}
          {msg.replyTo && (
            <div
              onClick={() => goToMsg(msg.replyTo._id)}
              className={`mb-2 px-3 py-1 rounded-md text-sm border-r-4 ${isMyMessage
                ? "border-sky-300" : "border-cyan-500"
                } ${!isMyMsgRepliedByMe ? "bg-black/10" : "bg-white/10 text-cyan-100"} `}
            >
              {isGroup &&
                <p className="font-semibold text-xs opacity-80">
                  {RepliedByMe || "Unknown"}
                </p>
              }

              <p dir="rtl" className="text-xs truncate opacity-70">
                {msg.replyTo.text
                  ? msg.replyTo.text.length > 50
                    ? msg.replyTo.text.slice(0, 50) + "..."
                    : msg.replyTo.text
                  : msg.replyTo.image
                    ? "📷 Photo"
                    : msg.replyTo.sticker
                      ? `${msg.replyTo.sticker.emoji} Sticker`
                      : "محتوایی ندارد"
                }
              </p>

            </div>
          )}

          {/* 📸 تصویر پیام */}
          {msg.image && (
            <a href={msg.image} target="_blank">
              <img
                src={msg.image}
                alt="Shared"
                width={250}
                height={250}
                loading="lazy"
                className="rounded-lg object-cover w-full transition-transform duration-300 hover:scale-[1.02]"
              />
            </a>
          )}

          {/* ✍️ متن پیام */}
          {msg.text && (
            <p
              dir="auto"
              className="mt-2 max-sm:text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]"
              dangerouslySetInnerHTML={{ __html: parseDynamicContent(msg.text)[0] }}
            >
            </p>
          )}
          {/* 🤙 استیکر  */}
          {msg.sticker && (
            <StickerPreview url={msg.sticker.url} size={140} />
          )

          }
          {/* 🕓 زمان پیام */}
          {isMessageSending === msg._id
            ? <span className="text-xs font-bold animate-pulse">درحال ارسال...</span>
            : <p className="text-xs mt-2 opacity-75 flex items-center gap-1 justify-start">
              {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

          }
        </div>

        {/* آیکون یا پروفایل */}
        {isGroup && !isStillSame && !isMyMessage ? (
          <ChatIcon classProps="size-10" profile={msg.senderId?.profilePic} name={msg?.senderId?.name} />
        ) : (
          <div className={`shrink-0 ${isGroup && !isMyMessage ? "w-10" : "w-3"}`} />
        )}

        {/* دکمه حذف برای پیام خودت */}
        {isMyMessage ? (
          <div
            tabIndex={0}
            className="absolute top-1/2  -left-12 -translate-y-1/2 hidden group-hover:block text-white/40 font-bold "
          >
            <button
              onClick={() =>
                openModal(
                  'Alert',
                  {
                    title: "حذف پیام",
                    onComplete: () => removeMessage(msg._id),
                    size: "sm"
                  })
              }
              className="bg-white/5 hover:text-red-600 transition-colors duration-200 rounded-full p-2">
              <TrashIcon />
            </button>
          </div>
        ) : (
          // دکمه Reply برای پیام‌های دیگران 
          <button
            id={`replyToBtn${index}`}
            onClick={() => setReplyToMsg(msg)}
            className="absolute -right-10 top-1/2 -translate-y-1/2 p-1 bg-white/5 hover:bg-white/10 transition-colors duration-200 rounded-full hidden"
          >
            <ReplyIcon size={18} color="white" />
          </button>
        )}
      </div>
    </div>



  )
});
export default Message