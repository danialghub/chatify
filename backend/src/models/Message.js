import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roomId: {
      type: mongoose.Schema.ObjectId,
      ref: "ChatRoom"
    }
    ,
    system: { type: Boolean, default: false }
    ,
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    sticker: {
      url: String,
      emoji: String,
      name: String
    },
    seenBy:
      [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
    replyTo:
    {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
    isEdited: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
