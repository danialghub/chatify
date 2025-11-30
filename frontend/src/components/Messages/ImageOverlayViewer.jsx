import { X } from "lucide-react";

export default function PhotoOverlayFullScreen({ url, onClose, downloading, progress }) {
    const radius = 60;
    const stroke = 6;
    const r = radius - stroke * 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={onClose}
        >
            {/* IMAGE */}
            <img
                src={url}
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن روی کلیک تصویر
            />

            {/* CLOSE BUTTON */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 bg-black/50 hover:bg-black/70 rounded-full p-2 z-50"
            >
                <X className="w-7 h-7 text-white" />
            </button>

            {/* PROGRESS CIRCLE */}
            {downloading && (
                <div className="absolute flex items-center justify-center">
                    <svg height={radius * 2} width={radius * 2}>
                        <circle
                            stroke="#ffffff33"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={r}
                            cx={radius}
                            cy={radius}
                        />
                        <circle
                            stroke="#0EA5E9"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={r}
                            cx={radius}
                            cy={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${radius} ${radius})`}
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}
