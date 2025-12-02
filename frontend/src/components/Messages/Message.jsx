import { memo } from "react";
import { ChatIcon, SmartFileDownloader } from '@/components/index';
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { handleSwipe, parseDynamicContent } from '@/lib/helper';
import StickerPreview from "./StickerPreview";

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

  console.log('salam');


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
          className={`chat-bubble  max-w-[70vw] md:max-w-[30vw]  relative    ${!msg.sticker && !isOnlySticker
            ? isMyMessage
              ? "bg-sky-600/50 text-white"
              : "bg-slate-800 text-slate-200"
            : "bg-black/0"
            }`}
        >


          {/* Reply */}
          {msg?.replyTo && (
            <div
              onClick={(e) => goToMsg(e, msg.replyTo._id)}
              className={`mb-2 px-3 py-1 rounded-md text-sm border-r-4 ${isMyMessage ? "border-sky-300" : "border-cyan-500"
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
              className="mt-2 max-sm:text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]"
              dangerouslySetInnerHTML={{ __html: parsedText }}
            />
          )}

          {/* استیکر */}
          {msg?.sticker && <StickerPreview url={msg.sticker.url} size={180} />}

          {/* زمان پیام */}
          {isMessageSending ? (
            <p className="text-xs font-bold animate-pulse">درحال ارسال...</p>
          ) : (
            <p className={`w-[45px] text-xs  opacity-75 flex items-center gap-1 justify-center ${isOnlySticker || msg.sticker ? "bg-black/5 backdrop-blur-2xl text-white/80 px-2 py-1   rounded-xl text-center" : 'mt-1.5'}`}>
              {new Date(msg.createdAt).toLocaleTimeString('en-GB', {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}



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
