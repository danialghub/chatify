import { useState, useRef, useCallback } from "react";
import TgsPlayer from "../../helper/TgsPlayer";
import { useChatStore } from "@/store/useChatStore";
import React from "react";

export default function StickerPanel({ stickers = [], setOpen }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(null);
  const panelRef = useRef(null);
  const playersRef = useRef([]);
  const readyRef = useRef([]);
  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendSticker = (sticker) => {
    if (!sticker.url) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();
    sendMessage({ sticker });
    setOpen(false);
  };

  const startPlayAt = useCallback((i) => {
    const player = playersRef.current[i];
    if (!player) return;
    if (!readyRef.current[i]) return;
    playersRef.current.forEach((p, idx) => idx !== i && p?.stop?.());
    player.setSpeed?.(1);
    player.play?.();
    setPlayingIndex(i);
  }, []);

  const handleReady = (i) => {
    readyRef.current[i] = true;
    if (i === currentIndex) startPlayAt(i);
    if (i === 0) startPlayAt(0);
  };

  const handleComplete = (i) => {
    playersRef.current[i]?.stop?.();
    const next = i < stickers.length - 1 ? i + 1 : 0;
    setCurrentIndex(next);
    setTimeout(() => startPlayAt(next), 120);
  };

  const handleChangeStickerPreview = (sticker, i) => {
    playersRef.current.forEach((p, idx) => idx !== i && p?.stop?.());
    setCurrentIndex(i);
    startPlayAt(i);
  };

  return (
    <div ref={panelRef} className="relative flex flex-wrap gap-4">
      {stickers.length ? (
        stickers.map((sticker, i) => (
          <StickerItem
            key={i}
            sticker={sticker}
            i={i}
            playingIndex={playingIndex}
            handleSendSticker={handleSendSticker}
            handleChangeStickerPreview={handleChangeStickerPreview}
            handleReady={handleReady}
            handleComplete={handleComplete}
            playersRef={playersRef}
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

const StickerItem = React.memo(
  ({
    sticker,
    i,
    playingIndex,
    handleSendSticker,
    handleChangeStickerPreview,
    handleReady,
    handleComplete,
    playersRef,
  }) => {
    return (
      <div
        className={`rounded-xl p-1 transition-all duration-150 ${
          playingIndex === i
            ? "ring-2 ring-blue-400 scale-105"
            : "bg-white/10 hover:scale-110"
        }`}
        onClick={() => handleSendSticker(sticker)}
        onTouchStart={() => handleChangeStickerPreview(sticker, i)}
        onMouseDown={() => handleChangeStickerPreview(sticker, i)}
      >
        <TgsPlayer
          ref={(el) => (playersRef.current[i] = el)}
          url={sticker.url}
          autoPlay={false}
          loop={false}
          onReady={() => handleReady(i)}
          onComplete={() => handleComplete(i)}
          size={75}
        />
      </div>
    );
  }
);
