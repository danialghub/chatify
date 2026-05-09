import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

//در کوکی و ذخیره کاربر در آبجکت سوکت ها JWT با بررسی توکن  Socket.IO احراز هویت سوکت های 
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // استخراج توکن از کوکی
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      console.log("اتصال سوکت رد شد: توکن ارائه نشده است");
      return next(new Error("دسترسی غیر مجاز - هیچ توکنی وجود ندارد"));
    }

    // اعتبارسنجی توکن
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (!decoded) {
      console.log("اتصال سوکت رد شد: توکن نامعتبر است");
      return next(new Error("دسترسی غیر مجاز - توکن نامعتبر"));
    }

    // یافتن کاربر در دیتابیس
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("اتصال سوکت رد شد: کاربر یافت نشد");
      return next(new Error("کاربر پیدا نشد"));
    }

    // ذخیره اطلاعات کاربر در سوکت
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`احراز هویت سوکت برای کاربر: ${user.name} (${user._id}) با موفقیت انجام شد`);

    next();
  } catch (error) {
    console.log("خطا در احراز هویت سوکت:", error.message);
    next(new Error("دسترسی غیر مجاز - احراز هویت به شکست خورد"));
  }
};
