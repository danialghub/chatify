import { uploadImage } from "../lib/helper.js";
import { io, emitToOnlineMembers, getReceiverSocketId } from "../lib/socket.js";
import { messageService } from '../services/message.service.js'
import { chatRoomService } from '../services/chatRoom.service.js'
import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";

// 🟢 دریافت پیام‌های هر روم
export const getMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) return res.status(400).json({ message: "شناسه روم نامعتبر است" });

    const messages = await messageService.findByRoomId(roomId)

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessagesByRoomId:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};
// 🟡 ارسال پیام
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { roomId } = req.params;
    const { text, image, replyTo: replyId } = req.body;

    if (!text && !image)
      return res.status(400).json({ message: "متن یا تصویر الزامی است" });

    if (!roomId)
      return res.status(400).json({ message: "شناسه اتاق نامعتبر است" });

    const room = await chatRoomService.findById(roomId)
    if (!room) return res.status(404).json({ message: "اتاق یافت نشد" });

    // آپلود تصویر در صورت نیاز
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
    }

    // بررسی reply message
    const replyTo = replyId && (await Message.exists({ _id: replyId })) ? replyId : null;
    // ساخت پیام جدید
    const newMessage = await messageService.create({
      senderId,
      roomId,
      text,
      image: imageUrl,
      replyTo,
    });

    // ارسال پیام به کاربران دیگر
    const exceptionId = getReceiverSocketId(senderId);
    if (exceptionId) io.to(roomId).except(exceptionId).emit("message:send", newMessage);

    // اعلان پیام جدید
    const membersExceptMe = newMessage.roomId.members
      .filter(m => m._id.toString() !== senderId.toString());
    emitToOnlineMembers(membersExceptMe, "message:notif", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};
// 🔴 حذف پیام
export const removeMsg = async (req, res) => {
  try {
    const userId = req.user._id;
    const { msgId } = req.params;
    if (!msgId) return res.status(400).json({ message: "شناسه پیام نامعتبر است" });

    const message = await Message.findById(msgId);
    if (!message) return res.status(404).json({ message: "پیام یافت نشد" });
    //آیا پیام برای خود شخص
    if (message.senderId.toString() !== userId.toString())
      return res.status(403).json({ message: "اجازه حذف ندارید" });

    const room = await ChatRoom.findById(message.roomId);
    if (!room) return res.status(404).json({ message: "اتاق یافت نشد" });

    // حذف پیام
    await message.deleteOne();

    // به‌روزرسانی پیام آخر در صورت نیاز
    if (room.lastMessage?.toString() === msgId) {
      const prevMsg = await Message.findOne({ roomId: room._id })
        .sort({ createdAt: -1 })
        .select("_id");
      room.lastMessage = prevMsg?._id || null;
      await room.save();
    }

    res.json({ message: "پیام با موفقیت حذف شد" });
    io.to(room._id.toString()).emit("message:remove", { msgId ,room});
  } catch (err) {
    console.error("removeMsg:", err);
    res.status(500).json({ message: "خطای سرور" });
  }
};
// 🟢 علامت‌زدن پیام‌ها به عنوان خوانده‌شده
export const markMessageAsSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    if (!roomId)
      return res.status(400).json({ message: "شناسه اتاق نامعتبر است" });

    await Message.updateMany(
      { roomId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    res.status(200).json({ message: "پیام‌ها به عنوان خوانده‌شده علامت‌گذاری شدند" });
  } catch (error) {
    console.error("checkMessageAsSeen:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

