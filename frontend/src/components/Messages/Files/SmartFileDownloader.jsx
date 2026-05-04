import { useSmartFileHandler } from "@/hooks/useSmartFileHandler";
import SmartPdfViewer from "./SmartPdfViewer";
import SmartImageViewer from "./SmartImageViewer";
import { memo } from "react";


const SmartFileDownloader = ({ msg, isMyMsg, isUploading, hasBg, children }) => {



    const downloader = useSmartFileHandler(
        msg,
        isMyMsg,
        isUploading,
    );


    if (downloader.isImage) {
        return (
            <SmartImageViewer
                downloader={downloader}
                title={msg.file.name}
                image={msg.file}
                isUploading={isUploading}
                isMyMsg={isMyMsg}
                hasBg={hasBg}
            >
                {children}
            </SmartImageViewer>
        );
    }

    return (
        <SmartPdfViewer
            file={msg.file}
            isMyMsg={isMyMsg}
            isUploading={isUploading}
            downloader={downloader}
        >
            {children}
        </SmartPdfViewer>
    );
}
export default memo(SmartFileDownloader)