import express from "express";
import {
    addMembers,
    createRoom,
    getAllRooms,
    leavingTheGroup,
    removeRoom,
    updateGroupRooms
} from "../controllers/chatRoom.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from '../lib/multer.js'

const router = express.Router();

//کاربر باید هویتش احراز شده باشد برای دسترسی به این مسیر ها
router.use(protectRoute);


//دریافت تمامی اتاق ها
router.get('/all', getAllRooms)


//ایجاد یک اتاق
router.post('/create', upload.single('image'), createRoom)


//آپدیت اطلاعات یه گروه خاص
router.put('/update/:roomId', upload.single('image'), updateGroupRooms)

//اضافه کردن کاربران به یک گروه خاص
router.put('/addmember/:roomId', addMembers)

//ترک یک گروه 
router.put('/leave/:roomId', leavingTheGroup)


//حذف یک اتاق
router.delete('/remove/:roomId', removeRoom)



export default router