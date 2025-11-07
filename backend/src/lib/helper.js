import cloudinary from "./cloudinary.js";

export const uploadImage = async (image) => {
    const { secure_url } = await cloudinary.uploader.upload(image, {
        transformation: [
            { crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
        ],
    });
    return secure_url
}
