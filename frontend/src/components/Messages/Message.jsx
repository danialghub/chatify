import { memo, useMemo, useCallback } from "react";
import { ChatIcon } from "@/components/index";
import { TrashIcon, ReplyIcon } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { handleSwipe, parseDynamicContent } from "@/lib/helper";
import StickerPreview from "./StickerPreview";

function Message({
  msg,
  isMyMessage,
  isGroup,
  isStillSame,
  goToMsg,
  index,
  inputRef
}) {
  const { setReplyToMsg, removeMessage, isMessageSending, openModal } =
    useChatStore();
  const { authUser } = useAuthStore();

  const isMyMsgRepliedByMe =
    msg?.replyTo?.senderId?._id === authUser._id &&
    msg?.senderId?._id === authUser?._id;

  const RepliedByMe =
    msg?.replyTo?.senderId?._id === authUser._id
      ? "شما"
      : msg?.replyTo?.senderId?.name;

  // 📌 متن را فقط یک‌بار پردازش کن
  const { html, isOnlySticker } = useMemo(() => {
    const [h, sticker] = parseDynamicContent(msg.text);
    return { html: h, isOnlySticker: sticker };
  }, [msg.text]);

  // 📌 جلوگیری از ساخت handler جدید
  const onSwipe = useCallback(
    (e) => handleSwipe(e, msg, setReplyToMsg, inputRef),
    [msg._id]
  );

  const bubbleColor = isMyMessage
    ? "bg-sky-600/50 text-white"
    : "bg-slate-800 text-slate-200";

  const positionClass = isMyMessage ? "chat-start" : "chat-end";

  return (
    <div id={`msg_${index}`} className={`chat ${positionClass} group`}>
      <div
        onTouchStart={onSwipe}
        onMouseDown={(e) => {
          e.preventDefault();
          onSwipe(e);
        }}
        className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"
          }`}
      >
        <div
          className={`chat-bubble max-w-[55vw] sm:max-w-[30vw] relative ${msg.sticker || isOnlySticker ? "bg-transparent" : bubbleColor
            }`}
        >
          {msg.replyTo && (
            <div
              onClick={() => goToMsg(msg.replyTo._id)}
              className={`mb-2 px-3 py-1 rounded-md text-sm border-r-4 ${isMyMessage ? "border-sky-300" : "border-cyan-500"
                } ${!isMyMsgRepliedByMe ? "bg-black/10" : "bg-white/10"}`}
            >
              {isGroup && (
                <p className="font-semibold text-xs opacity-80">{RepliedByMe}</p>
              )}
              <p className="text-xs truncate opacity-70">
                {msg.replyTo.text ||
                  (msg.replyTo.image && "📷 Photo") ||
                  (msg.replyTo.sticker && "Sticker")}
              </p>
            </div>
          )}

          {msg.image && (
            <a href={msg.image} target="_blank">
              <img
                src={msg.image}
                loading="lazy"
                className="rounded-lg object-cover w-full"
              />
            </a>
          )}

          {msg.text && (
            <p
              dir="auto"
              dangerouslySetInnerHTML={{ __html: html }}
              className="mt-2 break-words whitespace-pre-line"
            />
          )}

          {msg.sticker && <StickerPreview url={msg.sticker.url} size={140} />}

          <p className="text-xs mt-2 opacity-75 flex items-center gap-1">
            {isMessageSending === msg._id ? (
              <span className="animate-pulse">درحال ارسال...</span>
            ) : (
              new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            )}
          </p>
        </div>

        {isGroup && !isStillSame && !isMyMessage ? (
          <ChatIcon
            classProps="size-10"
            profile={msg.senderId?.profilePic}
            name={msg?.senderId?.name}
          />
        ) : (
          <div className={isGroup ? "w-10" : "w-3"} />
        )}
      </div>
    </div>
  );
}

export default memo(Message, (prev, next) => {
  return (
    prev.msg._id === next.msg._id &&
    prev.msg.text === next.msg.text &&
    prev.msg.image === next.msg.image &&
    prev.msg.sticker?.url === next.msg.sticker?.url &&
    prev.isMyMessage === next.isMyMessage &&
    prev.isStillSame === next.isStillSame
  );
});
