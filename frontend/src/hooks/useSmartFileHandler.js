import { useState, useEffect } from "react";
import axios from "axios";
import { useChatStore } from "@/store/useChatStore";

export function useSmartFileHandler(msg, isMyMsg = false, isUploading = false) {
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [url, setUrl] = useState("");
    const [totalBytes, setTotalBytes] = useState(0);
    const [downloadedBytes, setDownloadedBytes] = useState(0);
    const [thumbUrl, setThumbUrl] = useState("");

    const file = msg.file

    const FILE_URL = file?.url;
    const CACHE_NAME = `files-cache`;

    const isImage = file?.type?.startsWith("image/") || file?.type === "image";


    const addRenderedFiles = useChatStore(state => state.addRenderedFiles)
    /* ---------------------- CHECK CACHE / LOAD ----------------------- */
    useEffect(() => {
        if (!file) return;

        if (isMyMsg && file.url) {
            setUrl(file.url);
            addRenderedFiles(msg._id, file.url)
            setDownloaded(true);
            setTotalBytes(file.size);
        } else {
            checkCache();
        }

        if (isImage) {
            createThumbnail(FILE_URL.replace("/upload/", "/upload/w_50,h_50,c_fill/"));
        }

    }, [file, isMyMsg]);


    /* ------------------------------------------------------------- */
    /* ------- Remove CACHE ------------------ */
    /* ------------------------------------------------------------- */
    const clearFileCache = async () => {
        try {
            if ("caches" in window) {
                const cacheNames = await caches.keys();

                // همه cacheها را پیدا کن که اسمش match می‌کند
                const targetCaches = cacheNames.filter(name => name === CACHE_NAME);

                // پاک کردن هر کدام
                await Promise.all(targetCaches.map(name => caches.delete(name)));

                console.log(`[Cache] "${CACHE_NAME}" cleared successfully`);
            }
        } catch (err) {
            console.error("[Cache] Failed to clear:", err);
        }
    }

    /* ---------------------- CHECK CACHE ----------------------- */
    const checkCache = async () => {
        try {
            if ("caches" in window) {
                const cache = await caches.open(CACHE_NAME);
                const cached = await cache.match(FILE_URL);
                if (cached) {
                    const blob = await cached.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    setUrl(blobUrl);
                    addRenderedFiles(msg._id, blobUrl)
                    setDownloaded(true);
                    setTotalBytes(blob.size);
                    return;
                }
            }

            // HEAD request for size
            const head = await axios.head(FILE_URL);
            const size = head.headers["content-length"];
            if (size) setTotalBytes(parseInt(size, 10));

        } catch (err) {
            console.error("Cache check failed:", err);
        }
    };

    /* ---------------------- CREATE THUMBNAIL FOR IMAGES ----------------------- */
    // ساخت thumbnail
    const createThumbnail = async (imageUrl) => {
        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => {
                const size = 50; // 50px ثابت
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d");
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (size - w) / 2;
                const y = (size - h) / 2;

                ctx.drawImage(img, x, y, w, h);
                const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

                setThumbUrl(thumbnail);
            };

            img.src = imageUrl;
        } catch (err) {
            console.error("Thumbnail error:", err);
        }
    };





    /* ---------------------- DOWNLOAD ----------------------- */
    const downloadFile = async () => {
        if (isUploading) return;

        try {
            setDownloading(true);
            setProgress(0);
            setDownloadedBytes(0);

            const response = await axios({
                url: FILE_URL,
                method: "GET",
                responseType: "blob",
                onDownloadProgress: (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded * 100) / e.total);
                        setProgress(percent);
                        setDownloadedBytes(e.loaded);
                    }
                },
            });

            const blob = response.data;
            const blobUrl = URL.createObjectURL(blob);

            setUrl(blobUrl);
            setDownloaded(true);

            if ("caches" in window) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(FILE_URL, new Response(blob, { status: 200 }));
            }

        } catch (err) {
            console.error("Download error:", err);
        } finally {
            setDownloading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const units = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
    };

    return {
        isImage,
        url,
        thumbUrl,
        progress,
        downloading,
        downloaded,
        totalBytes,
        downloadedBytes,

        downloadFile,
        formatBytes,
    };
}



