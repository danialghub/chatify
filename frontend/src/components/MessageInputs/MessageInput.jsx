import { useEffect, useRef, useState } from "react";
import useKeyboardSound from "@/hooks/useKeyboardSound";
import { useChatStore } from "@/store/useChatStore";
import { Edit, ImageIcon, Paperclip, SendIcon, Sticker, XIcon } from "lucide-react";
import { ImageUploader } from '@/components/index'
import StickerPanel from "./Sticker/Sticker";
import TextArea from "./TextArea";

const MessageInput = ({ textareaRef }) => {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [cursorPos, setCursorPos] = useState(0)
  const [image, setImage] = useState(null);
  const [emojiTab, setEmojiTab] = useState('emoji');

  const fileInputRef = useRef(null);
  const inputContainerRef = useRef(null);

  const [open, setOpen] = useState(false)


  const { sendMessage, isSoundEnabled, replyToMsg, setReplyToMsg, setMessageInput, messageInput, messageInputMode, editMessage, setMessageInputMode } = useChatStore();

  const [text, setText] = useState('')


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();
    const form = new FormData()
    const img = fileInputRef.current?.files[0] || null
    if (text) form.append('text', text)
    if (img) form.append('image', img)
    if (replyToMsg) form.append('replyTo', JSON.stringify(replyToMsg))


    if (messageInputMode === "create") {

      sendMessage(form, image);

      setTimeout(() => {
        document.getElementById('messageEndRef')?.scrollIntoView({ behavior: "smooth" })
      }, 100);
      setImage("");
      setReplyToMsg(null);

    } else {
      editMessage(messageInput._id, text)
      setMessageInput({});
      setText('')
      setMessageInputMode('create')
    }
    setText('')
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const addEmoji = emoji => {
    const before = text.slice(0, cursorPos)
    const after = text.slice(cursorPos)
    const newMsg = before + emoji + after
    setText(newMsg)

    setCursorPos(cursorPos + emoji.length)
  }

  useEffect(() => {
    if (messageInput) {
      setText(messageInput.text)
    }
  }, [messageInput?.text])

  return (
    <div className="relative" ref={inputContainerRef}>
      <div className="p-4 pt-0 border-t border-slate-700/50">

        <div className="max-w-3xl mx-auto mb-2 ">
          {replyToMsg && (
            <div className="relative w-full text-white/80">
              < div className=" bg-slate-900/80 border-r-8 border-r-cyan-600 rounded-r-lg">
                {/* msg content */}
                <div dir="rtl" className="mt-2 py-2  text-right text-sm">
                  <span className="!text-md font-bold pr-3">پاسخ به {replyToMsg.senderId.name} :</span>
                  <p className="text-xs truncate opacity-70 pr-6 mt-1.5 ">
                    {replyToMsg.text
                      ?
                      replyToMsg.text
                      : replyToMsg.image
                        ? "📷 Photo"
                        : replyToMsg.sticker
                          ? `${replyToMsg.sticker.emoji} Sticker`
                          : "هیچ محتوایی وجود ندارد"
                    }
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
          {image && (
            <div className="relative mt-2 w-fit">
              <img
                src={image}
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
        {/* edit panel */}
        {messageInputMode === "edit" &&
          <div className="p-2 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center  gap-4">
                <Edit size={20} className="text-blue-400" />
                <div className="flex flex-col justify-start text-sm gap-1">
                  <h4 className="text-blue-500">ویرایش پیام</h4>
                  {messageInput?.text.slice(0, 10).concat('...')}
                </div>
              </div>
              <XIcon size={22} cursor='pointer' onClick={() => {
                setMessageInput('');
                setMessageInputMode('create')
              }} />
            </div>
          </div>
        }

        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-center py-3 px-16 bg-slate-800/50 border border-slate-700/50 " >

          {/* دکمه اموجی یا استیکر */}
          <div className="flex absolute left-1 bottom-1.5 text-white items-center ">

            <button
              onClick={() => setOpen(prev => !prev)}
              type="button"
              className="
    w-8 h-8 ml-0.5 text-2xl  rounded-full hover:bg-gradient-to-br hover:from-cyan-500/80 hover:to-blue-500/80 shadow-lg  hover:scale-110  hover:shadow-xl transition-all duration-300 ease-out
    ring-2 ring-transparent hover:ring-white/30 backdrop-blur-sm  text-center  flex justify-center items-center
  "
            >
              {emojiTab === "emoji"
                ? <span className="pt-2">🤣</span>
                : <Sticker className="w-6 h-6" />}
            </button>


            {/* آیکون انتخاب فایل */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-700 rounded-full transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="size-5" />
            </button>
          </div>


          <TextArea
            taRef={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            onSelect={e => setCursorPos(e.target.selectionStart)}
            onFocus={() => setOpen(false)}
            placeholder="متن خود را تایپ کنید..."
          />

          <ImageUploader
            setImage={setImage}
            inputRef={fileInputRef}
          />



          <button
            type="submit"
            disabled={!text?.trim() && !image}
            className="absolute bottom-1.5 right-1.5 bg-gradient-to-r from-cyan-500  to-cyan-600 text-white rounded-md  font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 "
          >
            <SendIcon className="w-5 h-5 " />
          </button>
        </form>
      </div >

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
}
export default MessageInput;
