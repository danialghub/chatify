import ChatRoom from "../models/ChatRoom.js";
import FriendRequest from "../models/FriendRequest.js";
import Message from "../models/Message.js";
import { sendInfoToOnlineMembers, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
// 🟢 ایجاد گروه
export const createGroupChat = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { memberIds = [], groupName, groupImage } = req.body;

    if (!groupName || !memberIds.length)
      return res.status(400).json({ message: "اطلاعات ناقص است" });

    if (await ChatRoom.exists({ name: groupName }))
      return res.status(400).json({ message: "این گروه از قبل وجود دارد" });

    const members = [
      { user: userId, role: "owner" },
      ...memberIds.map(id => ({ user: id, role: "member" })),
    ];
    let uploadedImg;
    if (groupImage) {
      const uploadResponse = await cloudinary.uploader.upload(groupImage, {
        transformation: [
          { width: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: "auto" }
        ]
      });
      uploadedImg = uploadResponse.secure_url
    }

    const newGroup = await ChatRoom.create({
      name: groupName,
      type: "group",
      members,
      logo: uploadedImg
    });

    sendInfoToOnlineMembers(memberIds, "newRoom", newGroup);

    return res.status(201).json({
      group: newGroup,
      message: "گروه با موفقیت ایجاد شد",
    });
  } catch (error) {
    console.error("Error in createGroupChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟣 دریافت همه چت‌های خصوصی
export const getAllPrivateChat = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const privateRooms = await ChatRoom.find({
      type: "private",
      "members.user": userId,
    })
      .select("-name -members.role")
      .sort({ updatedAt: -1 })
      .populate("members.user", "name profilePic bio")
      .populate('lastMessage', 'text createdAt')
      .lean();

    if (!privateRooms.length)
      return res.status(404).json({ message: "هیچ چت خصوصی‌ای یافت نشد" });

    //جداکردن خود کاربر از مخاطب هایش
    const filterPrivateRooms = privateRooms.map(room => {
      return {
        ...room,
        members: room.members.filter(m => m.user._id.toString() !== userId.toString())[0]
      }
    });

    const unSeenMessages = Object.fromEntries(
      await Promise.all(filterPrivateRooms.map(async p => [
        p._id,
        await Message.countDocuments({ roomId: p._id, seenBy: { $ne: userId }, senderId: { $ne: userId } })
      ]))
    )


    res.status(200).json({ privateRooms: filterPrivateRooms, unSeenMessages });
  } catch (error) {
    console.error("Error in getAllPrivateChat:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🟢 دریافت گروه‌ها
export const getAllGroupChat = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const groupRooms = await ChatRoom.find({
      type: "group",
      "members.user": userId,
    })
      .sort({ updatedAt: -1 })
      .populate("members.user", "name profilePic bio")
      .populate('lastMessage', 'text createdAt');

    if (!groupRooms.length)
      return res.status(404).json({ message: "هیچ گروهی وجود ندارد" });

    const unSeenMessages = Object.fromEntries(
      await Promise.all(groupRooms.map(async g => [
        g._id,
        await Message.countDocuments({ roomId: g._id, seenBy: { $ne: userId }, senderId: { $ne: userId } })
      ]))
    )


    res.status(200).json({ groupRooms, unSeenMessages });
  } catch (error) {
    console.error("Error in getAllGroupChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔴 حذف گروه
export const removeGroupChat = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { roomId } = req.params;

    if (!roomId)
      return res.status(400).json({ message: "شناسه گروه نامعتبر است" });

    const room = await ChatRoom.findOne({ _id: roomId, type: "group" });
    if (!room)
      return res.status(404).json({ message: "گروهی یافت نشد" });

    const isOwner = room.members.some(
      m => String(m.user) === String(userId) && m.role === "owner"
    );
    if (!isOwner)
      return res.status(403).json({ message: "شما مجاز به حذف این گروه نیستید" });

    await Promise.all([
      Message.deleteMany({ room: roomId }),
      ChatRoom.deleteOne({ _id: roomId }),
    ]);

    const memberIds = room.members.map(m => m.user);
    sendInfoToOnlineMembers(memberIds, "groupDeleted", { roomId });

    res.status(200).json({ message: "گروه با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error in removeGroupChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔴 حذف چت خصوصی
export const removePrivateChat = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { otherUserId } = req.params;

    if (!otherUserId)
      return res.status(400).json({ message: "شناسه کاربر نامعتبر است" });

    const room = await ChatRoom.findOne({ "members.user": { $all: [userId, otherUserId] }, type: "private" });
    if (!room)
      return res.status(404).json({ message: "هیچ چت خصوصی‌ای یافت نشد" });


    await Promise.all([
      Message.deleteMany({ roomId: room._id }),
      ChatRoom.deleteOne({ _id: room._id }),
      FriendRequest.deleteOne({
        $or: [
          { from: userId, to: otherUserId },
          { from: otherUserId, to: userId },
        ],
      }),
    ]);

    sendInfoToOnlineMembers([userId, otherUserId], "chatDeleted", { roomId: room._id });

    res.status(200).json({ message: "چت با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error in removePrivateChat:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//خروج از گروه
export const leavingGroup = async (req, res) => {
  try {
    const userId = req.user._id
    const { roomId } = req.params

    if (!roomId)
      return res.status(400).json({ message: "اتاق نامعتبر است" })
    const room = await ChatRoom.findOne({ _id: roomId, type: "group" })
      .populate('members.user', 'name profilePic')

    if (!room)
      return res.status(404).json({ message: "گروهی یافت نشد" })


    const isOwner = room.members.some(m =>
      String(m.user._id) === String(userId) && m.role === "owner"
    )
    console.log(isOwner);
    if (isOwner)
      return res.status(403).json({ message: "شما قادر به اینکار نمیباشید" })
    room.members = room.members.filter(m => String(m.user._id) !== String(userId))

    await room.save()

    const updatedRoom = await room.populate('members.user', 'name profilePic')

    io.to(roomId).emit('groupUpdate', updatedRoom)


    res.status(200).json({ message: "شما با موفقیت خارج شدید" })

  } catch (error) {
    console.error("Error in leavingGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}