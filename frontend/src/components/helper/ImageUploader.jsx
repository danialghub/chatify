import { toast } from "react-hot-toast";
import { fileSchema } from "@/lib/validation";

const FileUploader = ({ inputRef, setFile, ...props }) => {
    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validation = fileSchema.safeParse(file);
        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            setFile(null);
            return;
        }

        // اگر عکس بود → Base64
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setFile({
                    type: "image",
                    data: reader.result, // Base64 برای نمایش
                    name: file.name,
                    file,                // File object برای ارسال
                });
            reader.readAsDataURL(file);
        }


        // اگر PDF بود → فقط خود فایل را برگردان
        else if (file.type === "application/pdf") {
            setFile({
                type: "pdf",
                name: file.name,
                size: file.size,
                file, // خود File object را نگه دار
            });


        }
    };

    return (
        <input
            type="file"
            ref={inputRef}
            accept="image/*,application/pdf"
            hidden
            onChange={handleChange}
            {...props}
        />
    );
};

export default FileUploader;
