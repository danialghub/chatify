import { memo } from 'react';
import TgsPlayer from '../../helper/TgsPlayer'

 const StickerItem = memo(({ sticker, i, isPlaying, onClick, onPreview, registerPlayer }) => (
    <div
        className={`rounded-xl p-1 transition-all duration-150 ${isPlaying ? "ring-2 ring-blue-400 scale-105" : "bg-white/10 hover:scale-110"
            }`}
        onClick={() => onClick(sticker)}
        onTouchStart={() => onPreview(sticker, i)}
        onMouseDown={() => onPreview(sticker, i)}
    >
        <TgsPlayer
            ref={(el) => registerPlayer(el, i)}
            url={sticker.url}
            autoPlay={false}
            loop={false}
            size={80}
        />
    </div>
));
export default StickerItem