import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema({
    from:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status:
    {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
}, { timestamps: true })

FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true })
const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema, "FriendRequest")

export default FriendRequest