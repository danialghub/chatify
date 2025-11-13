import { useEffect, useRef, useState, forwardRef, useImperativeHandle, memo } from "react";
import Lottie from "lottie-react";
import pako from "pako";

const TgsPlayer = forwardRef(({ url, autoPlay = false, loop = false, onComplete, onReady, onPlay, onStop ,size}, ref) => {
  const [data, setData] = useState(null);
  const lottieRef = useRef(null);
  const isPlayingRef = useRef(false); // به جای state

  // Load TGS
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
    return () => { active = false; }
  }, [url]);

  // Ready
  useEffect(() => {
    if (!data) return;
    const id = setTimeout(() => {
      try { lottieRef.current?.setSpeed?.(1); } catch(e){}
      onReady?.();
    }, 0);
    return () => clearTimeout(id);
  }, [data, onReady]);

  // Expose controls
  useImperativeHandle(ref, () => ({
    play: () => {
      try { lottieRef.current?.setSpeed?.(1); } catch(e){}
      lottieRef.current?.play?.();
      isPlayingRef.current = true;
      onPlay?.();
    },
    pause: () => {
      lottieRef.current?.pause?.();
      isPlayingRef.current = false;
    },
    stop: () => {
      lottieRef.current?.stop?.();
      isPlayingRef.current = false;
      onStop?.();
    },
    setSpeed: (s) => lottieRef.current?.setSpeed?.(s),
    isPlaying: () => isPlayingRef.current,
    goToFrame: (frame) => lottieRef.current?.goToAndStop?.(frame, true),
    getCurrentFrame: () => lottieRef.current?.currentFrame || 0
  }), [onPlay, onStop]); // بدون isPlaying و ready

  if (!data) return null;

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={data}
      loop={loop}
      autoplay={autoPlay}
      renderer="canvas"
      onComplete={() => onComplete?.()}
      style={{ width: size, height: size }}
    />
  );
});

export default memo(TgsPlayer);
