import { useState, useRef, memo } from "react";
import TgsPlayer from "../../helper/TgsPlayer";
import { useChatStore } from "@/store/useChatStore";

export default function StickerPanel({ stickers = [], setOpen }) {
  const { sendMessage, isSoundEnabled } = useChatStore();
  const playersRef = useRef([]);

  const handleSendSticker = (sticker) => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
    sendMessage({ sticker });
    setOpen(false);
  };

  const handlePointer = (i, type) => {
    playersRef.current.forEach((p, idx) => {
      if (!p) return;
      if (idx === i) {
        type === "down" ? p.play?.() : p.pause?.();
      } else {
        p.pause?.();
      }
    });
  };

  return (
    <div className="relative flex flex-wrap gap-4">
      {stickers.length ? (
        stickers.map((sticker, i) => (
          <StickerItem
            key={i}
            sticker={sticker}
            i={i}
            onPointer={(type) => handlePointer(i, type)}
            onSend={handleSendSticker}
            setPlayer={(ref) => (playersRef.current[i] = ref)}
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
  i,
  onPointer,
  onSend,
  setPlayer,
}) {
  return (
    <div
      className="rounded-xl p-1 bg-white/10 hover:scale-110 active:scale-95 transition-all"
      onPointerDown={() => onPointer("down")}
      onPointerUp={() => onPointer("up")}
      onPointerLeave={() => onPointer("up")}
      onClick={() => onSend(sticker)}
    >
      <TgsPlayer
        ref={setPlayer}
        url={sticker.url}
        autoPlay={false}
        loop={true}
        size={70}
      />
    </div>
  );
});
