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

    const radius = 20;
    const stroke = 3;
    const r = radius - stroke * 2;
    const circumference = r * 2 * Math.PI;

    const uploadOffset = circumference - (uploadProgress / 100) * circumference;
    const downloadOffset = circumference - (progress / 100) * circumference;


    const handleFileClick = useCallback(() => {
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

        if (officeTypes.includes(file.type)) {
            const googleUrl =
                url || file.url;

            return window.open(googleUrl, "_blank");
        }

        // ZIP یا RAR → فقط دانلود می‌شوند
        if (zipTypes.includes(file.type)) {
            const a = document.createElement("a");
            a.href = url || file.url;
            a.download = file.name || "file";
            a.target = "_blank"
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }

        // PDF و عکس و غیره → باز شوند در tab جدید
        window.open(url || file.url, "_blank");

    }, []);



    return (
        <div dir="ltr" className="w-full flex gap-3 items-start text-white">

            {/* ICON */}
            <div className="relative w-12 h-12">

                {isUploading ? (
                    <div
                        onClick={cancelUpload}
                        className="relative w-12 h-12 flex items-center justify-center cursor-pointer"
                    >
                        <svg height={radius * 2} width={radius * 2} >
                            <circle
                                stroke={isMyMsg ? "#0284C7" : "#334155"} // دایره پس‌زمینه
                                fill="transparent"
                                strokeWidth={stroke}
                                r={r}
                                cx={radius}
                                cy={radius}
                                className="opacity-20"
                            />
                            <circle
                                stroke="#0EA5E9" // رنگ progress برای دید بهتر
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

                        <X className="w-5 h-5 font-bold text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                ) : downloaded ? (
                    <button
                        onClick={() => handleFileClick(file)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${isMyMsg ? "bg-sky-600" : "bg-slate-700"}`}
                    >
                        <Icon className="w-6 h-6 text-white" />
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
                    {!isUploading && !downloading &&
                        < span >
                            {formatBytes(totalBytes)}
                            < span className="ml-1.5 mr-0.5 text-blue-300 tracking-wider">{file.type.toUpperCase()}</span> {downloaded && "✔"}
                        </span>
                    }

                </span>
            </div >

        </div >
    );
}
export default memo(SmartPdfViewer)