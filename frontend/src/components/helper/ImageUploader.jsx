import { toast } from "react-hot-toast";
import { fileSchema } from "@/lib/validation";
import { checkFileType } from '@/lib/helper'
const FileUploader = ({ inputRef, setFile, ...props }) => {
    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        console.log(file);

        const validation = fileSchema.safeParse(file);
        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            setFile(null);
            return;
        }
        let type = checkFileType(file)
        // اگر عکس بود → Base64
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setFile({
                    type,
                    data: reader.result, // Base64 برای نمایش
                    name: file.name,
                    file,                // File object برای ارسال
                });
            reader.readAsDataURL(file);
        }


        // اگر PDF بود → فقط خود فایل را برگردان
        else {
            setFile({
                type,
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
         


            hidden
            onChange={handleChange}
            {...props}
        />
    );
};

export default FileUploader;
