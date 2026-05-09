import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsers } from '../controllers/user.controller.js';

const router = express.Router()

//کاربر باید هویتش احراز شده باشد برای دسترسی به این مسیر ها
router.use(protectRoute);


//دریافت اطلاعات کاربران
router.get('/all', getUsers)



export default router