import { useEffect, useRef, useState } from "react";
import useKeyboardSound from "@/hooks/useKeyboardSound";
import { useChatStore } from "@/store/useChatStore";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import { ImageUploader } from '@/components/index'

const MessageInput = ({ }) => {
  const { playRandomKeyStrokeSound } = useKeyboardSound();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // ارتفاع رو ریست کن
      textarea.style.height = textarea.scrollHeight + "px"; // تنظیم به اندازه متن
    }
  }, [text]);


  return (
    <div className="p-4 pt-1 border-t border-slate-700/50">

      <div className="max-w-3xl mx-auto mb-3 ">
        {replyToMsg && (
          <div className="relative w-full text-white/80">
            < div className=" bg-white/5 border-r-8 border-r-cyan-600 rounded-r-lg">
              {/* msg content */}
              <p dir="rtl" className="mt-2  py-2 break-words text-right text-sm">
                <span className="!text-md font-bold pr-3">پاسخ به {replyToMsg.senderId.name} :</span>
                <p className="text-xs truncate opacity-70 pr-6 mt-1.5">
                  {replyToMsg.text
                    ?
                    replyToMsg.text
                    : replyToMsg.image
                      ? "📷 Photo"
                      : "هیچ محتوایی وجود ندارد"}
                </p>
              </p>
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

        <textarea
          ref={textareaRef}
          dir="auto"
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="w-full max-h-[20vh] [unicode-bidi:plaintext]  resize-none overflow-hidden bg-transparent rounded  text-white focus:outline-none focus:border-slate-500 transition-all "
          placeholder="متن خود را تایپ کنید..."
        />

        <ImageUploader
          setImage={setImagePreview}
          inputRef={fileInputRef}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`absolute bottom-1.5 left-1.5 bg-slate-700/30 text-slate-400 hover:text-slate-200  rounded-md transition-colors px-3 py-2 ${imagePreview ? "text-cyan-500" : ""
            }`}
        >
          <ImageIcon className="size-5" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="absolute bottom-1.5 right-1.5 bg-gradient-to-r from-cyan-500  to-cyan-600 text-white rounded-md  font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 "
        >
          <SendIcon className="w-5 h-5 " />
        </button>
      </form>
    </div >
  );
}
export default MessageInput;
