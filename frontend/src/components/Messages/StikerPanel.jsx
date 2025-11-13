import { useState, useRef, useCallback } from "react";
import TgsPlayer from "./TgsPlayer";
import { useChatStore } from "@/store/useChatStore";

export default function StickerPanel({ stickers = [], setOpen }) {
  const [currentIndex, setCurrentIndex] = useState(0); // index که داریم تلاش می‌کنیم پخشش کنیم
  const [playingIndex, setPlayingIndex] = useState(null); // index که واقعاً در حال پخشه (برای border)
  const panelRef = useRef(null);
  const playersRef = useRef([]); // نگه‌دارنده ref های TgsPlayer
  const readyRef = useRef([]); // بولی آماده بودن هر پلیر
  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendSticker = (sticker) => {
    if (!sticker.url) return
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      sticker
    });
    setOpen(false)

  };
  const handleChangeStickerPreview = (sticker ,i) => {
    playersRef.current.forEach((p, idx) => { if (idx !== i) p?.stop?.(); });
    setCurrentIndex(i);
    startPlayAt(i);
    onSelect?.(sticker.url);
  }

  // helper: شروع پخش برای index مشخص (اگر آماده باشد)
  const startPlayAt = useCallback((i) => {
    const player = playersRef.current[i];
    if (!player) return;
    // اگر هنوز آماده نیست، صبر کن
    if (!player.isReady?.() && !readyRef.current[i]) return;
    // قطع همه دیگران
    playersRef.current.forEach((p, idx) => {
      if (p && idx !== i) p.stop?.();
    });
    setPlayingIndex(i);
    player.setSpeed?.(1);
    player.play?.();
  }, []);


  // callback که هر TgsPlayer وقتی آماده شد صدا می‌زنه
  const handleReady = (i) => {
    readyRef.current[i] = true;
    // اگر پنل بازه و index فعلی را می‌خواهیم پخش کنیم، شروع می‌کنیم
    if (i === currentIndex) startPlayAt(i);
    // اگر پنل تازه باز شده و i === 0 -> شروع کن
    if (i === 0) startPlayAt(0);
  };

  // وقتی یک استیکر تموم شد، به بعدی بریم
  const handleComplete = (i) => {
    // stop this one to be safe
    playersRef.current[i]?.stop?.();
    const next = i < stickers.length - 1 ? i + 1 : 0;
    setCurrentIndex(next);
    // small delay قبل از شروع بعدی برای smoothness
    setTimeout(() => startPlayAt(next), 120);
  };

  return (
    <div ref={panelRef} className="relative flex flex-wrap gap-3">

      {stickers.length ? (
        stickers.map((sticker, i) => (
          <div
            key={i}
            className={`rounded-xl p-1 transition-all duration-150
                    ${playingIndex === i ? "ring-2 ring-blue-400 scale-105" : "bg-white/10 hover:scale-110"}`}
            onClick={() => {
              handleSendSticker(sticker)
            }}
            onTouchStart={()=>handleChangeStickerPreview(sticker,i)}
            onMouseDown={()=>handleChangeStickerPreview(sticker,i)}
          >

            <TgsPlayer
              ref={(el) => (playersRef.current[i] = el)}
              url={sticker.url}
              autoPlay={false}
              loop={false}
              onReady={() => handleReady(i)}
              onComplete={() => handleComplete(i)}
              onPlay={() => setPlayingIndex(i)}
              onStop={() => setPlayingIndex(null)}
              size={80}
            />

          </div>
        ))
      ) : (
        <div className="text-white text-xl text-center w-full py-8">😅 هیچ استیکری وجود ندارد</div>
      )}

    </div>
  );
}