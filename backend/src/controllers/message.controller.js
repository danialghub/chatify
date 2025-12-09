import {
  uploadImageToCloudinary, uploadDocumentToCloudinary, checkFileType
} from "../lib/helper.js";
import { io, emitToOnlineMembers, getReceiverSocketId } from "../lib/socket.js";

import { messageService } from '../services/message.service.js'
import { chatRoomService } from '../services/chatRoom.service.js'
import Message from "../models/Message.js";



/**
 * دریافت تمام پیام‌های یک روم بر اساس شناسه روم
 */
export const getMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی اعتبار شناسه روم
     * --------------------------------------------------------------------------*/
    if (!roomId) {
      return res.status(400).json({ message: "شناسه روم نامعتبر است" });
    }

    /* --------------------------------------------------------------------------
     * 2️⃣ دریافت پیام‌ها از سرویس
     * --------------------------------------------------------------------------*/
    const messages = await messageService.findByRoomId(roomId);

    /* --------------------------------------------------------------------------
     * 3️⃣ پاسخ موفقیت‌آمیز
     * --------------------------------------------------------------------------*/
    res.status(200).json(messages);

  } catch (error) {
    console.error("getMessagesByRoomId:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};



/**
 * ارسال پیام به روم
 * - شامل متن، استیکر، فایل یا پاسخ به پیام دیگر
 */
export const sendMessage = async (req, res) => {

  // 🔹 اگر کاربر قبلاً request را لغو کرده باشد، هیچ کاری نکن
  if (req.aborted) return;

  try {
    const senderId = req.user._id;
    const { roomId } = req.params;
    const { text, replyTo: replyId, sticker = null } = req.body;
    const file = req.file;

    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی وجود محتوا
     * --------------------------------------------------------------------------*/
    if (!text && !sticker && !file) {
      return res.status(400).json({
        message: "متن، تصویر، فایل یا استیکر الزامی است"
      });
    }

    /* --------------------------------------------------------------------------
     * 2️⃣ بررسی شناسه روم
     * --------------------------------------------------------------------------*/
    if (!roomId)
      return res.status(400).json({ message: "شناسه اتاق نامعتبر است" });

    const room = await chatRoomService.findById(roomId);
    if (!room)
      return res.status(404).json({ message: "اتاق یافت نشد" });

    /* --------------------------------------------------------------------------
     * 3️⃣ ساخت آبجکت پیام اولیه
     * --------------------------------------------------------------------------*/
    const messageData = { senderId, roomId, seenBy: [senderId] };

    // متن
    if (text) messageData.text = text;

    // استیکر
    if (sticker) messageData.sticker = sticker;

    // reply به پیام دیگر
    if (replyId) {
      const exists = await Message.exists({ _id: replyId });
      if (exists) messageData.replyTo = replyId;
    }

    /* --------------------------------------------------------------------------
     * 4️⃣ آپلود فایل (در صورت وجود) با امکان لغو
     * --------------------------------------------------------------------------*/
    if (file) {
      let uploadedFile = null;
      if (file.mimetype.startsWith("image/")) {
        uploadedFile = await uploadImageToCloudinary(file, req.signal); // ← اضافه شد
      } else {
        uploadedFile = await uploadDocumentToCloudinary(file, req.signal); // ← اضافه شد
      }

      // 🔹 بررسی لغو بعد از آپلود قبل از ذخیره پیام
      if (req.aborted) {
        return; // کاربر لغو کرده، هیچ چیزی ثبت نشود
      }

      // تصحیح نام فایل
      const safeName = Buffer.from(file.originalname, "latin1").toString("utf8");

      // تعیین نوع واقعی فایل
      let [type] = checkFileType(file)

      messageData.file = {
        type,
        name: safeName,
        size: uploadedFile.bytes,
        url: uploadedFile.secure_url
      };
    }

    /* --------------------------------------------------------------------------
     * 5️⃣ بررسی اینکه حداقل یک فیلد معتبر وجود داشته باشد
     * --------------------------------------------------------------------------*/
    if (!messageData.text && !messageData.image && !messageData.file && !messageData.sticker) {
      return res.status(400).json({ message: "پیام معتبر نیست" });
    }

    /* --------------------------------------------------------------------------

    /* --------------------------------------------------------------------------
     * 7️⃣ ساخت پیام اصلی
     * --------------------------------------------------------------------------*/
    const newMessage = await messageService.create(messageData);


    /* --------------------------------------------------------------------------
     * 8️⃣ ارسال پیام به اعضای آنلاین روم
     * --------------------------------------------------------------------------*/
    const exceptionId = getReceiverSocketId(senderId);

    io.to(roomId).except(exceptionId).emit("message:send", { roomId, messages: [newMessage] });


    /* --------------------------------------------------------------------------
     * 9️⃣ ارسال اعلان پیام به سایر اعضا
     * --------------------------------------------------------------------------*/
    const membersExceptMe = newMessage.roomId.members.filter(
      (m) => m._id.toString() !== senderId.toString()
    );
    emitToOnlineMembers(membersExceptMe, "message:notif", newMessage);

    /* --------------------------------------------------------------------------
     * 🔟 پاسخ موفقیت‌آمیز
     * --------------------------------------------------------------------------*/
    res.status(201).json([newMessage]);

  } catch (error) {
    // 🔹 اگر خطای لغو آپلود باشد، کاری انجام نده
    if (error.message === "Upload cancelled") {
      return;
    }
    console.error("sendMessage:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};




/**
 * حذف یک پیام
 * - فقط فرستنده پیام اجازه حذف دارد
 * - در صورت حذف پیام آخر، پیام آخر اتاق بروزرسانی می‌شود
 */
export const removeMsg = async (req, res) => {
  try {
    const userId = req.user._id;
    const { msgId } = req.params;

    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی اعتبار شناسه پیام
     * --------------------------------------------------------------------------*/
    if (!msgId)
      return res.status(400).json({ message: "شناسه پیام نامعتبر است" });

    /* --------------------------------------------------------------------------
     * 2️⃣ یافتن پیام
     * --------------------------------------------------------------------------*/
    const message = await Message.findById(msgId);
    if (!message)
      return res.status(404).json({ message: "پیام یافت نشد" });

    /* --------------------------------------------------------------------------
     * 3️⃣ بررسی اینکه پیام برای خود کاربر است
     * --------------------------------------------------------------------------*/
    if (message.senderId.toString() !== userId.toString())
      return res.status(403).json({ message: "اجازه حذف ندارید" });

    /* --------------------------------------------------------------------------
     * 4️⃣ یافتن اتاق پیام
     * --------------------------------------------------------------------------*/
    let room = await chatRoomService.findById(message.roomId);
    if (!room)
      return res.status(404).json({ message: "اتاق یافت نشد" });

    /* --------------------------------------------------------------------------
     * 5️⃣ حذف پیام
     * --------------------------------------------------------------------------*/
    await message.deleteOne();

    /* --------------------------------------------------------------------------
     * 6️⃣ بروزرسانی پیام آخر در اتاق در صورت نیاز
     * --------------------------------------------------------------------------*/
    if (room.lastMessage?._id?.toString() === msgId.toString()) {
      // یافتن آخرین پیام غیرسیستمی در اتاق
      const prevMsg = await Message.findOne({
        roomId: room._id,
        type: { $ne: "dailyDate" }
      }).sort({ createdAt: -1 });

      // بروزرسانی پیام آخر اتاق
      room = await chatRoomService.updateLastMessage(
        room._id,
        prevMsg?._id || null
      );
    }

    /* --------------------------------------------------------------------------
     * 7️⃣ ارسال پاسخ موفقیت‌آمیز و اطلاع‌رسانی به اعضای آنلاین
     * --------------------------------------------------------------------------*/
    res.json({ message: "پیام با موفقیت حذف شد" });
    io.to(room._id.toString()).emit("message:remove", { msgId, room });

  } catch (err) {
    console.error("removeMsg:", err);
    res.status(500).json({ message: "خطای سرور" });
  }
};



/**
 * علامت‌گذاری همه پیام‌های یک روم به عنوان خوانده‌شده توسط کاربر
 */
export const markMessageAsSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    if (!roomId)
      return res.status(400).json({ message: "شناسه اتاق نامعتبر است" });

    /* --------------------------------------------------------------------------
     * 1️⃣ پیدا کردن پیام‌های دیده نشده
     * --------------------------------------------------------------------------*/
    const unseenMessages = await Message.find({
      roomId,
      seenBy: { $ne: userId }
    }).sort({ createdAt: 1 }); // مرتب سازی زمانی، قدیمی به جدید

    if (!unseenMessages.length) {
      return res.status(200).json({ message: "پیامی برای سین شدن وجود ندارد" });
    }

    /* --------------------------------------------------------------------------
     * 2️⃣ Emit به sender ها
     * --------------------------------------------------------------------------
     * - فقط آخرین پیام هر فرستنده emit می‌شود تا تعداد event ها کم شود
     * --------------------------------------------------------------------------*/
    const latestMessagesBySender = new Map();

    unseenMessages.forEach(msg => {
      latestMessagesBySender.set(msg.senderId);
    });

    for (const [senderId] of latestMessagesBySender.entries()) {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        console.log('backend');
        
        io.to(senderSocketId).emit("message:seen", { roomId, seenBy: userId });
      }
    }

    /* --------------------------------------------------------------------------
     * 3️⃣ آپدیت دیتابیس
     * --------------------------------------------------------------------------*/
    await Message.updateMany(
      { roomId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    /* --------------------------------------------------------------------------
     * 4️⃣ پاسخ موفق
     * --------------------------------------------------------------------------*/
    res.status(200).json({
      message: "پیام‌ها به عنوان خوانده‌شده علامت‌گذاری شدند",
    });

  } catch (error) {
    console.error("markMessageAsSeen:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};



