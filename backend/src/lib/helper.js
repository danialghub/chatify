import cloudinary from "./cloudinary.js";
import dayjs from "dayjs";
import jalaliday from 'jalaliday'
import Message from "../models/Message.js";
import path from 'path'

export const uploadImage = async (image) => {
  const { secure_url } = await cloudinary.uploader.upload(image, {
    transformation: [
      { crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return secure_url
}

dayjs.extend(jalaliday);
dayjs.calendar("jalali");

export const newDay = async (roomId, isGroup) => {
  const lastMsg = await Message.findOne({ roomId, type: "dailyDate" })
    .sort({ createdAt: -1 })
    .lean();

  const today = dayjs().locale("fa").format("YYYY-MM-DD")
  const lastMsgDay = lastMsg ? dayjs(lastMsg.createdAt).locale("fa").format("YYYY-MM-DD") : null;

  let systemMsg = null;

  // اگر تاریخ عوض شده
  if (today !== lastMsgDay && isGroup) {
    systemMsg = await Message.create({
      roomId,
      type: "dailyDate",
      text: dayjs().locale("fa").format("D MMMM")
    });
  }

  return systemMsg;
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

export const uploadDocumentToCloudinary = async (file) => {
  try {
    if (!file.path) throw Error("Document file has no path");

    const ext = path.extname(file.originalname);   // مثل .pdf, .docx, .zip
    const base = path.basename(file.originalname, ext);

    const options = {
      resource_type: "raw",
      folder: "chat_files",
      public_id: base + ext,   // ⚠️ این کل ماجراست: public_id = name.ext
      overwrite: true,
    };

    const result = await cloudinary.uploader.upload(file.path, options);
    return result;

  } catch (err) {
    console.error("Cloudinary document upload error:", err);
    throw err;
  }
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












