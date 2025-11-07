import { chatRoomService } from '../services/chatRoom.service.js'
import Message from "../models/Message.js";
import { emitToOnlineMembers, io, getReceiverSocketId } from "../lib/socket.js";
import { uploadImage } from '../lib/helper.js';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';

// 🟢 ایجاد گروه
export const createRoom = async (req, res) => {
  try {
    const { isGroup, memberIds, groupName, groupImage } = req.body;
    const userId = req.user._id
    let newRoom;
    let allParticipantIds = [];

    if (isGroup && groupName) {
      if (await ChatRoom.exists({ name: groupName }))
        return res.status(400).json({ message: "این گروه از قبل وجود دارد" });

      let uploadedImg = null;
      if (groupImage) {
        uploadedImg = await uploadImage(groupImage);
      }

      allParticipantIds = [userId, ...memberIds];
      newRoom = await chatRoomService.create({
        members: allParticipantIds,
        isGroup,
        name: groupName,
        createdBy: userId,
        logo: uploadedImg
      });
    } else {
      const otherUser = await User.findById(memberIds[0]);
      if (!otherUser) return res.status(404).json({ message: "مخاطبی یافت نشد" });

      allParticipantIds = [userId, ...memberIds];
      const existingChat = await ChatRoom.findOne({
        members: {
          $all: allParticipantIds,
          $size: 2,
        },
      }).populate('members', 'name profilePic').lean()

      if (existingChat) {
        return res.status(200).json({ room: existingChat })
      } else {
        newRoom = await chatRoomService.create({
          members: allParticipantIds,
          isGroup: false,
        });
      }
    }

    emitToOnlineMembers(memberIds, "room:new", newRoom);

    if (isGroup) {
      return res.status(201).json({ newRoom, message: "گروه با موفقیت ایجاد شد" });
    }

    res.status(201).json({ newRoom, message: "چت با موفقیت ایجاد شد" });
  } catch (error) {
    console.error("createRoom:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

// 🟡 دریافت همه چت‌ها
export const getAllRooms = async (req, res) => {
  try {

    const userId = req.user._id;
    const { isGroup } = req.query

    let rooms = await chatRoomService.findRooms(userId, isGroup)

    if (!rooms.length)
      return res.status(200).json({ rooms: [], unSeenMessages: {} });


    const unSeenMessages = Object.fromEntries(
      await Promise.all(
        rooms.map(async r => [
          r._id,
          await Message.countDocuments({
            roomId: r._id,
            seenBy: { $ne: userId },
            senderId: { $ne: userId },
          }),
        ])
      )
    );

    res.status(200).json({ rooms, unSeenMessages });
  } catch (error) {
    console.error("getAllPrivateChat:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

//  حذف چت
export const removeRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId });
    if (!room) return res.status(404).json({ message: "گروهی یافت نشد" });

    if (room.isGroup) {
      const isOwner = room.createdBy.toString() === userId.toString()
      if (!isOwner)
        return res.status(403).json({ message: "شما مجاز به حذف این گروه نیستید" });
    }

    await Promise.all([
      Message.deleteMany({ roomId }),
      ChatRoom.deleteOne({ _id: roomId }),
    ]);

    const groupMembers = room.members.map(m => m.toString()).filter(m => m !== userId.toString())

    emitToOnlineMembers(groupMembers, "room:remove", room);

    res.status(200).json({ message: "اتاق موفقیت حذف شد" });
  } catch (error) {
    console.error("removeRoom:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

//  خروج از گروه
export const leavingTheGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    const room = await chatRoomService.findById(roomId)
    if (!room)
      return res.status(404).json({ message: "گروهی یافت نشد" });

    const member = room.members.find(m => m._id.toString() === userId.toString());
    if (!member) return res.status(403).json({ message: "عضو این گروه نیستید" });

    const isOwner = room.createdBy.toString() === member._id.toString()
    if (isOwner)
      return res.status(403).json({ message: "مالک گروه نمی‌تواند خارج شود" });

    room.members = room.members.filter(m => m._id.toString() !== userId.toString());
    await room.save();

    await room.populate("members", "name profilePic");


    io.to(roomId).emit("room:update", room);

    res.status(200).json({ message: "با موفقیت از گروه خارج شدید" });
  } catch (error) {
    console.error("leavingTheGroup:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};
//  آپدیت گروه
export const updateGroupRooms = async (req, res) => {
  try {
    const { memberIds, groupName, groupImage } = req.body;
    const { roomId } = req.params
    const userId = req.user._id

    if (!groupImage && !groupName && !memberIds.length)
      return res.status(400).json({ message: "مقادیر نامعتبر است" })


    if (! await ChatRoom.exists({ _id: roomId }))
      return res.status(400).json({ message: "گروه نامعتبر است" });


    if (! await ChatRoom.exists({ createdBy: userId }))
      return res.status(403).json({ message: "تنها مالک گروه مجاز به تغییر است" })

    const currentGroup = await chatRoomService.findById(roomId)


    let uploadedImg = null;
    if (groupImage) {
      uploadedImg = await uploadImage(groupImage);
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(roomId, {
      members: [userId, ...memberIds],
      name: groupName,
      logo: uploadedImg
    }, { new: true }).populate("members", "name profilePic").lean();


    emitToOnlineMembers([userId, ...memberIds], "room:update", updatedRoom);

    const kickedOutMembers = currentGroup.members.map(m => m._id.toString()).filter(m => !memberIds.includes(m) && m !== userId.toString())
    console.log(kickedOutMembers);


    if (kickedOutMembers.length)
      emitToOnlineMembers(kickedOutMembers, "room:remove", updatedRoom);

    res.status(201).json({ message: "گروه با موفقیت آپدیت شد" });

  } catch (error) {
    console.error("updateGroupRooms:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

// افزودن اعضاء
export const addMembers = async (req, res) => {
  try {
    const { memberIds } = req.body
    const { roomId } = req.params
    const userId = req.user._id

    if (!memberIds.length)
      return res.status(400).json({ message: "باید حداقل یک نفر انتخاب شود" })

    if (!await ChatRoom.exists({ _id: roomId, members: userId }))
      return res.status(403).json({ message: "شما در این گروه حضور ندارید" })

    const room = await chatRoomService.findById(roomId)
    const currentMemberIds = room.members.map(m => m._id.toString());
    const newMembers = memberIds.filter(id => !currentMemberIds.includes(id));
    const allMembers = [...room.members, ...newMembers]
    room.members = allMembers;

    const updatedRoom = await ChatRoom.findByIdAndUpdate(roomId, { members: room.members }, { new: true }).populate('members', 'name profilePic')

    const allMemberIds = allMembers.map(m => m._id ? m._id.toString() : m.toString());
    emitToOnlineMembers(allMemberIds, "room:update", updatedRoom);

    res.status(201).json({ message: "اعضاء با موفقیت عضو گروه شدن" })

  } catch (error) {
    console.error("addMembers:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
}