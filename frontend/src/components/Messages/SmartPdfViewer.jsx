import { FileText, Download, X } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
export default function SmartPdfViewer({
    isMyMsg,
    isUploading,
    downloader,
    file
}) {

    const {
        url,
        progress,
        downloading,
        downloaded,
        totalBytes,
        downloadedBytes,
        downloadFile,
        formatBytes,
    } = downloader;

    const { uploadProgress, uploadedSize, cancelUpload, uploadTotal } = useChatStore();


    const radius = 20;
    const stroke = 3;
    const r = radius - stroke * 2;
    const circumference = r * 2 * Math.PI;

    const uploadOffset = circumference - (uploadProgress / 100) * circumference;
    const downloadOffset = circumference - (progress / 100) * circumference;


    return (
        <div dir="ltr" className="w-full flex gap-3 items-start text-white">

            {/* ICON */}
            <div className="relative w-12 h-12">

                {isUploading ? (
                    <>
                        <svg height={radius * 2} width={radius * 2} className="absolute">
                            <circle
                                stroke={isMyMsg ? "#0284C7" : "#334155"}
                                fill="transparent"
                                strokeWidth={stroke}
                                r={r}
                                cx={radius}
                                cy={radius}
                                className="opacity-20"
                            />
                            <circle
                                stroke="#0EA5E9"
                                fill="transparent"
                                strokeWidth={stroke}
                                r={r}
                                cx={radius}
                                cy={radius}
                                strokeDasharray={circumference}
                                strokeDashoffset={uploadOffset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${radius} ${radius})`}
                            />
                        </svg>

                        <button
                            onClick={cancelUpload}
                            className={`absolute top-0 left-0 w-12 h-12 rounded-full flex items-center justify-center bg-${isMyMsg ? "sky-500" : "slate-700"}`}
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </>
                ) : downloaded ? (
                    <button
                        onClick={() => window.open(url, "_blank")}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${isMyMsg ? "bg-sky-600" : "bg-slate-700"}`}
                    >
                        <FileText className="w-6 h-6 text-white" />
                    </button>
                ) : downloading ? (
                    <svg height={radius * 2} width={radius * 2}>
                        <circle
                            stroke={isMyMsg ? "#0284C7" : "#334155"}
                            fill="transparent"
                            strokeWidth={stroke}
                            r={r}
                            cx={radius}
                            cy={radius}
                            className="opacity-20"
                        />
                        <circle
                            stroke="#0EA5E9"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={r}
                            cx={radius}
                            cy={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={downloadOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${radius} ${radius})`}
                        />
                    </svg>
                ) : (
                    <button
                        onClick={downloadFile}
                        className={`w-12 h-12 rounded-full flex items-center justify-center bg-${isMyMsg ? "sky-500" : "slate-700"}`}
                    >
                        <Download className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>

            {/* TEXT */}
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold break-words line-clamp-2">
                    {file?.name}
                </span>




                <span className="text-xs mt-1">
                    {isUploading && `${formatBytes(uploadedSize)} / ${formatBytes(uploadTotal)}`}
                    {!isUploading && downloading && `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)} • DL ${progress}%`}
                    {!isUploading && !downloading && downloaded && `${formatBytes(totalBytes)} PDF ✔`}
                    {!isUploading && !downloading && !downloaded && `${formatBytes(totalBytes)} PDF`}
                </span>
            </div>

        </div>
    );
}
