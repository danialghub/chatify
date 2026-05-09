import express from "express";
import {
  editMessage,
  getMessagesByRoomId,
  markMessageAsSeen,
  removeMsg,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from '../lib/multer.js'

const router = express.Router();

//کاربر باید هویتش احراز شده باشد برای دسترسی به این مسیر ها
router.use(protectRoute);

//دریافت تمام پیام های یک اتاق با شناسه اتاق
router.get("/:roomId", getMessagesByRoomId);

//ارسال یک پیام به اتاق با شناسه اتاق
router.post("/send/:roomId", upload.single('image'),sendMessage);
//سین زدن پیام های اتاق با شناسه اتاق
router.post("/seenby/:roomId", markMessageAsSeen);

//حذف یک پیام خاص
router.delete("/remove/:msgId", removeMsg);

//ادیت یک پیام خاص
router.put("/edit/:msgId", editMessage);

export default router;
