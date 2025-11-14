import { useEffect, useRef } from "react";
import TgsPlayer from "../helper/TgsPlayer";
import { useChatStore } from "../../store/useChatStore";

export default function StickerPreview({ url, size }) {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const isActiveRef = useRef(false); // آیا استیکر در حال پخش است
    const isVisibleRef = useRef(false); // آیا استیکر داخل viewport هست
    const { isFetchingSticker } = useChatStore()
    useEffect(() => {

        // Intersection Observer برای بررسی اینکه استیکر در viewport هست یا نه
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    isVisibleRef.current = true;
                    // اگر فعال است و داخل viewport، پخش کن
                    if (!isActiveRef.current) {
                        playerRef.current?.play();
                        isActiveRef.current = true;
                    }
                } else {
                    isVisibleRef.current = false;
                    // خارج از viewport => توقف
                    if (isActiveRef.current) {
                        playerRef.current?.pause();
                        isActiveRef.current = false;
                    }
                }
            },
            {
                root: null, // viewport
                threshold: 0.7, // حداقل 70٪ دیده شود
            }
        );

        if (containerRef.current) observer.observe(containerRef.current);



        // کنترل کلیک و ترک پنجره
        const handleClick = (e) => {
            const container = document.getElementById('appContainer');
            if (!container) return;

            if (container.contains(e.target)) {
                if (!isActiveRef.current && isVisibleRef.current) {
                    playerRef.current?.play();
                    isActiveRef.current = true;
                }
            } else {
                if (isActiveRef.current) {
                    playerRef.current?.pause();
                    isActiveRef.current = false;
                }
            }
        };

        const handlePause = () => {
            if (isActiveRef.current) {
                playerRef.current?.pause();
                isActiveRef.current = false;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) handlePause();
        };

        const handleWindowBlur = () => {
            handlePause();
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, []);


    return  (
        <div id="chatContainer" ref={containerRef}>
            <TgsPlayer
                ref={playerRef}
                url={url}
                autoPlay={true} // مدیریت با play/pause خودمون
                loop={true}
                size={size}
            />
        </div>
    ) 
}
