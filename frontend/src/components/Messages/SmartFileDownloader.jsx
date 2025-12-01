import { useSmartFileHandler } from "@/hooks/useSmartFileHandler";
import SmartPdfViewer from "./SmartPdfViewer";
import SmartImageViewer from "./SmartImageViewer";
import { memo } from "react";


const SmartFileDownloader = ({ file, isMyMsg, isUploading }) => {



    const downloader = useSmartFileHandler(
        file,
        isMyMsg,
        isUploading,
    );



    if (downloader.isImage) {
        return (
            <SmartImageViewer
                downloader={downloader}
                title={file.name}
                isUploading={isUploading}
            />
        );
    }

    return (
        <SmartPdfViewer
            file={file}
            isMyMsg={isMyMsg}
            isUploading={isUploading}
            downloader={downloader}
        />
    );
}
export default memo(SmartFileDownloader)