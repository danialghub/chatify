import { memo, useRef, useState, useCallback } from "react";
import useKeyboardSound from "@/hooks/useKeyboardSound";
import { useRoomStore } from "@/store/useRoomStore";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Forward, Paperclip, SendIcon, Sticker, X } from "lucide-react";
import { ImageUploader } from "@/components";
import StickerPanel from "./Sticker/Sticker";
import TextArea from "./TextArea";
import FilePreview from "./FilePreview";
import { useSendMessage } from "@/hooks/useMessage";
import toast from "react-hot-toast";

const MessageInput = memo(({ textareaRef, isSoundEnabled }) => {
  const { playRandomKeyStrokeSound } = useKeyboardSound();

  const [text, setText] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [filePreview, setFilePreview] = useState(null);
  const [emojiTab, setEmojiTab] = useState("emoji");
  const [open, setOpen] = useState(false);



  const fileInputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const { authUser } = useAuthStore()
  const { setTargetForwardRoom, selectedRoom } = useRoomStore();
  const { replyToMsg, setReplyToMsg, forwardedMessage, setForwardMessage } = useChatStore()


  const { mutateAsync: sendMessage } = useSendMessage();




  const resetInput = useCallback(() => {
    setText("");
    setFilePreview(null);
    setForwardMessage(null);
    setReplyToMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!sendMessage) return;

      // فقط Forward
      if (forwardedMessage && !text.trim() && !filePreview) {
        const fd = new FormData();
        fd.append("forwardedFrom", forwardedMessage._id);

        sendMessage({
          formData: fd,
          previewData: null,
          forwardedMessage,
        });
        console.log(authUser);

        const userName = selectedRoom.members
        const targetRoomName = selectedRoom.isGroup
          ? selectedRoom.name
          : userName.name
        toast(`هدایت شد ${targetRoomName} پیام برای`)


        setTargetForwardRoom(null);
        resetInput();
        return;
      }

      // متن یا فایل
      if (!text.trim() && !filePreview && !forwardedMessage) return;

      if (isSoundEnabled) playRandomKeyStrokeSound();

      const fd = new FormData();
      if (text.trim()) fd.append("text", text.trim());
      if (replyToMsg) fd.append("replyTo", JSON.stringify(replyToMsg));
      if (filePreview) fd.append("file", filePreview.file);
      if (forwardedMessage) fd.append("forwardedFrom", forwardedMessage._id);

      sendMessage({
        formData: fd,
        previewData: filePreview,
        forwardedMessage,
      });

      requestAnimationFrame(() => {
        document
          .getElementById("messageEndRef")
          ?.scrollIntoView({ behavior: "smooth" });
      });

      resetInput();
      setEmojiTab("emoji");
    },
    [
      text,
      filePreview,
      forwardedMessage,
      replyToMsg,
      isSoundEnabled,
      playRandomKeyStrokeSound,
      resetInput,
      setTargetForwardRoom,
    ]
  );


  const removeFile = useCallback(() => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const addEmoji = useCallback(
    (emoji) => {
      const before = text.slice(0, cursorPos);
      const after = text.slice(cursorPos);
      const newMsg = before + emoji + after;
      setText(newMsg);
      setCursorPos(cursorPos + emoji.length);
    },
    [text, cursorPos]
  );

  const isSendDisabled =
    (!text.trim() && !filePreview && !forwardedMessage) ||
    (!!replyToMsg && !!forwardedMessage);

  return (
    <div className="relative" ref={inputContainerRef}>
      <div className="p-4 pt-1 border-t border-slate-700/50">
        {/* Header Preview Section */}
        <div className="max-w-3xl mx-auto mb-3">
          {/* REPLY MODE */}
          {replyToMsg && (
            <div className="relative w-full text-white/70 bg-slate-950/70 rounded-md">
              <div className="bg-white/5 border-r-8 border-r-cyan-600 rounded-r-lg">
                <div dir="rtl" className="mt-2 py-2 text-right text-sm">
                  <span className="font-bold pr-3">
                    پاسخ به {replyToMsg.senderId.name} :
                  </span>
                  <p
                    dir="rtl"
                    className="text-xs truncate opacity-80 pr-6 mt-1.5"
                  >
                    {replyToMsg.text
                      ? replyToMsg.text.length > 50
                        ? replyToMsg.text.slice(0, 50) + "..."
                        : replyToMsg.text
                      : replyToMsg.file
                        ? replyToMsg.file.type === "image"
                          ? "📷 Photo"
                          : `📄 ${replyToMsg.file.name}`
                        : replyToMsg.sticker
                          ? `${replyToMsg.sticker.emoji} Sticker`
                          : "بدون محتوا"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReplyToMsg(null)}
                className="absolute -top-2 -left-1 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* FORWARD PREVIEW */}
          {!replyToMsg && forwardedMessage && forwardedMessage.roomId._id !== selectedRoom._id && (
            <div className="flex justify-between w-full min-w-0 bg-slate-950/80 px-2 py-1 rounded-md">
              <div className="flex items-center gap-3 min-w-0">
                <Forward className="size-5 text-blue-500" />
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-sm text-blue-500">Forward message</h3>
                  <p className="text-xs truncate w-full text-white/80">
                    {forwardedMessage.text ||
                      `From ${forwardedMessage.senderId.name}`}
                  </p>
                </div>
              </div>

              <X
                onClick={() => {
                  setForwardMessage(null);
                  setTargetForwardRoom(null);
                }}
                className="size-5 text-gray-500 cursor-pointer"
              />
            </div>
          )}

          {/* FILE PREVIEW */}
          {filePreview && (
            <FilePreview filePreview={filePreview} removeFile={removeFile} />
          )}
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto relative flex items-center py-3 px-16 bg-slate-800/80 border border-slate-700/50 rounded-md"
        >
          {/* EMOJI / STICKER */}
          <div className="flex absolute left-1 bottom-1.5 items-center gap-1">
            <button
              onClick={() => setOpen((p) => !p)}
              type="button"
              className="w-8 h-8 text-xl rounded-full hover:bg-cyan-600/70 transition flex justify-center items-center"
            >
              {emojiTab === "emoji" ? "🤣" : <Sticker className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-700 rounded-full transition"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {/* TEXT */}
          <TextArea
            taRef={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            onSelect={(e) => setCursorPos(e.target.selectionStart)}
            onFocus={() => setOpen(false)}
            placeholder="متن خود را تایپ کنید..."
          />

          <ImageUploader setFile={setFilePreview} inputRef={fileInputRef} />

          <button
            type="submit"
            disabled={isSendDisabled}
            className="absolute bottom-1.5 right-1.5 bg-cyan-600 text-white rounded-md px-3 py-2 hover:bg-cyan-700 disabled:opacity-50"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>

      <StickerPanel
        open={open}
        setOpen={setOpen}
        inputContainerRef={inputContainerRef}
        addEmoji={addEmoji}
        tab={emojiTab}
        setTab={setEmojiTab}
      />
    </div>
  );
});

export default MessageInput;
