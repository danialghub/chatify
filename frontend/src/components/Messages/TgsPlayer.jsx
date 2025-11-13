import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import Lottie from "lottie-react";
import pako from "pako";

const TgsPlayer = forwardRef(({ url, autoPlay = false, loop = false, onComplete, onReady, onPlay, onStop ,size}, ref) => {
  console.log(url);

  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const lottieRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const json = JSON.parse(pako.inflate(new Uint8Array(buf), { to: "string" }));
        if (!active) return;
        setData(json);
      } catch (err) {
        console.error("TGS load error:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [url]);

  // وقتی data آماده شد، صبر یک tick تا Lottie mount بشه، سپس ready = true و callback
  useEffect(() => {
    if (!data) return;
    // give Lottie one tick to mount and expose instance
    const id = setTimeout(() => {
      setReady(true);
      // set default speed to 1 (در صورت نیاز می‌تونی مقداری دیگر قرار بدی)
      try { lottieRef.current?.setSpeed?.(1); } catch (e) { }
      onReady?.();
    }, 0);
    return () => clearTimeout(id);
  }, [data, onReady]);

  // expose کنترل‌ها به بیرون
  useImperativeHandle(ref, () => ({
    play: () => {
      if (!ready) return;
      try { lottieRef.current?.setSpeed?.(1); } catch (e) { }
      lottieRef.current?.play?.();
      setIsPlaying(true);
      onPlay?.();
    },
    stop: () => {
      lottieRef.current?.stop?.();
      setIsPlaying(false);
      onStop?.();
    },
    pause: () => {
      lottieRef.current?.pause?.();
      setIsPlaying(false);
    },
    setSpeed: (s) => {
      lottieRef.current?.setSpeed?.(s);
    },
    isReady: () => ready,
    isPlaying: () => isPlaying,
  }), [ready, isPlaying, onPlay, onStop]);

  if (!data) return null;

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={data}
      loop={loop}
      autoplay={autoPlay}
      onComplete={() => {
        setIsPlaying(false);
        onComplete?.();
      }}
      style={{ width: size, height: size }}
    />
  );
});

export default TgsPlayer;