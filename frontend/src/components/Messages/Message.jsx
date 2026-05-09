import { memo } from "react";
import { ChatIcon } from "@/components/index";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { handleSwipe, parseDynamicContent, goToMsg } from "@/lib/helper";
import StickerPreview from "./StickerPreview";
import { Edit, TrashIcon, Edit3 } from "lucide-react";


/* ===================== REPLIED ===================== */
const MessageReplied = memo(({ msg, isMyMessage, goToMsg }) => {
  const authUser = useAuthStore(state => state.authUser);
  const messages = useChatStore(state => state.messages)
  const reply = msg?.replyTo;
  console.log(reply);

  const isReplyMine = reply?.senderId?._id === authUser._id;
  const repliedName = isReplyMine ? "شما" : reply?.senderId?.name;
  const isMyMsgRepliedByMe =
    msg?.replyTo?.senderId?._id === authUser._id &&
    msg?.senderId?._id === authUser._id;


  return (
    <div
      onClick={(e) => goToMsg(e, reply._id)}
      className={`mb-2 mx-2 px-3 py-1 mt-0.5 rounded text-sm border-l-4 text-ellipsis overflow-hidden max-md:max-w-[60vw]  cursor-pointer 
        ${isMyMessage ? "border-sky-300" : "border-cyan-500"} 
        ${!isMyMsgRepliedByMe ? "bg-black/10" : "bg-white/10 text-cyan-100"}`}
    >
      <p className="font-extrabold text-xs text-left">{repliedName || "Unknown"}</p>
      <p dir="rtl" className="text-xs truncate opacity-70 mt-1">
        {reply?.text
          ? (reply.text.length > 50 ? reply.text.slice(0, 50) + "..." : reply.text)
          : reply?.image  
          ? "Photo📷"
            : reply?.sticker ? `${reply.sticker.emoji} Sticker`
              : "محتوایی ندارد"}
      </p>
    </div>
  );
});

const MessageFooter = ({ isMessageSending, msg, className }) => {



  return (
    <div className={`mr-1 ${className}`}>
      {
        isMessageSending === msg._id ? (
          <span className="text-xs font-bold animate-pulse">درحال ارسال...</span>
        ) : (
          <div className="flex items-end gap-2">
            {msg?.isEdited &&
              <span className=" text-blue-400">
                <Edit3 size={14} />
              </span>
            }
            <p className="text-xs mt-2 opacity-75 flex items-center gap-1 justify-start">
              {new Date(msg.createdAt).toLocaleTimeString('en-GB', {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

          </div>
        )
      }
    </div>
  )
}

/* ===================== STICKER ===================== */
const MessageSticker = ({ url }) => <StickerPreview url={url} size={180} />;


/* ===================== MESSAGE ROOT ===================== */
const Message = ({
  msg,
  isMyMessage,
  isGroup,
  isStillSame,
  inputRef,
  isMessageSending
}) => {

  const { setReplyToMsg, setMessageInput, setMessageInputMode, removeMessage, openModal } = useChatStore();

  const {
    parsedText,
    isOnlyEmoji,
    characterLength,
  } = parseDynamicContent(msg?.text);



  const isEmojiOnly = isOnlyEmoji && characterLength === 1;
  const isMultiLine = msg?.text && msg.text.split('\n').length > 1

  const maxCharacterLength = window.innerWidth < 500 ? characterLength > 30 : characterLength > 50
  const hasFooter = msg?.text
    ? isOnlyEmoji || maxCharacterLength || isMultiLine
    : msg?.sticker

  const isImageOnly = msg?.image && !msg?.text
  const hasBg = !msg?.sticker && !isOnlyEmoji && !isImageOnly;


  const isEditable = (msg.text || !msg.sticker && !msg.image)

  return (

    <div
      id={`msg_${msg?._id}`}
      className={`chat relative  ${!isMyMessage ? "chat-end" : "chat-start group duration-200"}`}

    >
      <div
        onPointerDown={(e) => handleSwipe(e, msg, setReplyToMsg, inputRef)}
        className={`flex group relative items-end gap-2 transition-transform ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}
      >

        {/* دکمه‌های سمت چپ/راست پیام */}
        {isMyMessage && (
          <div
            className={`absolute ${isEditable ?  "-left-24" : "-left-12"} top-1/2 -translate-y-1/2 gap-2  hidden group-hover:flex `}
          >
            <button
              onClick={() =>
                openModal("Alert", {
                  title: "حذف پیام",
                  onComplete: () => removeMessage(msg._id),
                  size: "sm",
                })
              }
              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors duration-200 rounded-full p-2 backdrop-blur-sm"
              title="حذف"
            >
              <TrashIcon className="w-5 h-5" />
            </button>

            {isEditable && (
              <button
                onClick={() => {
                  setMessageInput(msg)
                  setMessageInputMode('edit')
                }}
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-colors duration-200 rounded-full p-2 backdrop-blur-sm"
                title="ویرایش"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {/* محتوای اصلی پیام */}
        <div
          className={`chat-bubble p-1 max-w-[75vw] md:max-w-[40vw] relative
          ${hasBg
              ? isMyMessage
                ? "bg-cyan-950/80 text-slate-100 border border-cyan-800/40"
                : "bg-slate-800/80 text-slate-200"
              : "bg-black/0"
            }`}

        >
          {/* Reply (Only top for normal text/file mode) */}
          {msg?.replyTo?._id && !msg?.sticker && !isEmojiOnly && (
            <div

            >
              <MessageReplied msg={msg} isMyMessage={isMyMessage} goToMsg={goToMsg} />
            </div>
          )}

          {/* File */}
          {msg?.image && (
            <div
              className="relative"
            >
              <img
                src={msg.image}
                className="block max-w-[65vw] md:max-w-[30vw] max-h-[45vh] md:max-h-[55vh] object-contain select-none rounded ring-2 ring-sky-700"
                loading="lazy"
                decoding="async"
              />
              {!msg?.text && msg.image && (
                <MessageFooter
                  className="absolute bottom-0.5  right-1 bg-slate-900/60 text-white rounded-full  px-3"
                  msg={msg}
                  isMessageSending={isMessageSending}
                />
              )}
            </div>
          )}

          {/* Text */}
          {msg?.text && !isEmojiOnly && !msg?.sticker && (
            maxCharacterLength || isOnlyEmoji || isMultiLine ? (
              <p
                dir="auto"
                className={`mt-2 px-3 max-sm:text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]`}

              />
            ) : (
              <div className="flex">
                <div className="mt-2">
                  <MessageFooter
                    msg={msg}
                    isMessageSending={isMessageSending}
                  />
                </div>
                <p
                  dir="auto"
                  className="mt-2 px-3 pr-4 max-sm:text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]"
                  dangerouslySetInnerHTML={{ __html: parsedText }}

                />
              </div>
            )
          )}

          {/* Sticker or Emoji */}
          {(msg?.sticker || isEmojiOnly) && (
            <div
              className={`flex justify-between items-start ${isMyMessage ? "flex-row-reverse" : "flex-row"} ${isOnlyEmoji ? "pt-5" : ""}`}

            >
              {msg?.replyTo?._id && (
                <MessageReplied msg={msg} isMyMessage={isMyMessage} goToMsg={goToMsg} />
              )}

              {!msg?.sticker ? (
                <p
                  dir="auto"
                  className="text-5xl leading-none select-none"
                  dangerouslySetInnerHTML={{ __html: parsedText }}

                />
              ) : (
                <MessageSticker url={msg.sticker.url} />
              )}
            </div>
          )}

          {hasFooter && (
            <div

            >
              <MessageFooter
                msg={msg}
                isMessageSending={isMessageSending}
              />
            </div>
          )}
        </div>

        {/* Avatar or spacer */}
        {(isGroup && !isMyMessage && !isStillSame) ? (
          <div

          >
            <ChatIcon
              classProps="size-11 shrink-0"
              profile={msg.senderId?.profilePic}
              name={msg?.senderId?.name}
            />
          </div>
        ) : (
          <div className={`shrink-0 ${isGroup && !isMyMessage ? "w-11" : "w-3"}`} />
        )}
      </div>
    </div>

  );

};

export default memo(Message);
