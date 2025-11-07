import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
    name:
    {
        type: String,
    },
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        }
    ],
    logo:
    {
        type: String,
    },
    lastMessage:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
        default: null
    },
    isGroup:
    {
        type: Boolean,
        default: false

    },
    createdBy:
    {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema, "ChatRoom")

export default ChatRoom