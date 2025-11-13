import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useKeyboardSound from "@/hooks/useKeyboardSound";
import { useChatStore } from "@/store/useChatStore";
import { ImageIcon, Paperclip, SendIcon, Sticker, XIcon } from "lucide-react";
import { ImageUploader } from '@/components/index'
import StickerPanel from "./Sticker";
const MessageInput = ({ }) => {
  const { playRandomKeyStrokeSound } = useKeyboardSound();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [open, setOpen] = useState(false)
  const maxHeight = 0.15 * window.innerHeight; // معادل 15vh

  const { sendMessage, isSoundEnabled, replyToMsg, setReplyToMsg } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      replyTo: replyToMsg
    });
    setText("");
    setImagePreview("");
    setReplyToMsg(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Height را فقط وقتی لازم است تغییر بده
    requestAnimationFrame(() => {
      textarea.style.height = "auto"; // reset برای محاسبه scrollHeight
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      if (textarea.offsetHeight !== newHeight) {
        textarea.style.height = newHeight + "px";
      }

      // Scroll داخلی وقتی لازم است
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto";
        textarea.scrollTop = textarea.scrollHeight;
      } else {
        textarea.style.overflowY = "hidden";
      }
    });
  }, [text]);


  return (
    <div className="relative">
      <div className="p-4 pt-1 border-t border-slate-700/50">

        <div className="max-w-3xl mx-auto mb-3 ">
          {replyToMsg && (
            <div className="relative w-full text-white/80">
              < div className=" bg-white/5 border-r-8 border-r-cyan-600 rounded-r-lg">
                {/* msg content */}
                <div dir="rtl" className="mt-2 py-2  text-right text-sm">
                  <span className="!text-md font-bold pr-3">پاسخ به {replyToMsg.senderId.name} :</span>
                  <p className="text-xs truncate opacity-70 pr-6 mt-1.5 ">
                    {replyToMsg.text
                      ?
                      replyToMsg.text
                      : replyToMsg.image
                        ? "📷 Photo"
                        : "هیچ محتوایی وجود ندارد"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyToMsg(null)}
                className="absolute -top-2 -left-1 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {imagePreview && (
            <div className="relative mt-2 w-fit">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>

            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-center py-3 px-16 bg-slate-800/50 border border-slate-700/50" >

          {/* دکمه اموجی یا استیکر */}
          <div className="flex absolute left-1 bottom-1.5 text-white">
            <button
              onClick={() => setOpen(true)}
              type="button"
              className="text-2xl p-1 hover:bg-gray-700 rounded-full transition"
            >
              <Sticker className="w-6 h-6" />
            </button>

            {/* آیکون انتخاب فایل */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-700 rounded-full transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            dir="auto"
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            placeholder="متن خود را تایپ کنید..."
            style={{
              resize: "none",
              maxHeight: `${maxHeight}px`,
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch", // scroll smooth در موبایل
              transition: "height 0.1s ease",
            }}
            className="w-full bg-transparent rounded text-white focus:outline-none focus:border-slate-500 px-2"
          />

          <ImageUploader
            setImage={setImagePreview}
            inputRef={fileInputRef}
          />

          {/* <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`absolute bottom-1.5 left-1.5 bg-slate-700/30 text-slate-400 hover:text-slate-200  rounded-md transition-colors px-3 py-2 ${imagePreview ? "text-cyan-500" : ""
            }`}
        >
          <ImageIcon className="size-5" />
        </button> */}


          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="absolute bottom-1.5 right-1.5 bg-gradient-to-r from-cyan-500  to-cyan-600 text-white rounded-md  font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 "
          >
            <SendIcon className="w-5 h-5 " />
          </button>
        </form>
      </div >

      <StickerPanel open={open} setOpen={setOpen} setText={setText} textareaRef={textareaRef} />
    </div>
  );
}
export default MessageInput;
