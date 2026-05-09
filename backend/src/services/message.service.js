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
    updateMessage: async (msgId, text) => {
        const updatedMessage = await Message.findByIdAndUpdate(
            msgId,
            { $set: { text, isEdited: true } },
            { new: true }
        )
        return updatedMessage.populate([
            { path: "roomId", select: "updatedAt isGroup members" },
            { path: "senderId", select: "name profilePic" },
            { path: "replyTo", populate: { path: "senderId", select: "name" } },
        ]);
    },
    findOne: async (filter) => {
        return await Message.findOne(filter)
            .populate([
                { path: "roomId", select: "updatedAt isGroup members" },
                { path: "senderId", select: "name profilePic" },
                { path: "replyTo", populate: { path: "senderId", select: "name" } },
            ])
    }
}