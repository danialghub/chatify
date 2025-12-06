import { chatRoomService } from '../services/chatRoom.service.js'
import Message from "../models/Message.js";
import { emitToOnlineMembers, io } from "../lib/socket.js";
import { uploadImage } from '../lib/helper.js';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';


/**
 * ایجاد یک اتاق چت (گروهی یا خصوصی)
 */
export const createRoom = async (req, res) => {
  try {
    const { isGroup, memberIds, groupName, groupImage } = req.body;
    const userId = req.user._id;

    let newRoom;
    let allParticipantIds = [];

    /* --------------------------------------------------------------------------
     *  حالت ساخت گروه
     * --------------------------------------------------------------------------*/
    if (isGroup && groupName) {

      // بررسی اینکه گروه از قبل وجود نداشته باشد
      const existedGroup = await ChatRoom.exists({ name: groupName });
      if (existedGroup)
        return res.status(400).json({ message: "این گروه از قبل وجود دارد" });

      // آپلود تصویر گروه (در صورت وجود)
      let uploadedImg = null;
      if (groupImage) uploadedImg = await uploadImage(groupImage);

      // شرکت‌کنندگان گروه: صاحب گروه + اعضایی که انتخاب شده‌اند
      allParticipantIds = [userId, ...memberIds];

      // ایجاد اتاق گروهی
      newRoom = await chatRoomService.create({
        members: allParticipantIds,
        isGroup,
        name: groupName,
        createdBy: userId,
        logo: uploadedImg
      });

      /* ------------------ ارسال پیام سیستمی "گروه ایجاد شد" ------------------ */
      const systemNotif = {
        roomId: newRoom._id,
        type: "system",
        text: "گروه ایجاد شد"
      };


      const msg = await Message.create(systemNotif);
      newRoom = await chatRoomService.updateLastMessage(newRoom._id, msg._id)
      // ارسال پیام به کاربران آنلاین داخل اتاق
      io.to(msg.roomId).emit("message:send", { roomId: newRoom._id, messages: [msg] });


      /* --------------------------------------------------------------------------
       *  حالت ساخت چت خصوصی (۲ نفره)
       * --------------------------------------------------------------------------*/
    } else {

      // یافتن کاربر مقابل
      const otherUser = await User.findById(memberIds[0]);
      if (!otherUser)
        return res.status(404).json({ message: "مخاطبی یافت نشد" });

      allParticipantIds = [userId, ...memberIds];

      // بررسی اینکه این دو نفر قبلاً چت خصوصی دارند یا نه
      const existingChat = await ChatRoom.findOne({
        members: { $all: allParticipantIds, $size: 2 }
      })
        .populate("members", "name profilePic")
        .lean();

      // اگر چت وجود داشت همان را برگردان
      if (existingChat) {
        return res.status(200).json({ room: existingChat });
      }

      // در غیر این صورت یک چت جدید ساخته می‌شود
      newRoom = await chatRoomService.create({
        members: allParticipantIds,
        isGroup: false,
      });
    }

    /* --------------------------------------------------------------------------
     *  ارسال نوتیف "اتاق جدید" به اعضای آنلاین
     * --------------------------------------------------------------------------*/
    emitToOnlineMembers(memberIds, "room:new", newRoom);

    /* --------------------------------------------------------------------------
     *  پاسخ نهایی
     * --------------------------------------------------------------------------*/
    if (isGroup) {
      return res.status(201).json({
        newRoom,
        message: "گروه با موفقیت ایجاد شد",
      });
    }

    res.status(201).json({
      newRoom,
      message: "چت با موفقیت ایجاد شد",
    });

  } catch (error) {
    console.error("createRoom:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};


/**
 * دریافت تمام روم‌های کاربر + تعداد پیام‌های دیده‌نشده هر روم
 */
export const getAllRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isGroup } = req.query;

    /* --------------------------------------------------------------------------
     *  دریافت لیست روم‌های کاربر (خصوصی یا گروهی)
     * --------------------------------------------------------------------------*/
    const rooms = await chatRoomService.findRooms(userId, isGroup);

    // اگر روم وجود نداشت
    if (!rooms.length) {
      return res.status(200).json({
        rooms: [],
        unSeenMessages: {}
      });
    }

    /* --------------------------------------------------------------------------
     *  شمارش پیام‌های خوانده‌نشده برای هر روم
     * --------------------------------------------------------------------------
     *  - پیام‌هایی که:
     *      system: false  → پیام سیستمی نیست
     *      senderId != userId → پیام از سمت خود کاربر نیست
     *      seenBy != userId → کاربر هنوز آن پیام را ندیده
     * --------------------------------------------------------------------------*/
    const unSeenMessages = Object.fromEntries(
      await Promise.all(
        rooms.map(async (room) => {
          const count = await Message.countDocuments({
            roomId: room._id,
            senderId: { $ne: userId },
            seenBy: { $ne: userId },
          });

          return [room._id, count];
        })
      )
    );

    /* --------------------------------------------------------------------------
     *  پاسخ نهایی
     * --------------------------------------------------------------------------*/
    res.status(200).json({ rooms, unSeenMessages });

  } catch (error) {
    console.error("getAllPrivateChat:", error);
    res.status(500).json({
      message: "خطای داخلی سرور"
    });
  }
};


/**
 * حذف یک روم (چت خصوصی یا گروه)
 * - اگر گروه باشد فقط صاحب گروه اجازه حذف دارد.
 * - پس از حذف، به اعضای آنلاین اعلان ارسال می‌شود.
 */
export const removeRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    /* --------------------------------------------------------------------------
     *  جستجوی روم
     * --------------------------------------------------------------------------*/
    const room = await ChatRoom.findOne({ _id: roomId });
    if (!room)
      return res.status(404).json({ message: "گروهی یافت نشد" });

    /* --------------------------------------------------------------------------
     *  بررسی مجاز بودن حذف گروه
     * --------------------------------------------------------------------------
     *  - اگر روم گروهی باشد تنها ایجادکننده گروه می‌تواند آن را حذف کند
     * --------------------------------------------------------------------------*/
    if (room.isGroup) {
      const isOwner = room.createdBy.toString() === userId.toString();
      if (!isOwner)
        return res.status(403).json({ message: "شما مجاز به حذف این گروه نیستید" });
    }

    /* --------------------------------------------------------------------------
     *  حذف پیام‌ها و خود روم
     * --------------------------------------------------------------------------*/
    await Promise.all([
      Message.deleteMany({ roomId }),
      ChatRoom.deleteOne({ _id: roomId }),
    ]);

    /* --------------------------------------------------------------------------
     *  ارسال نوتیف "room removed" به اعضای دیگر
     * --------------------------------------------------------------------------*/
    const otherMembers = room.members
      .map(m => m.toString())
      .filter(m => m !== userId.toString());

    emitToOnlineMembers(otherMembers, "room:remove", room);

    /* --------------------------------------------------------------------------
     *  پاسخ نهایی
     * --------------------------------------------------------------------------*/
    res.status(200).json({ message: "اتاق با موفقیت حذف شد" });

  } catch (error) {
    console.error("removeRoom:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};


/**
 * خروج کاربر از گروه
 * - مالک گروه نمی‌تواند خارج شود
 * - پیام سیستمی خروج ثبت می‌شود
 * - اعضا به‌روزرسانی و نوتیف ارسال می‌شود
 */
export const leavingTheGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.name;
    const { roomId } = req.params;

    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی وجود گروه
     * --------------------------------------------------------------------------*/
    const room = await chatRoomService.findById(roomId);
    if (!room)
      return res.status(404).json({ message: "گروهی یافت نشد" });

    /* --------------------------------------------------------------------------
     * 2️⃣ بررسی عضویت کاربر
     * --------------------------------------------------------------------------*/
    const isMember = room.members.some(
      (m) => m._id.toString() === userId.toString()
    );
    if (!isMember)
      return res.status(403).json({ message: "عضو این گروه نیستید" });

    /* --------------------------------------------------------------------------
     * 3️⃣ بررسی اینکه کاربر مالک گروه نباشد
     * --------------------------------------------------------------------------*/
    const isOwner = room.createdBy.toString() === userId.toString();
    if (isOwner)
      return res.status(403).json({ message: "مالک گروه نمی‌تواند خارج شود" });

    /* --------------------------------------------------------------------------
     * 4️⃣ حذف کاربر از اعضای گروه
     * --------------------------------------------------------------------------*/
    room.members = room.members.filter(
      (m) => m._id.toString() !== userId.toString()
    );
    await room.save();

    /* --------------------------------------------------------------------------
     * 5️⃣ ایجاد پیام سیستمی خروج کاربر
     * --------------------------------------------------------------------------*/
    const leaveMsg = await Message.create({
      roomId,
      type: "system",
      text: `${userName} از گروه خارج شد`,
    });

    /* --------------------------------------------------------------------------
     * 6️⃣ بروزرسانی اطلاعات اعضا
     *    (پس از خروج)
     * --------------------------------------------------------------------------*/
    const updatedRoom = await room.populate("members", "name profilePic");

    /* --------------------------------------------------------------------------
     * 7️⃣ اطلاع‌رسانی به اعضای گروه
     * --------------------------------------------------------------------------*/
    io.to(roomId).emit("room:update", updatedRoom);
    io.to(roomId).emit("message:send", { roomId, messages: [leaveMsg] });

    /* --------------------------------------------------------------------------
     * پاسخ نهایی
     * --------------------------------------------------------------------------*/
    return res.status(200).json({
      message: "با موفقیت از گروه خارج شدید",
    });

  } catch (error) {
    console.error("leavingTheGroup:", error);
    return res.status(500).json({ message: "خطای داخلی سرور" });
  }
};


//  آپدیت گروه
export const updateGroupRooms = async (req, res) => {
  try {
    const { memberIds, groupName } = req.body;
    const groupImage = req.file
    const { roomId } = req.params
    const userId = req.user._id

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
      updatedGroup.logo = await uploadImage(groupImage.url);
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
      type: "system",
    });

    // پیام‌ها برای اعضای حذف‌شده
    kickedOutMembers.forEach(m => {
      systemMessages.push({
        roomId,
        text: `${m.name} از گروه حذف شد`,
        type: "system",
      });
    });

    // پیام‌ها برای اعضای جدید
    const newAddedMembersData = await User.find({ _id: { $in: newAddedMembers } });

    newAddedMembersData.forEach(member => {
      systemMessages.push({
        roomId,
        text: `${member.name} به گروه اضافه شد`,
        type: "system",
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

    emitToOnlineMembers([userId, ...memberIds], "room:update", updatedRoom);

    res.status(201).json({ message: "گروه با موفقیت آپدیت شد" });

  } catch (error) {
    console.error("updateGroupRooms:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};


/**
 * افزودن اعضای جدید به گروه
 * - فقط اعضای فعلی گروه می‌توانند عضو جدید اضافه کنند
 * - اعضای تکراری فیلتر می‌شوند
 * - برای هر عضو جدید پیام سیستمی ارسال می‌شود
 */
export const addMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const { roomId } = req.params;
    const userId = req.user._id;
    const userName = req.user.name;

    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی ورودی‌ها
     * --------------------------------------------------------------------------*/
    if (!memberIds.length)
      return res.status(400).json({ message: "باید حداقل یک نفر انتخاب شود" });

    /* --------------------------------------------------------------------------
     * 2️⃣ بررسی اینکه کاربر داخل گروه باشد
     * --------------------------------------------------------------------------*/
    const isUserInRoom = await ChatRoom.exists({ _id: roomId, members: userId });
    if (!isUserInRoom)
      return res.status(403).json({ message: "شما در این گروه حضور ندارید" });

    /* --------------------------------------------------------------------------
     * 3️⃣ بررسی وجود اتاق
     * --------------------------------------------------------------------------*/
    const room = await chatRoomService.findById(roomId);
    if (!room)
      return res.status(400).json({ message: "اتاق نامعتبر است" });

    /* --------------------------------------------------------------------------
     * 4️⃣ جدا کردن اعضای جدید (فقط کسانی که قبلاً عضو نیستند)
     * --------------------------------------------------------------------------*/
    const currentMemberIds = room.members.map(m => m._id.toString());
    const newMemberIds = memberIds.filter(id => !currentMemberIds.includes(id));

    if (!newMemberIds.length)
      return res.status(401).json({ message: "کاربر از قبل در گروه وجود دارد" });

    /* --------------------------------------------------------------------------
     * 5️⃣ بررسی معتبر بودن کاربران جدید
     * --------------------------------------------------------------------------*/
    const newMembers = await User.find({ _id: { $in: newMemberIds } }).lean();
    if (!newMembers.length)
      return res.status(400).json({ message: "کاربران نامعتبر هستند" });

    /* --------------------------------------------------------------------------
     * 6️⃣ ساخت پیام‌های سیستمی اضافه‌شدن هر عضو
     * --------------------------------------------------------------------------*/
    const systemMessages = newMembers.map(user => ({
      roomId,
      text: `${user.name}, توسط ${userName} عضو گروه شد`,
      type: "system",
    }));

    /* --------------------------------------------------------------------------
     * 7️⃣ آپدیت اعضای گروه
     * --------------------------------------------------------------------------*/
    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: { $each: newMemberIds } } },
      { new: true }
    )
      .populate("members", "name profilePic")
      .populate("lastMessage", "text createdAt");

    /* --------------------------------------------------------------------------
     * 8️⃣ ذخیره پیام‌های سیستمی
     * --------------------------------------------------------------------------*/
    const createdMessages = await Message.insertMany(systemMessages);

    /* --------------------------------------------------------------------------
     * 🔟 اطلاع‌رسانی به اعضای قدیمی و جدید
     * --------------------------------------------------------------------------*/
    const allMemberIds = [...currentMemberIds, ...newMemberIds];

    emitToOnlineMembers(allMemberIds, "room:update", updatedRoom);
    io.to(roomId).emit("message:send", { roomId, messages: createdMessages });

    /* --------------------------------------------------------------------------
     * پاسخ نهایی
     * --------------------------------------------------------------------------*/
    return res.status(201).json({
      message: "اعضاء با موفقیت به گروه اضافه شدند",
    });

  } catch (error) {
    console.error("addMembers:", error);
    return res.status(500).json({ message: "خطای داخلی سرور" });
  }
};
