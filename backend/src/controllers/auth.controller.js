import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


/**
 * ثبت‌نام کاربر جدید
 * - بررسی صحت داده‌های ورودی
 * - هش کردن رمز عبور
 * - ذخیره در دیتابیس
 * - صدور JWT
 */
export const signup = async (req, res) => {
  const { name, userName, password } = req.body;

  try {
    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی داده‌های ورودی
     * --------------------------------------------------------------------------*/
    if (!name || !userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!userName.startsWith('@')) {
      return res.status(400).json({ message: "Invalid userName format" });
    }

    /* --------------------------------------------------------------------------
     * 2️⃣ بررسی یکتا بودن نام کاربری
     * --------------------------------------------------------------------------*/
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: "userName already exists" });
    }

    /* --------------------------------------------------------------------------
     * 3️⃣ هش کردن رمز عبور
     * --------------------------------------------------------------------------*/
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* --------------------------------------------------------------------------
     * 4️⃣ ساخت نمونه کاربر جدید
     * --------------------------------------------------------------------------*/
    const newUser = new User({
      name,
      userName,
      password: hashedPassword,
    });

    /* --------------------------------------------------------------------------
     * 5️⃣ ذخیره کاربر در دیتابیس و صدور JWT
     * --------------------------------------------------------------------------*/
    const savedUser = await newUser.save();
    generateToken(savedUser._id, res);

    /* --------------------------------------------------------------------------
     * 6️⃣ پاسخ موفقیت‌آمیز
     * --------------------------------------------------------------------------*/
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      userName: savedUser.userName,
      profilePic: savedUser.profilePic,
    });


  } catch (error) {
    console.error("signup:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};



/**
 * ورود کاربر به سیستم
 * - بررسی نام کاربری و رمز عبور
 * - تولید JWT و ارسال کوکی
 */
export const login = async (req, res) => {
  const { userName, password } = req.body;

  /* --------------------------------------------------------------------------
   * 1️⃣ بررسی ورودی‌ها
   * --------------------------------------------------------------------------*/
  if (!userName || !password) {
    return res.status(400).json({ message: "نام کاربری و رمزعبور ضروری است" });
  }

  try {
    /* ------------------------------------------------------------------------
     * 2️⃣ یافتن کاربر با نام کاربری
     * ------------------------------------------------------------------------*/
    const user = await User.findOne({ userName });
    if (!user)
      return res.status(400).json({ message: "رمزعبور یا نام کاربری اشتباه است" });
    // ⚠️ هرگز به کاربر نگویید کدام یک اشتباه است: نام کاربری یا رمز عبور

    /* ------------------------------------------------------------------------
     * 3️⃣ بررسی صحت رمز عبور
     * ------------------------------------------------------------------------*/
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "نام کاربری یا ایمیل اشتباه است" });

    /* ------------------------------------------------------------------------
     * 4️⃣ تولید JWT و ارسال کوکی
     * ------------------------------------------------------------------------*/
    generateToken(user._id, res);

    /* ------------------------------------------------------------------------
     * 5️⃣ پاسخ موفقیت‌آمیز
     * ------------------------------------------------------------------------*/
    res.status(200).json({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.error("login:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};



/**
 * خروج کاربر از سیستم
 * - پاک کردن کوکی JWT
 */
export const logout = (_, res) => {
  // حذف کوکی JWT
  res.clearCookie("jwt");

  // پاسخ موفقیت‌آمیز
  res.status(200).json({ message: "Logged out successfully" });
};



/**
 * بروزرسانی پروفایل کاربر
 * - شامل نام، بیو، تصویر پروفایل و رمز عبور
 */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, name, password, bio } = req.body;

    /* --------------------------------------------------------------------------
     * 1️⃣ بررسی داده‌های ورودی
     * --------------------------------------------------------------------------*/
    if (!profilePic && !name && !password && !bio) {
      return res.status(400).json({ message: "داده نامعتبر است" });
    }

    const userId = req.user._id;
    const newInfo = { name, bio };

    /* --------------------------------------------------------------------------
     * 2️⃣ آپلود تصویر پروفایل در Cloudinary (در صورت وجود)
     * --------------------------------------------------------------------------*/
    if (profilePic) {
      const uploadedImg = await cloudinary.uploader.upload(profilePic, {
        transformation: [
          { width: 500, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      newInfo.profilePic = uploadedImg.secure_url;
    }

    /* --------------------------------------------------------------------------
     * 3️⃣ هش کردن رمز عبور جدید (در صورت وجود)
     * --------------------------------------------------------------------------*/
    if (password) {
      const salt = await bcrypt.genSalt(10);
      newInfo.password = await bcrypt.hash(password, salt);
    }

    /* --------------------------------------------------------------------------
     * 4️⃣ بروزرسانی کاربر در دیتابیس
     * --------------------------------------------------------------------------*/
    const updatedUser = await User.findByIdAndUpdate(userId, newInfo, { new: true });

    /* --------------------------------------------------------------------------
     * 5️⃣ پاسخ موفقیت‌آمیز
     * --------------------------------------------------------------------------*/
    res.status(200).json({
      updatedUser,
      message: "اطلاعات با موفقیت ویرایش شد",
    });

  } catch (error) {
    console.error("updateProfile:", error);
    res.status(500).json({ message: "خطای داخلی سرور" });
  }
};

