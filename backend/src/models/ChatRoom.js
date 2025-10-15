import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
    name: String,
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
                required:true
            },
            role: 
            {
                type:String,
                enum:["admin" , 'member',"owner"],
                default:'member'
            }

        }
    ],
    
})

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema, "ChatRoom")

export default ChatRoom