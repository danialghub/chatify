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
            .populate({
                path: "members",
                select: "name profilePic bio"
            })
            .populate({
                path: "lastMessage",
                select: "text sticker file createdAt",
                populate: {
                    path: "senderId",
                    select: "name"
                }
            })


            .lean();
    },
    async findById(roomId) {
        return await ChatRoom.findOne({ _id: roomId })
            .populate("members", "name profilePic bio")
            .populate("lastMessage", "text file sticker createdAt")

    },
    async updateLastMessage(roomId, msgId) {
        return ChatRoom.findByIdAndUpdate(roomId, { lastMessage: msgId }, { new: true })
            .populate('members', "name profilePic")
            .populate('lastMessage', 'text file sticker createdAt');
    },
    async update(roomId, body) {
        return await ChatRoom.findByIdAndUpdate(roomId, body, { new: true })
            .populate("members", "name profilePic")
            .populate("lastMessage", "text file cratedAt")
            .lean();
    },
    async deleteRoom(roomId) {
        return ChatRoom.deleteOne({ _id: roomId });
    },
};
