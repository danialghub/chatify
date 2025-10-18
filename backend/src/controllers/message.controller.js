import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";


export const getMessagesByRoomId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .populate('senderId', 'name profilePic')
      .exec()


    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { roomId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "متن یا عکس لازم است" });
    }
    if (senderId.equals(roomId)) {
      return res.status(400).json({ message: "نمیتونی به خودت پیام بفرستی" });
    }
    const roomExists = await ChatRoom.exists({ _id: roomId });
    console.log(roomId);

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

    const newMessage = new Message({
      senderId,
      roomId,
      text,
      image: imageUrl,
    });

    const message = await (await newMessage.save()).populate('senderId', 'name profilePic');

    io.to(roomId).emit("newMessage", message);


    res.status(201).json(message);
    
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

