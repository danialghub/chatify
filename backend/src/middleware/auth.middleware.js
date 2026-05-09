import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

// های نوشته شده دسترسی داشته باشند API احراز هویت کاربرانی که میخواهند به 
export const protectRoute = async (req, res, next) => {
  try {
    // ۱. دریافت توکن از کوکی‌های درخواست
    const token = req.cookies.jwt;

    // ۲. اگر توکن وجود نداشت، دسترسی غیرمجاز است
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    // ۳. اعتبارسنجی توکن با کلید مخفی JWT
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // ۴. اگر توکن قابل رمزگشایی یا معتبر نبود
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    // ۵. جستجوی کاربر بر اساس userId موجود در توکن (بدون فیلد پسورد)
    const user = await User.findById(decoded.userId).select("-password");

    // ۶. اگر کاربر با این شناسه در دیتابیس یافت نشد
    if (!user) return res.status(404).json({ message: "User not found" });

    // ۷. ذخیره اطلاعات کاربر در آبجکت درخواست (برای استفاده در مسیرهای بعدی)
    req.user = user;

    // ۸. ادامه درخواست به middleware یا کنترلر بعدی
    next();
  } catch (error) {
    // ۹. ثبت خطا در لاگ (مانند توکن منقضی‌شده یا دستکاری‌شده)
    console.log("Error in protectRoute middleware:", error);

    // ۱۰. پاسخ خطای سرور به کلاینت
    res.status(500).json({ message: "Internal server error" });
  }
};