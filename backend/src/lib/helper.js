import cloudinary from "./cloudinary.js";
import fs from 'fs'
import path from 'path'
import os from "os";
import dayjs from "dayjs";
import jalaliday from 'jalaliday'
import Message from "../models/Message.js";
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
  const lastMsg = await Message.findOne({ roomId })
    .sort({ createdAt: -1 })
    .lean();

  const today = dayjs().locale("fa").format("YYYY-MM-DD")
  const lastMsgDay = lastMsg ? dayjs(lastMsg.createdAt).locale("fa").format("YYYY-MM-DD") : null;

  let systemMsg = null;

  // اگر تاریخ عوض شده
  if (today !== lastMsgDay && isGroup) {
    systemMsg = await Message.create({
      roomId,
      system: true,
      text: dayjs().locale("fa").format("D MMMM")
    });
  }

  return systemMsg;
}


export const uploadFileToCloudinary = async (file) => {
  try {

    if (!file.path) throw Error('there is no path for file')

    let options = {
      resource_type: "auto",
      folder: "chat_files",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    if (file.mimetype.startsWith("image/")) {
      // فقط برای عکس فشرده‌سازی انجام بده
      options.transformation = [
        { quality: "auto", fetch_format: "auto" }
      ];
    }

    // اگر pdf یا فایل غیر عکس باشد، هیچ transformation ست نمی‌کنیم
    const result = await cloudinary.uploader.upload(file.path, options);



    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
};







