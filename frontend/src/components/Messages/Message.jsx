import { memo } from "react";
import { ChatIcon, SmartFileDownloader } from '@/components/index';
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { handleSwipe, parseDynamicContent } from '@/lib/helper';
import StickerPreview from "./StickerPreview";
import { Clock, Check } from "lucide-react";


const MessageFooter = ({ hasBg, isMyMessage, hasSeen, placedTime, isMessageSending }) => {

  return (

    <div
      className={`flex items-center gap-1.5  rounded-xl text-[11px] leading-[11px] opacity-75 justify-start mt-3 w-max relative ${hasBg ? "bg-black/10 backdrop-blur-2xl px-1" : "pr-2"}`}
    >
      {/* آیکون وضعیت پیام */}
      {isMessageSending ? (
        <div className="size-4 h-5">
          <Clock size={16} className="animate-pulse" />
        </div>
      ) : (
        isMyMessage && (
          <div className="size-4 h-5">
            <Check
              size={16}
              className={`${hasSeen ? "text-blue-400" : "text-gray-400"}`}
              strokeWidth={3}
              style={{ position: "absolute", top: 0, right: 2 }}
            />
            {hasSeen && (
              <Check
                size={16}
                className="text-blue-400"
                strokeWidth={3}
                style={{ position: "absolute", top: 0, right: 9 }}
              />
            )}
          </div>
        )
      )}

      {/* زمان پیام */}
      <span
        className={`flex items-center text-xs justify-center ${hasBg ? "text-white/80 px-2 pt-1 rounded-xl" : ""}`}
      >
        {new Date(placedTime).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  )
}


const Message = ({
  msg,
  isMyMessage,
  isGroup,
  isStillSame,
  goToMsg,
  inputRef,
  selectedMsg,
  openMenu,
  isMessageSending
}) => {
  const setReplyToMsg = useChatStore(state => state.setReplyToMsg);


  const authUser = useAuthStore(state => state.authUser);

  const isMyMsgRepliedByMe = msg?.replyTo?.senderId?._id === authUser._id && msg?.senderId?._id === authUser._id;
  const RepliedByMe = msg?.replyTo?.senderId?._id === authUser._id ? "شما" : msg?.replyTo?.senderId?.name;



  const [parsedText, isOnlySticker] = parseDynamicContent(msg.text);



  return (
    <div
      id={`msg_${msg._id}`}
      onMouseDown={(e) => handleSwipe(e, msg, setReplyToMsg, inputRef)}
      className={`chat relative  ${selectedMsg && "z-[100]"}   ${!isMyMessage ? "chat-end" : "chat-start group  duration-200  "}`}
    >
      <div
        onContextMenu={(e) => openMenu(e, isMyMessage, msg)}
        onTouchStart={(e) => handleSwipe(e, msg, setReplyToMsg, inputRef)}
        className={`flex items-end gap-2 transition-transform ${isMyMessage ? "flex-row-reverse" : "flex-row"} justify-center  ${selectedMsg && "scale-105"}`}
      >
        {/* حباب پیام */}

        <div
          className={`chat-bubble pb-1 pr-1  max-w-[70vw] md:max-w-[30vw]  relative    ${!msg.sticker && !isOnlySticker
            ? isMyMessage
              ? "bg-sky-700/50 text-white"
              : "bg-slate-800 text-slate-200"
            : "bg-black/0"
            }`}
        >


          {/* Reply */}
          {msg?.replyTo && (
            <div
              onClick={(e) => goToMsg(e, msg.replyTo._id)}
              className={`mb-2 px-3 py-1 pr-3  rounded-md text-sm border-r-4 ${isMyMessage ? "border-sky-300" : "border-cyan-500"
                } ${!isMyMsgRepliedByMe ? "bg-black/10" : "bg-white/10 text-cyan-100"}`}
            >
              {isGroup && (
                <p className="font-semibold text-xs opacity-80">{RepliedByMe || "Unknown"}</p>
              )}
              <p dir="rtl" className="text-xs truncate opacity-70">
                {msg.replyTo?.text
                  ? msg.replyTo.text.length > 50
                    ? msg.replyTo.text.slice(0, 50) + "..."
                    : msg.replyTo?.text
                  : msg.replyTo?.file?.type == "image"
                    ? "📷 Photo"
                    : msg.replyTo?.file?.type
                      ? <span>📄 {msg.replyTo.file.name}</span>
                      : msg.replyTo?.sticker
                        ? `${msg.replyTo.sticker.emoji} Sticker`
                        : "محتوایی ندارد"}
              </p>
            </div>
          )}

          {/* فایل PDF یا ضمیمه */}
          {msg?.file && (
            <SmartFileDownloader
              msg={msg}
              isUploading={isMessageSending}
              isMyMsg={isMyMessage}

            />
          )}

          {/* متن */}
          {msg?.text && (
            <p
              dir="auto"
              className="mt-2 pr-3 max-sm:text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]"
              dangerouslySetInnerHTML={{ __html: parsedText }}
            />
          )}

          {/* استیکر */}
          {msg?.sticker && <StickerPreview url={msg.sticker.url} size={180} />}

          <MessageFooter
            hasBg={isOnlySticker || msg?.sticker}
            hasSeen={msg?.seenBy?.length > 1}
            placedTime={msg?.createdAt}
            isMyMessage={isMyMessage}
            isMessageSending={isMessageSending}
          />



        </div>

        {/* آیکون پروفایل */}
        {isGroup && !isStillSame && !isMyMessage ? (
          <ChatIcon classProps="size-10" profile={msg.senderId?.profilePic} name={msg?.senderId?.name} />
        ) : (
          <div className={`shrink-0 ${isGroup && !isMyMessage ? "w-10" : "w-3"}`} />
        )}



      </div>
    </div>
  );
};

export default memo(Message);
