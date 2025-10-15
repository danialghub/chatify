import ChatRoom from '../models/ChatRoom.js'
import User from '../models/User.js'

export const getUsers = async (req, res) => {
    try {
        const { userName } = req.query
        if (!userName)
            return res.sendStatus(400)
        const users = await User.find({ name: { $regex: userName, $options: 'i' } })
        if (!users.length) {
            return res.status(404).json({ message: "!هیچ کاربری یافت نشد" })
        }
        res.status(200).json(users)
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
export const createGroupChat = async (req, res) => {
    try {
        const userId = req.user._id
        const { memberIds, groupName } = req.body

        if (!groupName || !memberIds.length)
            return res.status(400).json({ message: "اطلاعات ناقص است" })

        const isGroupExisit = await ChatRoom.findOne({ name: groupName })

        if (isGroupExisit)
            return res.status(400).json({ message: "این گروه از قبل وجود دارد" })

        const newGroup = new ChatRoom({
            name: groupName,
            type: "group",
            members: [
                { user: userId, role: "owner" },
                ...memberIds.map((member) => (
                    { user: member, role: "member" }
                ))
            ]
        })
        await newGroup.save()
        res.status(201).json({ group: newGroup, message: "گروه با موفقیت ایجاد شد" })

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
export const getAllPrivateChat = async (req, res) => {
    try {
        const userId = req.user._id
        const allPrivateChats = await ChatRoom.find({
            type: 'private',
            "members.user": userId
        })
            .select('-name -members.role')
            .populate('members.user', "name profilePic bio")
            .exec()
        if (!allPrivateChats.length) return res.sendStatus(404)
        res.status(200).json(allPrivateChats)

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
export const getAllGroupChat = async (req, res) => {
    try {
        const userId = req.user._id
        const allGroupChats = await ChatRoom.find({
            type: 'group',
            "members.user": userId
        })
            .populate('members.user', "name profilePic bio")
        if (!allGroupChats.length) return res.sendStatus(404)
        res.status(200).json(allGroupChats)

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
