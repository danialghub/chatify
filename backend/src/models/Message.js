import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.ObjectId,
      ref: "ChatRoom"
    }
    ,
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    seenBy:
      [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
      replyTo : 
      {
        type : mongoose.Schema.ObjectId,
        ref:"Message",
        default:""
      }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
