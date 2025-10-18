import ChatRoom from '../models/ChatRoom.js'



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
            .lean(); // اضافه کن تا خروجی JSON بشه و بتونی راحت تغییر بدی


        if (!allPrivateChats.length) return res.sendStatus(404);

        // هر چت رو طوری فیلتر کن که فقط اون یکی user بمونه ولی بقیه فیلدها حفظ بشن
        const filteredPrivateChats = allPrivateChats.map(chat => {
            const otherMember = chat.members.find(m => String(m.user._id) !== String(userId));
            return {
                _id: chat._id,
                user: otherMember.user, // فقط اون یکی کاربر
                type: chat.type,
                updatedAt: chat.updatedAt,
            };
        });

        res.status(200).json(filteredPrivateChats);

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
            
        if (!allGroupChats.length) return res.status(404).json({ message: "هیچ گروهی وجود ندارد" })
        res.status(200).json(allGroupChats)

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
