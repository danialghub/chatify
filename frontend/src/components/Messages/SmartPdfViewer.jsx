import {
    Download,
    X,
    FileText,
    FileType,
    FileArchive,
    FileSpreadsheet,
    Presentation,
    FileIcon,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { memo, useCallback } from "react";

const fileTypeIcons = {
    pdf: FileText,
    word: FileType,
    excel: FileSpreadsheet,
    powerpoint: Presentation,
    zip: FileArchive,
    rar: FileArchive,
    file: FileIcon,
};

const SmartPdfViewer = ({
    isMyMsg,
    isUploading,
    downloader,
    file
}) => {

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

    const Icon = fileTypeIcons[file.type]

    const radius = 40;
    const stroke = 4;
    const r = radius - stroke * 2;
    const circumference = r * 2 * Math.PI;

    const uploadOffset = circumference - (uploadProgress / 100) * circumference;
    const downloadOffset = circumference - (progress / 100) * circumference;


    const handleFileClick = useCallback(() => {
        const blobUrl = url;          // همیشه Blob کش شده اگر دانلود شده باشه
        const remoteUrl = file.url;   // لینک Cloudinary

        const openURL = blobUrl || remoteUrl;

        const officeTypes = [
            "word",
            "excel",
            "powerpoint",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];

        const zipTypes = [
            "application/zip",
            "application/x-zip-compressed",
            "application/vnd.rar",
            "application/x-rar-compressed",
            "zip",
            "rar"
        ];

        // اگر هنوز دانلود نشده، دانلود را شروع کن
        if (!downloaded && !isUploading) {
            downloadFile();
            return;
        }

        // Office → باز کردن با URL دانلود شده
        if (officeTypes.includes(file.type)) {
            return window.open(openURL, "_blank");
        }

        // ZIP/RAR → اجباراً دانلود شوند
        if (zipTypes.includes(file.type)) {
            const a = document.createElement("a");
            a.href = openURL;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }

        // PDF/IMAGE/OTHER → باز در تب جدید
        window.open(openURL, "_blank");

    }, [url, downloaded, isUploading, file, downloadFile]);




    return (
        <div dir="ltr" className="w-full flex gap-3 items-start text-white">

            {/* ICON */}
            <div className="relative w-12 h-12">
                <button
                    disabled={isUploading && uploadProgress >= 90}
                    onClick={isUploading ? cancelUpload : downloaded ? handleFileClick : downloadFile}
                    className={`
            w-12 h-12 rounded-full flex items-center justify-center 
            ${isMyMsg ? "bg-sky-600" : "bg-slate-700"} 
            relative overflow-hidden
        `}
                >

                    {/* ======= CIRCULAR PROGRESS ======= */}
                    {(isUploading || downloading) && (
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                            {/* back circle */}
                            <circle
                                cx="50" cy="50" r="42"
                                stroke={`${isMyMsg ? "#0284C7" : "#F1F5F9"}60`}
                                strokeWidth="8"
                                fill="none"
                            />
                            {/* progress circle */}
                            <circle
                                cx="50" cy="50" r="42"
                                stroke={isUploading ? "#E0F2FE" : "#60A5FA"}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={264}     // ← 2πr دقیق = 2π*42
                                strokeDashoffset={isUploading ?
                                    264 - (uploadProgress / 100) * 264 :
                                    264 - (progress / 100) * 264}
                                strokeLinecap="round"
                                style={{
                                    transition: "stroke-dashoffset .35s ease",
                                }}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                    )}

                    {/* ======= CENTER ICON ======= */}
                    {isUploading ? (
                        <X className="w-5 h-5 text-white z-10" />
                    ) : downloaded ? (
                        <Icon className="w-6 h-6 text-white z-10" />
                    ) : downloading ? null : (
                        <Download className="w-6 h-6 text-white z-10" />
                    )}

                </button>
            </div>


            {/* TEXT */}
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold break-words line-clamp-2">
                    {file?.name}
                </span>

                <span className="text-xs mt-1">
                    {isUploading && `${formatBytes(uploadedSize)} / ${formatBytes(uploadTotal)}`}
                    {!isUploading && downloading && `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)} • DL ${progress}%`}
                    {!isUploading && !downloading &&
                        <span>
                            {formatBytes(totalBytes)}
                            <span className="ml-1.5 mr-0.5 text-blue-300 tracking-wider">{file?.type?.toUpperCase()}
                            </span> {downloaded && "✔"}</span>
                    }

                </span>
            </div>

        </div>
    );
}
export default memo(SmartPdfViewer)