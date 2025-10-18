import FriendRequest from '../models/FriendRequest.js'
import ChatRoom from '../models/ChatRoom.js'
import User from '../models/User.js'

import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsers = async (req, res) => {
    try {
        const { name } = req.query
        const myUserId = req.user._id


        if (!name)
            return res.sendStatus(400)

        const requests = await FriendRequest.find({
            $or: [
                { from: myUserId },
                { to: myUserId }
            ]
        });

        // لیست آی‌دی تمام کاربرهایی که در درخواست‌ها حضور دارن
        const requestedUserIds = requests.map(request =>
            request.from.toString() === myUserId.toString() ? request.to : request.from
        );

        const users = await User.find({
            name: { $regex: name, $options: 'i' },
            _id: { $ne: myUserId, $nin: requestedUserIds },

        });
        const groups = await ChatRoom.find({ name: { $regex: name, $options: "i" } })

        const payloads = [...users, ...groups]

        if (!payloads.length) {
            return res.status(404).json({ message: "!هیچ موردی یافت نشد" })
        }
        res.status(200).json(payloads)
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendRequest = async (req, res) => {
    try {
        const from = req.user._id

        const { to } = req.params


        if (!to)
            return res.status(400).json({ message: "شخص مورد نظر نامعتبر میباشد" })

        const isRequestExsist = await FriendRequest.findOne({ from, to })
        if (isRequestExsist)
            return res.status(400).json({ message: "درخواست دوستی وجود دارد" })

        const newRequest = new FriendRequest({
            from,
            to
        })
        const request = await (await newRequest.save())
            .populate('from', 'name profilePic');

        const receiverId = getReceiverSocketId(to)
        if (receiverId) {
            io.to(receiverId).emit('newRequest', request)
        }
        res.status(201).json({ message: "درخواست با موفقیت ارسال شد" })

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getAllRequests = async (req, res) => {
    try {
        const to = req.user._id
        const allRequests = await FriendRequest.find({ to, status: "Pending" })
            .populate('from', 'name profilePic')
        console.log(allRequests.length);

        if (!allRequests.length) return res.sendStatus(404)

        res.status(200).json(allRequests)

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

//if status was equaled to accepted, a new private room would be create
//if status was equaled to rejected, request would be ignored
export const changeRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params
        const { status } = req.body

        if (!status)
            return res.status(400).json({ message: "status is missed" })

        if (status === "Rejected") {
            await FriendRequest.findOneAndDelete({ _id: requestId })
            res.status(200).json({ message: "با موفقیت درخواست کاربر لغو شد" })

        } else if (status === "Accepted") {

            const { from, to } = await FriendRequest.findOneAndUpdate({ _id: requestId }, { status })
            console.log('backend');

            const newRoom = new ChatRoom({
                type: "private",
                members: [{ user: from }, { user: to }]
            });

            await newRoom.save();

            // بعد از ذخیره، دوباره از دیتابیس با populate بگیرش
            const room = await ChatRoom.findById(newRoom._id)
                .select('-name -members.role')
                .populate('members.user', 'name profilePic bio')
                .lean();

            if (!room) return res.sendStatus(404);

            // اون یکی کاربر رو پیدا کن
            const otherMember = room.members.find(
                m => String(m.user._id) !== String(from)
            );

            // خروجی نهایی (ساختار ساده برای فرانت)
            const privateRoom = {
                _id: room._id,
                type: room.type,
                user: otherMember?.user || null,
                updatedAt: room.updatedAt,
            };

            const receiverId = getReceiverSocketId(from)
            if (receiverId) {
                io.to(receiverId).emit('newRoom', privateRoom)
            }
            res.status(200).json({ message: "با موفقیت درخواست کاربر پذیرفته شد", privateRoom })

        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}