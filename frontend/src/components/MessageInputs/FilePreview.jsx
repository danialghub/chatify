import {
    FileText,
    FileType,
    FileArchive,
    FileSpreadsheet,
    Presentation,
    FileIcon,
    XIcon
} from "lucide-react";



const iconConfig = {
    pdf: {
        icon: FileText,
        border: "border-red-400/30",
        bg: "from-red-600/20 via-red-500/10 to-red-700/10",
        color: "text-red-400"
    },
    word: {
        icon: FileType,
        border: "border-blue-400/30",
        bg: "from-blue-600/20 via-blue-500/10 to-blue-700/10",
        color: "text-blue-400"
    },
    powerpoint: {
        icon: Presentation,
        border: "border-orange-400/30",
        bg: "from-orange-600/20 via-orange-500/10 to-orange-700/10",
        color: "text-orange-400"
    },

    // 🔥 اکسل (جدید)
    excel: {
        icon: FileSpreadsheet,
        border: "border-green-400/30",
        bg: "from-green-600/20 via-green-500/10 to-green-700/10",
        color: "text-green-400"
    },

    zip: {
        icon: FileArchive,
        border: "border-yellow-400/30",
        bg: "from-yellow-600/20 via-yellow-500/10 to-yellow-700/10",
        color: "text-yellow-400"
    },
    rar: {
        icon: FileArchive,
        border: "border-purple-400/30",
        bg: "from-purple-600/20 via-purple-500/10 to-purple-700/10",
        color: "text-purple-400"
    },
    file: {
        icon: FileIcon,
        border: "border-slate-400/30",
        bg: "from-slate-600/20 via-slate-500/10 to-slate-700/10",
        color: "text-slate-300"
    }
};

const FilePreview = ({ filePreview, removeFile }) => {
    const type = filePreview.type;

    if (type === "image") {
        return (
            <div className="relative mt-2 w-fit">
                <img
                    src={filePreview.data}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-md border border-slate-700"
                />

                <button
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                    type="button"
                >
                    <XIcon className="size-4" />
                </button>
            </div>
        );
    }

    const cfg = iconConfig[type] || iconConfig.file;
    const Icon = cfg.icon;

    return (
        <div className="relative mt-2 w-fit">
            <div
                className={`
                    w-24 h-24 p-2 rounded-md shadow
                    flex flex-col items-center justify-center
                    bg-gradient-to-br ${cfg.bg}
                    border ${cfg.border}
                `}
            >
                <Icon className={`size-7 mb-2 ${cfg.color}`} />

                <p
                    className="text-xs text-white text-center truncate w-full px-1"
                    title={filePreview.name}
                >
                    {filePreview.name}
                </p>
            </div>

            <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
            >
                <XIcon className="size-4" />
            </button>
        </div>
    );
};

export default FilePreview;
