import { useEffect, useRef, useState, forwardRef, useImperativeHandle, memo } from "react";
import lottie from "lottie-web";
import pako from "pako";

// ------------ Memory Cache (مثل تلگرام) ------------
const tgsCache = new Map();

const TgsPlayer = forwardRef(
  ({ url, autoPlay = false, loop = false, onComplete, onReady, onPlay, onStop, size }, ref) => {
    console.log(url);
    
    const containerRef = useRef(null);
    const animRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const initialized = useRef(false);
    const isPlaying = useRef(false);

    // ---------- Load + Cache ----------
    useEffect(() => {
      let isMounted = true;
      setIsLoading(true);
      initialized.current = false;

      const load = async () => {
        if (tgsCache.has(url)) {
          mountAnimation(tgsCache.get(url));
          return;
        }

        try {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          const bytes = new Uint8Array(buf);

          let jsonStr;
          try {
            const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
            if (isGzip) jsonStr = pako.inflate(bytes, { to: "string" });
            else jsonStr = new TextDecoder().decode(bytes);
          } catch {
            // fallback deflate raw
            jsonStr = pako.inflate(bytes, { to: "string", raw: true });
          }

          const parsed = JSON.parse(jsonStr);
          tgsCache.set(url, parsed);
          mountAnimation(parsed);
        } catch (err) {
          console.error("TGS load error:", err);
        }
      };

      const mountAnimation = (animationData) => {
        if (!containerRef.current) return;

        if (animRef.current) animRef.current.destroy(); // destroy previous

        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "canvas",
          loop,
          autoplay: false,
          animationData,
        });

        animRef.current.addEventListener("DOMLoaded", () => {
          if (!isMounted) return;
          setIsLoading(false);
          onReady?.();

          if (autoPlay && !initialized.current) {
            initialized.current = true;
            animRef.current.play();
            isPlaying.current = true;
            onPlay?.();
          }

          animRef.current.addEventListener("complete", () => {
            onComplete?.();
            isPlaying.current = false;
          });
        });
      };

      load();

      return () => {
        isMounted = false;
        if (animRef.current) {
          animRef.current.destroy();
          animRef.current = null;
        }
      };
    }, [url]);

    // ---------- Expose methods ----------
    useImperativeHandle(ref, () => ({
      play: () => {
        animRef.current?.play();
        isPlaying.current = true;
        onPlay?.();
      },
      pause: () => {
        animRef.current?.pause();
        isPlaying.current = false;
      },
      stop: () => {
        animRef.current?.stop();
        isPlaying.current = false;
        onStop?.();
      },
      setSpeed: (s) => animRef.current?.setSpeed(s),
      isPlaying: () => isPlaying.current,
    }));

    return (
      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className={`rounded-xl ${isLoading ? "animate-pulse bg-gray-700/10" : ""}`}
      />
    );
  }
);

export default memo(TgsPlayer);
