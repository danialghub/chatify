import { toast } from 'react-hot-toast'
import { imgageSchema } from '@/lib/validation'

const ImageUploader = ({ inputRef, setImage, ...props }) => {

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return
        const validation = imgageSchema.safeParse(file)
        if (!validation.success) {
            toast.error(validation.error.issues[0].message);

            setImage(null)
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setImage(reader.result)
        reader.readAsDataURL(file)
    };

    return (
        <input
            type="file"
            ref={inputRef}
            accept='image/*'
            hidden
            onChange={handleImageChange}
            {...props}
        />
    )
}

export default ImageUploader