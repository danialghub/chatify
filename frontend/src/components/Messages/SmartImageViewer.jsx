import { Download, X } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
export default function SmartImageViewer({
    downloader,
    title,
    isUploading

}) {

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


    const radius = 30;
    const stroke = 4;
    const r = radius - stroke * 2;
    const circumference = 2 * Math.PI * r;
    const uploadOffset = circumference - (uploadProgress / 100) * circumference;
    const downloadOffset = circumference - (progress / 100) * circumference;
    const offset = isUploading ? uploadOffset : downloadOffset

    return (
        <div className="w-full flex flex-col items-start gap-2" title={title}>

            {/* IMAGE WRAPPER */}
            <div
                className="
                    relative 
                    sm:max-w-[20vw]
                    sm:w-[20vw]
                    w-[70vw]
                    max-w-[70vw]
                    rounded-xl 
                    overflow-hidden 
                    bg-black/20 
                    shadow-lg 
                "
            >

                {/* Main Image */}
                {(downloaded || thumbUrl) && (
                    <img
                        src={downloaded ? url : thumbUrl}
                        className="rounded-lg aspect-video object-cover w-full transition-transform duration-300 hover:scale-[1.02] "
                        loading="lazy"
                        onClick={() => downloaded && window.open(url, "_blank")}
                    />
                )}



                {/* TOP-LEFT FILE SIZE */}
                {/* TOP-LEFT FILE SIZE / STATUS */}
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


                {/* DOWNLOAD & upload BUTTON */}
                {(
                    <>
                        {isUploading ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // جلوگیری از bubbling روی حباب پیام
                                    cancelUpload();       // مطمئن می‌شویم آخرین controller استفاده می‌شود
                                }}
                                className="
    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center
    bg-black/30
    hover:bg-black/40
    backdrop-blur-sm
    transition
  "
                            >
                                <X className="size-7 text-white" />
                            </button>

                        ) : !downloaded && !downloading ? (
                            <button
                                onClick={downloadFile}
                                className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center
          bg-black/30
          hover:bg-black/40
          backdrop-blur-sm
          transition
        "
                            >
                                <Download className="size-7 text-white" />
                            </button>
                        ) : null}
                    </>
                )}



                {/* BLUE PROGRESS RING */}
                {downloading || isUploading && (
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
            </div>




        </div >
    );
}




