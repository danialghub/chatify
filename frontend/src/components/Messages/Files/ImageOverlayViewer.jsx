import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";

export default function PhotoOverlayFullScreen( ) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const { overlayImg, setOverlayImg } = useChatStore();
    const { url, isOpen } = overlayImg
    const onClose = () => setOverlayImg(false, null)

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === 'r') handleRotate();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    const handleDownload = async () => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `photo-${Date.now()}.jpg`;
            link.click();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleMouseDown = (e) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return isOpen && (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Modern blurred backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/70 to-black/70 backdrop-blur-md animate-in fade-in duration-300" />

            {/* Card Container */}
            <div
                className="relative w-full max-w-5xl max-h-[85vh] bg-black/40 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Container */}
                <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
                    <div
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                    >
                        <img
                            src={url}
                            alt="Preview"
                            className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-red-500/80 backdrop-blur-md rounded-full p-2.5 transition-all duration-200 hover:scale-110 group"
                >
                    <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>

                {/* Control Buttons */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                    <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                        <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                        <ZoomOut className="w-5 h-5 text-white" />
                    </button>
                    <div className="w-px h-6 bg-white/20 my-auto" />
                    <button onClick={handleRotate} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                        <RotateCw className="w-5 h-5 text-white" />
                    </button>
                    <div className="w-px h-6 bg-white/20 my-auto" />
                    <button onClick={handleDownload} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                        <Download className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}