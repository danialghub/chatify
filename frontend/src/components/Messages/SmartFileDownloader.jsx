import { useSmartFileHandler } from "@/hooks/useSmartFileHandler";
import SmartPdfViewer from "./SmartPdfViewer";
import SmartImageViewer from "./SmartImageViewer";
import { memo } from "react";



const SmartFileDownloader = ({ msg, isMyMsg, isUploading }) => {

  

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
                isUploading={isUploading}
            />
        );
    }

    return (
        <SmartPdfViewer
            file={msg.file}
            isMyMsg={isMyMsg}
            isUploading={isUploading}
            downloader={downloader}
        />
    );
}
export default memo(SmartFileDownloader)