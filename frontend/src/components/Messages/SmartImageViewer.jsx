import { Download, X } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { memo, useEffect, useState } from "react";
const SmartImageViewer = ({
    downloader,
    title,
    isUploading,
    image,
    isMyMsg,
    hasBg,
    children

}) => {

    const {
        url,
        thumbUrl,
        progress,
        downloading,
        downloaded,
        totalBytes,
        downloadedBytes,
        downloadFile,
        formatBytes,

    } = downloader;

    const { uploadProgress, uploadedSize, cancelUpload, uploadTotal } = useChatStore();
    const [size, setSize] = useState({ w: null, h: null });
    useEffect(() => {
        if (!(url || image)) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            setSize({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.src = url || image;

    }, [url, downloaded, image]);


    const radius = 30;
    const stroke = 4;
    const r = radius - stroke * 2;
    const circumference = 2 * Math.PI * r;
    const uploadOffset = circumference - (uploadProgress / 100) * circumference;
    const downloadOffset = circumference - (progress / 100) * circumference;
    const offset = isUploading ? uploadOffset : downloadOffset

    return (
        <div className="w-full flex flex-col items-start gap-2" title={title}>
            <div
                className={`
          relative 
          md:max-w-[30vw]
          max-w-[60vw]
          md:max-h-[55vh]
          max-h-[40vh]
          rounded-xl 
          overflow-hidden 
          w-[300px]
          border-2
          ${hasBg ? isMyMsg ? "border-sky-700" : "border-slate-800" : ""}
    `}
                width={size.w}
                height={size.h}
            >
                {/* فقط وقتی ابعاد مشخص شد نمایش بده */}
                {size.w && (
                    <img
                        src={downloaded ? url : thumbUrl}

                        className="

              w-full 
              h-full
              object-contain
              transition-transform duration-300 hover:scale-[1.02]
            "
                        loading="lazy"
                        decoding="async"
                        onClick={() => downloaded && window.open(url, "_blank")}
                    />
                )}

                {/* حجم فایل (بالا-چپ) */}
                <div
                    dir="ltr"
                    className="
            absolute top-2 left-2
            z-10
            bg-black/60 backdrop-blur-sm
            text-white text-xs
            px-2 py-0.5
            rounded-md
            flex items-center justify-center
          "
                >
                    {downloading
                        ? `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`
                        : isUploading
                            ? `${formatBytes(uploadedSize)} / ${formatBytes(uploadTotal)}`
                            : downloaded
                                ? `${formatBytes(totalBytes)} ✔`
                                : `${formatBytes(totalBytes)}`
                    }
                </div>

                {/* دکمه دانلود / کنسل آپلود */}
                {(
                    <>
                        {isUploading ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    cancelUpload();
                                }}
                                className="
                  absolute inset-0
                  flex items-center justify-center
                  bg-black/30 hover:bg-black/40
                  backdrop-blur-sm transition
                "
                            >
                                <X className="size-7 text-white" />
                            </button>
                        ) : !downloaded && !downloading ? (
                            <button
                                onClick={downloadFile}
                                className="
                  absolute inset-0
                  flex items-center justify-center
                  bg-black/30 hover:bg-black/40
                  backdrop-blur-sm transition
                "
                            >
                                <Download className="size-7 text-white" />
                            </button>
                        ) : null}
                    </>
                )}

                {/* حلقه Progress */}
                {(downloading || isUploading) && (
                    <div className="absolute inset-0 flex items-center justify-center">
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

                <div className="absolute bottom-1 right-1 ">
                    {children}
                </div>
            </div>

        </div>
    );
}




export default memo(SmartImageViewer)