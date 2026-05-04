import { Download, X } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import ImageOverlayViewer from './ImageOverlayViewer'
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
        thumb,
        progress,
        downloading,
        downloaded,
        totalBytes,
        downloadedBytes,
        downloadFile,
        formatBytes,

    } = downloader;

    const { uploadProgress, uploadedSize, cancelUpload, uploadTotal, setOverlayImg } = useChatStore();

    const [showImage, setShowImage] = useState(false)

    const radius = 30;
    const stroke = 4;
    const r = radius - stroke * 2;
    const circumference = 2 * Math.PI * r;
    const uploadOffset = circumference - (uploadProgress / 100) * circumference;
    const downloadOffset = circumference - (progress / 100) * circumference;
    const offset = isUploading ? uploadOffset : downloadOffset

    // const aspectRatio = size.w && size.h ? size.w / size.h : 1;
    return (
        <div>
            <div className="w-full flex flex-col items-start gap-2" title={title}>

                <div
                    className={`
    relative
    inline-block
    rounded-xl
    overflow-hidden
    bg-black/40
    max-w-[65vw] md:max-w-[30vw]
    max-h-[45vh] md:max-h-[55vh]
    
    ${hasBg ? (isMyMsg ? "border-2 border-sky-700" : "border-2 border-slate-800") : ""}
  `}
                >
                    <img
                        src={downloaded ? url : thumb.url}
                        style={{ width: image?.width, height: image?.height }}
                        className="
      block
      max-w-full
      max-h-[55vh]
      
      object-contain
      select-none
    "
                        loading="lazy"
                        decoding="async"
                        onClick={() => downloaded && setOverlayImg(true, url)}
                    />



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
            {showImage && <ImageOverlayViewer url={url} setShowImage={() => setShowImage(false)} />}
        </div>
    );
}




export default memo(SmartImageViewer)