import Message from "../models/Message.js";
import { chatRoomService } from './chatRoom.service.js'
export const messageService = {
    create: async (msg) => {
        const newMessage = await Message.create(msg)
        await chatRoomService.updateLastMessage(newMessage.roomId, newMessage._id)

        return newMessage.populate([
            { path: "roomId", select: "updatedAt isGroup members" },
            { path: "senderId", select: "name profilePic userName bio" },
            { path: "replyTo", populate: { path: "senderId", select: "name" } },
            {
                path: "forwardedFrom",
                populate: [
                    { path: "roomId", populate: { path: 'members' } },
                    { path: "senderId" }
                ]
            }
        ]);
    },
    findByRoomId: (query) => {
        const messages = Message.find(query)
            .populate([
                { path: "roomId", select: "updatedAt isGroup members" },
                { path: "senderId", select: "name profilePic userName bio" },
                { path: "replyTo", populate: { path: "senderId", select: "name" } },
                {
                    path: "forwardedFrom",
                    populate: [
                        { path: "roomId", populate: { path: 'members' } },
                        { path: "senderId" }
                    ]
                }
            ])
        return messages
    },
}