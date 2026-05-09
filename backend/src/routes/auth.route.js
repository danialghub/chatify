import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from '../lib/multer.js'
const router = express.Router();

//بررسی احراز هویت شده بودن کاربر
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));


//ثبت نام کاربر در سایت
router.post("/signup", signup);

//ورود کاربر به سایت
router.post("/login", login);

//خروج کاربر از سایت
router.post("/logout", logout);

//ادیت اطلاعات کاربر
router.put("/update-profile", protectRoute, upload.single('image'), updateProfile);


export default router;
