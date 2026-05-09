import { uploadImage } from "../lib/helper.js";
import { io, emitToOnlineMembers, getReceiverSocketId } from "../lib/socket.js";
import { messageService } from '../services/message.service.js'
import { chatRoomService } from '../services/chatRoom.service.js'
import Message from "../models/Message.js";

//  دریافت پیام‌های هر روم
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
// ارسال پیام
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { roomId } = req.params;
    const { text, replyTo: replyId, sticker = null } = req.body;
    const image = req?.file

    if (!text && !image && !sticker)
      return res.status(400).json({ message: "متن یا تصویر الزامی است" });

    if (!roomId)
      return res.status(400).json({ message: "شناسه اتاق نامعتبر است" });

    const room = await chatRoomService.findById(roomId)
    if (!room) return res.status(404).json({ message: "اتاق یافت نشد" });


    // آپلود تصویر در صورت نیاز
    let imageUrl = null;
    if (image) {
      imageUrl = `http://localhost:3000/uploads/${image.filename}`;
    }

    // بررسی reply message
    const isMessageExist = await messageService.findOne({ _id: replyId })
    const replyTo = isMessageExist ? replyId : null



    // ساخت پیام جدید
    const newMessage = await messageService.create({
      senderId,
      roomId,
      text,
      sticker,
      image: imageUrl,
      replyTo,
    });

    // ارسال پیام به کاربران دیگر
    const exceptionId = getReceiverSocketId(senderId);
    if (exceptionId) io.to(roomId).except(exceptionId).emit("message:send", { roomId, messages: [newMessage] });

    // اعلان پیام جدید
    const membersExceptMe = newMessage.roomId.members
      .filter(m => m._id.toString() !== senderId.toString());


    emitToOnlineMembers(membersExceptMe, "message:notif", { message: newMessage, actionType: "new" });


    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};
//  حذف پیام
export const removeMsg = async (req, res) => {
  try {
    const userId = req.user._id;
    const { msgId } = req.params;
    if (!msgId) return res.status(400).json({ message: "شناسه پیام نامعتبر است" });


    const message = await messageService.findOne({ _id: msgId });
    if (!message) return res.status(404).json({ message: "پیام یافت نشد" });
    //آیا پیام برای خود شخص
    if (message.senderId._id.toString() !== userId.toString())
      return res.status(403).json({ message: "اجازه حذف ندارید" });

    let room = await chatRoomService.findById(message.roomId._id);
    if (!room) return res.status(404).json({ message: "اتاق یافت نشد" });

    let deletedMessage = message;
    await message.deleteOne();

    // به‌روزرسانی پیام آخر در صورت نیاز
    if (room.lastMessage?._id?.toString() === msgId.toString()) {
      const prevMsg = await Message.findOne({ roomId: room._id, system: false })
        .sort({ createdAt: -1 })


      room = await chatRoomService.updateLastMessage(room._id, prevMsg?._id || null)

      const members = room.members.map(m => m._id);

      emitToOnlineMembers(
        members,
        "message:notif",
        { message: deletedMessage, actionType: "delete", prevMsg }
      );
    }
    // حذف پیام

    res.json({ message: "پیام با موفقیت حذف شد" });
    io.to(room._id).emit("message:remove", { msgId, room });

  } catch (err) {
    console.error("removeMsg:", err);
    res.status(500).json({ message: "خطای سرور" });
  }
};
//  علامت‌زدن پیام‌ها به عنوان خوانده‌شده
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

export const editMessage = async (req, res) => {
  const senderId = req.user._id;
  const { msgId } = req.params;
  const { text } = req.body;

  try {

    if (!text)
      return res.status(400).json({ message: "متن  الزامی است" });

    if (!msgId)
      return res.status(400).json({ message: "شناسه پیام نامعتبر است" });

    const msg = await messageService.findOne({ _id: msgId })
    if (!msg) return res.status(404).json({ message: "پیام یافت نشد" });

    const updatedMessage = await messageService.updateMessage(msgId, text)
    const roomId = updatedMessage.roomId._id

    const room = await chatRoomService.findById(roomId)

    let updatedRoom = null
    if (room.lastMessage._id.toString() === updatedMessage._id.toString()) {
      updatedRoom = await chatRoomService.updateLastMessage(msg.roomId, updatedMessage)
      const membersExceptMe = updatedRoom.members
        .filter(m => m._id.toString() !== senderId.toString()).map(mem => mem._id);


      emitToOnlineMembers(membersExceptMe, "message:notif", { message: updatedMessage, actionType: "edit" });

    }
    const exceptionId = getReceiverSocketId(senderId);
    if (exceptionId)
      io.to(room._id).except(exceptionId).emit("message:update", { roomId: room._id, message: updatedMessage });

    res.status(200).json(updatedMessage);

  } catch (error) {
    console.error("editMessage:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
}
