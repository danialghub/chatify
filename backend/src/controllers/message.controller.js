import cloudinary from "../lib/cloudinary.js";
import { io, sendInfoToOnlineMembers, getReceiverSocketId } from "../lib/socket.js";
import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";


export const getMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .populate([
        { path: 'senderId', select: 'name profilePic' },
        {
          path: 'replyTo', populate: { path: 'senderId', select: 'name' },
        },
      ])

      .exec()
    res.status(200).json(messages);

  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo: replyId } = req.body;
    const { roomId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "متن یا عکس لازم است" });
    }
    if (senderId.equals(roomId)) {
      return res.status(400).json({ message: "نمیتونی به خودت پیام بفرستی" });
    }
    const roomExists = await ChatRoom.exists({ _id: roomId });

    if (!roomExists) {
      return res.status(404).json({ message: "Room not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        transformation: [
          { crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: "auto" }
        ]
      });
      imageUrl = uploadResponse.secure_url;
    }
    let replyTo;
    const message = await Message.findOne({ _id: replyId })
    if (message) {
      replyTo = replyId
    }


    const newMessage = await (
      await new Message({ senderId, roomId, text, image: imageUrl, replyTo }).save()
    ).populate([
      { path: 'roomId', select: 'updatedAt type members' },
      { path: 'senderId', select: 'name profilePic' },
      {
        path: 'replyTo', populate: { path: 'senderId', select: 'name' },
      },
    ]);

    await ChatRoom.findByIdAndUpdate(roomId,
      { lastMessage: newMessage._id },
      { new: true }
    );

    const exceptionId = getReceiverSocketId(senderId)
    if (exceptionId) {
      io.to(roomId).except(exceptionId).emit("message:send", newMessage);
    }

    const membersExceptMe = newMessage.roomId.members.map(m => m.user).filter(m => m._id.toString() !== senderId.toString())
    sendInfoToOnlineMembers(membersExceptMe, "message:notif", newMessage)


    res.status(201).json(newMessage);

  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMsg = async (req, res) => {
  try {
    const userId = req.user._id
    const { msgId } = req.params

    // پیدا کردن پیام مورد نظر
    const eliminatedMsg = await Message.findById(msgId)
    if (!eliminatedMsg)
      return res.status(400).json({ message: "همچین پیامی وجود ندارد" })

    const roomId = eliminatedMsg.roomId
    const room = await ChatRoom.findById(roomId)
    if (!room)
      return res.status(400).json({ message: "اتاق یافت نشد" })

    // همه پیام‌های این روم را به ترتیب زمان
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).lean()
    const msgIdx = messages.findIndex(m => m._id.toString() === msgId)

    // حذف پیام
    await Message.findByIdAndDelete(msgId)

    // بررسی اگر آخرین پیام بوده
    const isLastMessage = room.lastMessage?._id?.toString() === msgId
    let prevMsg;
    if (isLastMessage) {
      prevMsg = messages[msgIdx - 1] || null
      room.lastMessage = prevMsg
      await room.save()
    }

    res.status(200).json({ message: "با موفقیت حذف شد" })

    // اطلاع‌رسانی به سایر کاربران

      io.to(roomId.toString())
        .emit('message:remove', { msgId, room })
    

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "خطای سرور" })
  }
}



export const checkMessageAsSeen = async (req, res) => {
  try {
    const userId = req.user._id
    const { roomId } = req.params

    if (!roomId)
      return res.status(400).json({ message: "چتی پیدا نشد" })
    await Message.updateMany({ roomId }, { $addToSet: { seenBy: userId } })

  } catch (error) {
    console.log("Error in checkMessageAsSeen controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

