import express from "express";
import {
    createGroupChat, getAllGroupChat, getAllPrivateChat,getUsers
} from "../controllers/chatRoom.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";


const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get('/',getUsers)
router.get('/group-chats',getAllGroupChat)
router.get('/private-chats',getAllPrivateChat)
router.post('/group',createGroupChat)

export default router