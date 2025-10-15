import FriendRequest from '../models/FriendRequest.js'
import ChatRoom from '../models/ChatRoom.js'
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendRequest = async (req, res) => {
    try {
        const from = req.user._id
        const { to } = req.body

        if (!to)
            return res.status(400).json({ message: "شخص مورد نظر نامعتبر میباشد" })

        const isRequestExsist = await FriendRequest.findOne({ from, to })
        if (isRequestExsist)
            return res.status(400).json({ message: "درخواست دوستی وجود دارد" })

        const newRequest = new FriendRequest({
            from,
            to
        })
        await newRequest.save()

        const receiverId = getReceiverSocketId(to)
        if (receiverId) {
            io.to(receiverId).emit('newRequest', newRequest)
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

            const newRoom = await ChatRoom.create({
                members: [
                    { user: from },
                    { user: to }
                ]
            })

            res.status(200).json({ message: "با موفقیت درخواست کاربر پذیرفته شد", room: newRoom })

        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}