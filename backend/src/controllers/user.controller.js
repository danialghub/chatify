import User from '../models/User.js'

export const getUsers = async (req, res) => {
    try {
        const { text='' } = req.query
        const userId = req.user._id
        if (!text.trim())
            return res.status(400).json({ messages: "مقدار نامعتبر" })

        const users = await User.find({
            _id: { $ne: userId },
            userName: { $regex: text, $options: 'i' }
        })

        if (!users.length)
            return res.json({ messages: "هیچ موردی یافت نشد" })

        res.status(200).json(users)
    } catch (error) {
        console.log('get Users', error.messages)
        res.status(500).json({ messages: "خطا داخلی" })
    }
}