import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();
  const sendMessageHandler = (text) => {
    sendMessage({ text })
  }
  const messages = [
    "👋 سلام ",
    "🤝 چطوری؟",
    "🤙 چه خبرا؟"
  ]
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 rounded-full flex items-center justify-center mb-5">
        <MessageCircleIcon className="size-8 text-cyan-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-3">
   شروع کن  {name}  گفتگو را در گروه 
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-slate-400 text-sm">
          این آغاز گفت‌وگوی شماست. برای شروع گفتگو، پیامی بفرستید.
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mx-auto"></div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {messages.map((text, idx) => (
          <button
            onClick={() => sendMessageHandler(text)}
            key={idx}
            className="px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 rounded-full hover:bg-cyan-500/20 transition-colors">
            {text}
          </button>
        ))}

      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
