import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
    name:
    {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["private", 'group'],
        default: "private",
    },
    members: [
        {
            user:
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            role:
            {
                type: String,
                enum: ["admin", 'member', "owner"],
                default: 'member'
            }

        }
    ],
    logo:
    {
        type: String,
        default: ''
    }

})

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema, "ChatRoom")

export default ChatRoom