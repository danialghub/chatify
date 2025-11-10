import ChatRoom from "../models/ChatRoom.js";

export const chatRoomService = {
    async create(body) {
        const room = await ChatRoom.create(body);
        return ChatRoom.findById(room._id)
            .populate("members", "name profilePic")
            .lean();

    },

    async findRooms(userId, isGroup) {
        return ChatRoom.find({
            isGroup,
            members: { $in: userId }
        })
            .sort({ updatedAt: -1 })
            .populate("members", "name profilePic bio")
            .populate("lastMessage", "text createdAt")
            .lean();
    },
    async findById(roomId) {
        return await ChatRoom.findOne({ _id: roomId })
            .populate("members", "name profilePic bio")
            .populate("lastMessage", "text createdAt")

    },
    async updateLastMessage(roomId, msgId) {
        return ChatRoom.findByIdAndUpdate(roomId, { lastMessage: msgId });
    },
    async update(roomId, body) {
        return await ChatRoom.findByIdAndUpdate(roomId, body, { new: true })
            .populate("members", "name profilePic")
            .populate("lastMessage", "text cratedAt")
            .lean();
    },
    async deleteRoom(roomId) {
        return ChatRoom.deleteOne({ _id: roomId });
    },
};
