import cloudinary from "./cloudinary.js";
import path from 'path'
import fs from 'fs'


export const uploadImage = async (image) => {
  const { secure_url } = await cloudinary.uploader.upload(image, {
    transformation: [
      { crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return secure_url
}



export const uploadImageToCloudinary = async (file) => {
  try {
    if (!file.path) throw Error("Image file has no path");

    const options = {
      resource_type: "image",
      folder: "chat_images",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      transformation: [
        { quality: "auto", fetch_format: "auto" } // فشرده‌سازی خودکار
      ]
    };

    const result = await cloudinary.uploader.upload(file.path, options);
    return result;

  } catch (err) {
    console.error("Cloudinary image upload error:", err);
    throw err;
  }
};



export const uploadDocumentToCloudinary = async (file, signal) => {
  if (!file.path) throw new Error("Document file has no path");

  const ext = path.extname(file.originalname); // مثل .pdf, .docx, .zip
  const base = path.basename(file.originalname, ext);

  return new Promise((resolve, reject) => {
    const options = {
      resource_type: "raw",
      folder: "chat_files",
      public_id: base + ext,
      overwrite: true,
      // type: "authenticated", // اختیاری
      format: ext.replace(".", ""), // 👈 تعیین فرمت
    };

    // 🔹 ساخت یک stream برای خواندن فایل
    const readStream = fs.createReadStream(file.path);

    // 🔹 بررسی لغو
    signal?.addEventListener("abort", () => {
      readStream.destroy();
      reject(new Error("Upload cancelled"));
    });

    const cloudStream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    // pipe فایل به cloudinary
    readStream.pipe(cloudStream);
  });
};


export const checkFileType = (file) => {
  const name = file.originalname.toLowerCase();
  const mime = file.mimetype;

  // استخراج پسوند
  const ext = name.split('.').pop();  // مثلا "pptx"

  // Images
  if (mime?.startsWith("image/"))
    return ["image", ext];

  if (ext === "pdf")
    return ["pdf", ext];

  if (ext === "doc" || ext === "docx")
    return ["word", ext];

  if (ext === "ppt" || ext === "pptx")
    return ["powerpoint", ext];

  if (ext === "xls" || ext === "xlsx")
    return ["excel", ext];

  if (ext === "zip")
    return ["zip", ext];

  if (ext === "rar")
    return ["rar", ext];

  // Default
  return ["file", ext];
};












