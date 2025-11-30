import { useSmartFileHandler } from "@/hooks/useSmartFileHandler";
import SmartPdfViewer from "./SmartPdfViewer";
import SmartImageViewer from "./SmartImageViewer";


export default function SmartFileDownloader({ file, isMyMsg, isUploading }) {

    

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
