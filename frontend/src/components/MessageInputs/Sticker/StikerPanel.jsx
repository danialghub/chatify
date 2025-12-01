import { memo } from "react";
import StickerPreview from "../../Messages/StickerPreview";
import { useChatStore } from "@/store/useChatStore";

export default function StickerPanel({ stickers = [], setOpen }) {
  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendSticker = (sticker) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    const formData = new FormData()
    formData.append('sticker', JSON.stringify(sticker));
    sendMessage(formData);
    
    setTimeout(() => {
      document.getElementById('messageEndRef')?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }, 100);

  };

  return (
    <div className="relative flex flex-wrap gap-5 sm:gap-4">
      {stickers.length ? (
        stickers.map((sticker, i) => (
          <StickerItem
            key={i}
            sticker={sticker}
            onSend={handleSendSticker}
          />
        ))
      ) : (
        <div className="text-white text-xl text-center w-full py-8">
          😅 هیچ استیکری وجود ندارد
        </div>
      )}
    </div>
  );
}

const StickerItem = memo(function StickerItem({
  sticker,
  onSend,
}) {
  return (
    <div
      className="rounded-xl p-1 px-2 bg-white/10 hover:scale-110 active:scale-95 transition-all"
      onClick={() => onSend(sticker)}
    >
      <StickerPreview
        url={sticker.url}
        size={91}
      />
    </div>
  );
});
