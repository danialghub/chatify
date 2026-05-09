// کنترلرهای مربوط به احراز هویت و مدیریت کاربران
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/**
 * ثبت‌نام کاربر جدید
 * - اعتبارسنجی فیلدها
 * - هش کردن رمز عبور
 * - ذخیره در دیتابیس
 * -  صدور توکن JWT و ذخیره در کوکی 
 */
export const signup = async (req, res) => {
  const { name, userName, password } = req.body;

  try {
    // اعتبارسنجی اولیه ورودی‌ها
    if (!name || !userName || !password) {
      return res.status(400).json({ message: "تمامی فیلدها الزامی هستند" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "رمز عبور باید حداقل ۶ کاراکتر باشد" });
    }

    if (!userName.startsWith("@")) {
      return res
        .status(400)
        .json({ message: "فرمت نام کاربری نامعتبر است (باید با @ شروع شود)" });
    }

    // بررسی یکتایی نام کاربری
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: "این نام کاربری قبلاً ثبت شده است" });
    }

    // هش کردن رمز عبور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ایجاد نمونه کاربر
    const newUser = new User({
      name,
      userName,
      password: hashedPassword,
    });

    // ذخیره در دیتابیس
    const savedUser = await newUser.save();

    // پس از ذخیره موفق، توکن رو صادر می‌کنیم
    generateToken(savedUser._id, res);

    // بازگرداندن اطلاعات کاربر (بدون رمز و اطلاعات حساس)
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      userName: savedUser.userName,
      profilePic: savedUser.profilePic,
    });


  } catch (error) {
    console.error("خطا در کنترلر ثبت‌نام:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

/**
 * ورود کاربر
 * - بررسی وجود کاربر
 * - مقایسه رمز عبور هش‌شده
 * - صدور توکن و تنظیم کوکی
 */
export const login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "نام کاربری و رمز عبور ضروری است" });
  }

  try {
    // جستجوی کاربر با نام کاربری
    const user = await User.findOne({ userName });

    // اگر کاربر وجود نداشت، پیام عمومی برای امنیت بیشتر
    if (!user) {
      return res.status(400).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
    }

    // بررسی صحت رمز عبور
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
    }

    // تولید توکن و ذخیره در کوکی
    generateToken(user._id, res);

    // ارسال اطلاعات کاربر (بدون رمز و اطلاعات داخلی)
    res.status(200).json({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("خطا در کنترلر ورود:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

/**
 * خروج از حساب کاربری
 * -JWT پاک کردن کوکی حاوی 
 */
export const logout = (_, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "با موفقیت خارج شدید" });
};

/**
 * به‌روزرسانی پروفایل کاربر
 * - عکس پروفایل (آپلود در Cloudinary)
 * - رمز عبور جدید (هش مجدد)
 * - نام و بیوگرافی
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, password, bio } = req.body;
    const userId = req.user._id; // از middleware احراز هویت میاد
    const image = req?.file
    console.log(req?.file);
    // اگر هیچ فیلدی برای آپدیت ارسال نشده
    if (!image && !name && !password && !bio) {
      return res.status(400).json({ message: "حداقل یک فیلد برای به‌روزرسانی ارسال کنید" });
    }



    // آبجکت حاوی اطلاعات جدید
    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (bio) updatedFields.bio = bio;

    // آپدیت عکس پروفایل (آپلود در Cloudinary با بهینه‌سازی)
    if (image) {
      updatedFields.profilePic = `http://localhost:3000/uploads/${image.filename}`
    }

    // آپدیت رمز عبور (در صورت درخواست)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    // اعمال به‌روزرسانی در دیتابیس و برگرداندن نسخه جدید
    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,            // برگرداندن سند جدید پس از آپدیت
      runValidators: true,  // اعتبارسنجی schema رو اعمال کن (مثلاً required fields)
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    res.status(200).json({
      updatedUser,
      message: "اطلاعات با موفقیت ویرایش شد",
    });
  } catch (error) {
    console.error("خطا در به‌روزرسانی پروفایل:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};