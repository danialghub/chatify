import { useEffect, useRef, useState, forwardRef, useImperativeHandle, memo } from "react";
import Lottie from "lottie-react";
import pako from "pako";

const TgsPlayer = forwardRef(
  (
    {
      url,
      autoPlay = false,
      loop = false,
      onComplete,
      onReady,
      onPlay,
      onStop,
      size,
    },
    ref
  ) => {
    const [data, setData] = useState(null);
    const lottieRef = useRef(null);
    const isPlayingRef = useRef(false);
    const initializedRef = useRef(false);
    const [isFetching, setIsFetching] = useState(false)

    // --- Load TGS ---
    useEffect(() => {
      setIsFetching(true);
      setData(null);
      initializedRef.current = false;

      (async () => {
        try {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          const json = JSON.parse(pako.inflate(new Uint8Array(buf), { to: "string" }));

          setData(json);
        } catch (err) {
          console.error("TGS load error:", err);
        } finally {
          setIsFetching(false);
        }
      })();

      
    }, [url]);

    // --- Ready + AutoPlay ---
    useEffect(() => {
      if (!data) return;

      // صبر کن تا لوتی کامل mount بشه
      const playWhenReady = () => {
        const player = lottieRef.current;
        if (player && player.play) {
          if (autoPlay && !initializedRef.current) {
            player.play();
            isPlayingRef.current = true;
            initializedRef.current = true;
            onPlay?.();
          }
          onReady?.();
        } else {
          // اگر هنوز آماده نیست، در فریم بعد امتحان کن
          requestAnimationFrame(playWhenReady);
        }
      };

      playWhenReady();
    }, [data, autoPlay, onPlay, onReady]);

    // --- Expose methods ---
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          const player = lottieRef.current;
          if (!player) return;
          player.play?.();
          isPlayingRef.current = true;
          onPlay?.();
        },
        pause: () => {
          const player = lottieRef.current;
          player?.pause?.();
          isPlayingRef.current = false;
        },
        stop: () => {
          const player = lottieRef.current;
          player?.stop?.();
          isPlayingRef.current = false;
          onStop?.();
        },
        setSpeed: (s) => lottieRef.current?.setSpeed?.(s),
        isPlaying: () => isPlayingRef.current,
        goToFrame: (frame) => lottieRef.current?.goToAndStop?.(frame, true),
        getCurrentFrame: () => lottieRef.current?.currentFrame || 0,
      }),
      [onPlay, onStop]
    );

    if (!data) return null;

    return !isFetching?(
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop={loop}
        autoplay={false} // ❗ ما دستی پخش می‌کنیم
        renderer="canvas"
        onComplete={() => onComplete?.()}
        style={{ width: size, height: size }}
      />
    ): <div className="size-36 bg-gray-700/10 animate-pulse"></div>;
  }
);

export default memo(TgsPlayer);
