import { memo, useMemo } from "react";
import { ChatIcon, SmartFileDownloader } from "@/components/index";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { handleSwipe, parseDynamicContent } from "@/lib/helper";
import StickerPreview from "./StickerPreview";
import MetaUrl from "./MetaUrl";
import MessageFooter from './MessageFooter'


/* ===================== REPLIED ===================== */
const MessageReplied = memo(({ msg, isMyMessage, goToMsg }) => {
  const authUser = useAuthStore(state => state.authUser);
  const reply = msg?.replyTo;

  const isReplyMine = reply?.senderId?._id === authUser._id;
  const repliedName = isReplyMine ? "شما" : reply?.senderId?.name;
  const isMyMsgRepliedByMe =
    msg?.replyTo?.senderId?._id === authUser._id &&
    msg?.senderId?._id === authUser._id;


  return (
    <div
      onClick={(e) => goToMsg(e, reply._id)}
      className={`mb-2 mx-2 px-3 py-1 mt-0.5 rounded text-sm border-r-4 text-ellipsis overflow-hidden max-md:max-w-[60vw]  cursor-pointer
        ${isMyMessage ? "border-sky-300" : "border-cyan-500"} 
        ${!isMyMsgRepliedByMe ? "bg-black/10" : "bg-white/10 text-cyan-100"}`}
    >
      <p className="font-extrabold text-xs">{repliedName || "Unknown"}</p>
      <p dir="rtl" className="text-xs truncate opacity-70">
        {reply?.text
          ? (reply.text.length > 50 ? reply.text.slice(0, 50) + "..." : reply.text)
          : reply?.file?.type === "image" ? "📷 Photo"
            : reply?.file?.type ? `📄 ${reply.file.name}`
              : reply?.sticker ? `${reply.sticker.emoji} Sticker`
                : "محتوایی ندارد"}
      </p>
    </div>
  );
});


/* ===================== STICKER ===================== */
const MessageSticker = ({ url }) => <StickerPreview url={url} size={180} />;


/* ===================== MESSAGE ROOT ===================== */
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

  const [parsedText, isOnlySticker, characterLength] = parseDynamicContent(msg.text);
  const isEmojiOnly = isOnlySticker && characterLength === 1;

  const hasFooter = msg?.text
    ? isOnlySticker || characterLength >50
    : (!msg?.file) || msg?.sticker

  const isImageOnly = msg?.file && !msg?.text && msg?.file?.type === "image";
  const hasBg = !msg?.sticker && !isOnlyEmoji && !isImageOnly;

  const isSeen = msg?.seenBy?.length > 1;

  return (
    <div
      id={`msg_${msg._id}`}
      onMouseDown={(e) => handleSwipe(e, msg, setReplyToMsg, inputRef)}
      className={`chat relative ${selectedMsg && "z-[100]"} ${!isMyMessage ? "chat-end" : "chat-start group duration-200"}`}
    >
      <div
        onContextMenu={(e) => openMenu(e, isMyMessage, msg)}
        onTouchStart={(e) => handleSwipe(e, msg, setReplyToMsg, inputRef)}
        className={`flex items-end gap-2 transition-transform ${isMyMessage ? "flex-row-reverse" : "flex-row"} ${selectedMsg && "scale-105"}`}
      >

        {/* Bubble */}
        <div className={`chat-bubble p-1 max-w-[80vw] md:max-w-[40vw] relative 
          ${hasBg ?
            (isMyMessage ? "bg-sky-700/50 text-white" : "bg-slate-800 text-slate-200")
            : "bg-black/0"
          }`}
        >
          {/* Reply */}
          {msg?.replyTo && !msg.sticker && !isEmojiOnly && (
            <MessageReplied msg={msg} isMyMessage={isMyMessage} goToMsg={goToMsg} />
          )}

          {/* File */}
          {msg?.file && (
            <SmartFileDownloader
              msg={msg}
              isUploading={isMessageSending}
              isMyMsg={isMyMessage}
              hasBg={!msg?.text && msg.file.type === "image"}
            >

              {!msg?.text && msg.file.type === "image" && (
                <MessageFooter
                  hasBg={!msg?.text && msg.file.type === "image"}
                  hasSeen={isSeen}
                  placedTime={msg?.createdAt}
                  isMyMessage={isMyMessage}
                  isMessageSending={isMessageSending}
                />
              )

              }

            </SmartFileDownloader>
          )}

          {/* Text */}
          {msg?.text && !isEmojiOnly && !msg?.sticker && (
            characterLength > 50 || isOnlySticker ? (
              <p
                dir="auto"
                className={`mt-2 px-3 max-sm:text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]`}
                dangerouslySetInnerHTML={{ __html: parsedText }}
              />
            ) : (
              <div className="flex ">
                <div className="mt-2">
                  <MessageFooter
                    hasBg={isOnlyEmoji}
                    hasSeen={isSeen}
                    placedTime={msg?.createdAt}
                    isMyMessage={isMyMessage}
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
              className={`flex justify-between items-start ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
              {msg?.replyTo && (
                <MessageReplied msg={msg} isMyMessage={isMyMessage} goToMsg={goToMsg} />
              )}
              {!msg?.sticker ? (
                <p dir="auto" className="text-5xl leading-none select-none" dangerouslySetInnerHTML={{ __html: parsedText }} />
              ) : (
                <MessageSticker url={msg.sticker.url} />
              )}
            </div>
          )}

          {/* Meta Content */}
          {link && !msg?.file && (
            <MetaUrl url={link} />
          )}

          {/* Footer */}
          {hasFooter && (
            <MessageFooter
              hasBg={isOnlyEmoji || msg?.sticker}
              hasSeen={isSeen}
              placedTime={msg?.createdAt}
              isMyMessage={isMyMessage}
              isMessageSending={isMessageSending}
            />
          )}
        </div>

        {/* Avatar */}
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
