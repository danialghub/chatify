import { useEffect, useRef, memo } from "react";
import TgsPlayer from "../helper/TgsPlayer";

function StickerPreview({ url, size }) {
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // فقط وظیفه همین است: پخش وقتی دیده می‌شود
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    playerRef.current?.play();
                } else {
                    playerRef.current?.pause();
                }
            },
            {
                root: null,
                threshold: 0.6,
            }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="">
            <TgsPlayer
                ref={playerRef}
                url={url}
                autoPlay={false}
                loop={true}
                size={size}
            />
        </div>
    );
}

export default memo(StickerPreview);
