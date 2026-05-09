import { chatRoomService } from '../services/chatRoom.service.js'
import { messageService } from '../services/message.service.js'
import Message from "../models/Message.js";
import { emitToOnlineMembers, io } from "../lib/socket.js";
import { uploadImage } from '../lib/helper.js';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';

// 🟢 ایجاد گروه
export const createRoom = async (req, res) => {
  try {
    const { isGroup, memberIds: rawMembers, groupName } = req.body;
    const userId = req.user._id
    const groupImage = req?.file

    const memberIds = rawMembers ? JSON.parse(rawMembers) : null
console.log(rawMembers);

    let newRoom;
    let allParticipantIds = [];

    //ساخت گروه
    if (isGroup === "true" && groupName) {

      if (await ChatRoom.exists({ name: groupName }))
        return res.status(400).json({ message: "این گروه از قبل وجود دارد" });

      let uploadedImg = null;
      if (groupImage) {
        uploadedImg = `http://localhost:3000/uploads/${groupImage.filename}`;
      }

      allParticipantIds = [userId, ...memberIds];
      newRoom = await chatRoomService.create({
        members: allParticipantIds,
        isGroup,
        name: groupName,
        createdBy: userId,
        logo: uploadedImg
      });
      const notif =
      {
        roomId: newRoom._id,
        system: true,
        text: "گروه ایجاد شد"
      }

      const msg = await messageService.create(notif)
      io.to(msg.roomId).emit('message:send', { roomId: msg.roomId, messages: [msg] })

    }
    //PV ساخت 
    else {
      const otherUser = await User.findById(memberIds[0]);
      if (!otherUser) return res.status(404).json({ message: "مخاطبی یافت نشد" });

      allParticipantIds = [userId, ...memberIds];
      const existingChat = await ChatRoom.findOne({
        members: {
          $all: allParticipantIds,
          $size: 2,
        },
        isGroup: false
        ,
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
    //ساخته شده به اعضاء  PV ارسال اطلاعات گروه یا 
    emitToOnlineMembers(memberIds, "room:new", newRoom);

    if (isGroup === "true") {
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
            system: false,
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

    const room = await chatRoomService.findById(roomId);
    if (!room) return res.status(404).json({ message: "گروهی یافت نشد" });

    if (room.isGroup) {
      const isOwner = room.createdBy.toString() === userId.toString()
      if (!isOwner)
        return res.status(403).json({ message: "شما مجاز به حذف این گروه نیستید" });
    }

    await Promise.all([
      Message.deleteMany({ roomId }),
      chatRoomService.deleteRoom(roomId),
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
    const userName = req.user.name;
    const { roomId } = req.params;

    // 1️⃣ بررسی وجود گروه
    const room = await chatRoomService.findById(roomId)
    if (!room)
      return res.status(404).json({ message: "گروهی یافت نشد" });

    // 2️⃣ بررسی عضویت کاربر
    const isMember = room.members.some(m => m._id.toString() === userId.toString());
    if (!isMember)
      return res.status(403).json({ message: "عضو این گروه نیستید" });

    // 3️⃣ بررسی مالک بودن کاربر
    const isOwner = room.createdBy.toString() === userId.toString();
    if (isOwner)
      return res.status(403).json({ message: "مالک گروه نمی‌تواند خارج شود" });

    // 4️⃣ حذف کاربر از اعضا
    room.members = room.members.filter(m => m._id.toString() !== userId.toString());
    await room.save();

    // 5️⃣ ساخت پیام سیستمی خروج کاربر
    const msg = await messageService.create({
      roomId,
      system: true,
      text: `${userName} از گروه خارج شد`
    });

    // 6️⃣ بروزرسانی اعضا (در صورت نیاز)
    const updatedRoom = await room.populate("members", "name profilePic");

    // 7️⃣ اطلاع‌رسانی به کلاینت‌ها
    io.to(roomId).emit("room:update", updatedRoom);
    io.to(roomId).emit("message:send", { roomId, messages: [msg] });

    return res.status(200).json({ message: "با موفقیت از گروه خارج شدید" });

  } catch (error) {
    console.error("leavingTheGroup:", error);
    return res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

//  آپدیت گروه
export const updateGroupRooms = async (req, res) => {
  try {
    const { memberIds: rawMembers = [], groupName } = req.body;
    const groupImage = req.file
    const { roomId } = req.params
    const userId = req.user._id

    const memberIds = rawMembers.length ? JSON.parse(rawMembers) : []

    if (!groupImage && !groupName && !memberIds.length)
      return res.status(400).json({ message: "مقادیر نامعتبر است" })

    if (! await ChatRoom.exists({ _id: roomId }))
      return res.status(400).json({ message: "گروه نامعتبر است" });

    if (! await ChatRoom.exists({ _id: roomId, createdBy: userId }))
      return res.status(403).json({ message: "تنها مالک گروه مجاز به تغییر است" })

    const currentGroup = await chatRoomService.findById(roomId)

    const updatedGroup = {
      name: groupName,
      members: [userId, ...memberIds]
    }

    if (groupImage) {
      updatedGroup.logo = `http://localhost:3000/uploads/${groupImage.filename}`;
    }

    // -----------------------------
    // 1) پیدا کردن اعضای حذف‌شده
    // -----------------------------
    const kickedOutMembers =
      currentGroup.members.filter(m =>
        !memberIds.includes(m._id.toString()) &&
        m._id.toString() !== userId.toString()
      )

    // -----------------------------
    // 2) پیدا کردن اعضای جدید
    // -----------------------------
    const oldMembersIds = currentGroup.members.map(m => m._id.toString());
    const newAddedMembers =
      memberIds.filter(id => !oldMembersIds.includes(id));

    // -----------------------------
    // 3) ساخت چند پیام سیستمی
    // -----------------------------
    let systemMessages = [];

    // پیام: گروه آپدیت شد
    systemMessages.push({
      roomId,
      text: `گروه توسط مالک گروه بروزرسانی شد`,
      system: true,
    });

    // پیام‌ها برای اعضای حذف‌شده
    kickedOutMembers.forEach(m => {
      systemMessages.push({
        roomId,
        text: `${m.name} از گروه حذف شد`,
        system: true,
      });
    });

    // پیام‌ها برای اعضای جدید
    const newAddedMembersData = await User.find({ _id: { $in: newAddedMembers } });

    newAddedMembersData.forEach(member => {
      systemMessages.push({
        roomId,
        text: `${member.name} به گروه اضافه شد`,
        system: true,
      });
    });

    // -----------------------------
    // ذخیره پیام‌ها
    // -----------------------------
    const insertedMessages = await Message.insertMany(systemMessages);

    // -----------------------------
    // ارسال به اعضای گروه
    // -----------------------------
    io.to(roomId).emit('message:send', {
      roomId,
      messages: insertedMessages
    });

    const updatedRoom = await chatRoomService.update(roomId, updatedGroup);

    emitToOnlineMembers([userId, ...memberIds, ...oldMembersIds], "room:update", updatedRoom);

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
    const userName = req.user.name

    if (!memberIds.length)
      return res.status(400).json({ message: "باید حداقل یک نفر انتخاب شود" })

    if (!await ChatRoom.exists({ _id: roomId, members: userId }))
      return res.status(403).json({ message: "شما در این گروه حضور ندارید" })

    const room = await chatRoomService.findById(roomId)
    if (!room)
      return res.status(400).json({ message: "اتاق نامعتبر است" })

    const currentMemberIds = room.members.map(m => m._id.toString());
    const newMemberIds = memberIds.filter(id => !currentMemberIds.includes(id));
    if (!newMemberIds.length)
      return res.status(401).json({ message: "کاربر از قبل در گروه وجود دارد" })

    const newMembers = await User.find({ _id: { $in: newMemberIds } }).lean()

    if (!newMembers.length)
      return res.status(400).json({ message: "کاربران نامعتبر هستند" })

    const notifs = newMembers.map(user => (
      {
        roomId,
        text: `${user.name}, توسط ${userName} عضو گروه شد`,
        system: true,
      }
    )
    );
    let updatedRoom = await chatRoomService.update(roomId,
      { $addToSet: { members: { $each: newMemberIds } } })


    const messages = await Message.insertMany(notifs);

    const allMemberIds = [...currentMemberIds, ...newMemberIds]

    emitToOnlineMembers(allMemberIds, "room:update", updatedRoom);
    io.to(roomId).emit('message:send', { roomId, messages })


    res.status(201).json({ message: "اعضاء با موفقیت عضو گروه شدن" })

  } catch (error) {
    console.error("addMembers:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
}