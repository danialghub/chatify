import express from "express";
import {
    createGroupChat,
    getAllGroupChat,
    getAllPrivateChat,
    leavingGroup,
    removeGroupChat,
    removePrivateChat
} from "../controllers/chatRoom.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";


const router = express.Router();

router.use(arcjetProtection, protectRoute);


router.get('/group-chats', getAllGroupChat)
router.get('/private-chats', getAllPrivateChat)

router.post('/group', createGroupChat)

router.put('/group/leave/:roomId',leavingGroup)

router.delete('/private-chats/:otherUserId', removePrivateChat)
router.delete('/group-chats/:roomId', removeGroupChat)



export default router