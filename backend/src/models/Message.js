import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["user", "system", "dailyDate"],
      default: "user",
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
    },

    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    file: {
      type: { type: String },
      url: { type: String },
      name: { type: String },
      size: { type: Number },
    },

    sticker: {
      url: String,
      emoji: String,
      name: String,
    },

    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);




const Message = mongoose.model("Message", messageSchema);

export default Message;
