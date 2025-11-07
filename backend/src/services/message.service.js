import Message from "../models/Message.js";
import { chatRoomService } from './chatRoom.service.js'
export const messageService = {
    create: async (msg) => {
        const newMessage = await Message.create(msg)
        await chatRoomService.updateLastMessage(newMessage.roomId, newMessage._id)

        return newMessage.populate([
            { path: "roomId", select: "updatedAt isGroup members" },
            { path: "senderId", select: "name profilePic" },
            { path: "replyTo", populate: { path: "senderId", select: "name" } },
        ]);
    },
    findByRoomId: (roomId) => {
        const messages = Message.find({ roomId })
            .populate([
                { path: "roomId", select: "updatedAt isGroup members" },
                { path: "senderId", select: "name profilePic" },
                { path: "replyTo", populate: { path: "senderId", select: "name" } },
            ])
        return messages
    },
}