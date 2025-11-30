import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import StickerPreview from '../Messages/StickerPreview'
const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();
  const sendMessageHandler = (sticker) => {
    sendMessage({ sticker })
  }
  const messages = [
    "👋 سلام ",
    "🤝 چطوری؟",
    "🤙 چه خبرا؟"
  ]
  const message = {
    name: "سلام",
    url: "/Stickers/Hi.tgs",
    emoji: "👋"
  }
  return (
    <div className="flex  items-center justify-center h-full  ">
      <div className="bg-gradient-to-br from-teal-700/20 via-cyan-800/20 to-slate-900/20 text-center flex flex-col items-center justify-center rounded-md p-6 ">


        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 rounded-full flex items-center justify-center mb-5">
          <MessageCircleIcon className="size-8 text-cyan-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-200 mb-3">
          گفتگو را با {name} آغاز کنید
        </h3>
        <div className="flex flex-col  max-w-md ">
          <p className="text-slate-400 text-sm">
            این آغاز گفت‌وگوی شماست. برای شروع گفتگو، پیامی بفرستید.

          </p>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mx-auto"></div>
        </div>
        <div className="drop-shadow-[0_0_25px_rgba(0,255,255,0.18)]">
          <button
            onClick={() => sendMessageHandler(message)}
            className="px-4  ">
            <StickerPreview url={message.url} size={150} />
          </button>
        </div>
      </div>


    </div>
  );
};

export default NoChatHistoryPlaceholder;
