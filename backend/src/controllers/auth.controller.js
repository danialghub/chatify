import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { name, userName, password } = req.body;


  try {
    if (!name || !userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!userName.startsWith('@')) {
      return res.status(400).json({ message: "Invalid userName format" });
    }

    const user = await User.findOne({ userName });
    if (user) return res.status(400).json({ message: "userName already exists" });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      userName,
      password: hashedPassword,
    });

    if (newUser) {
      // before CR:
      // generateToken(newUser._id, res);
      // await newUser.save();

      // after CR:
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        userName: newUser.userName,
        profilePic: newUser.profilePic,
      });

      // try {
      //   await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      // } catch (error) {
      //   console.error("Failed to send welcome email:", error);
      // }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "نام کاربری و رمزعبور ضروری است" });
  }

  try {
    const user = await User.findOne({ userName });

    if (!user) return res.status(400).json({ message: "رمزعبور یا نام کاربری اشتباه است" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "نام کاربری یا ایمیل اشتباه است" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.clearCookie("jwt")
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, name, password, bio } = req.body;

    if (!profilePic && !name && !password && !bio)
      return res.status(400).json({ message: "داده نامعتبر است" });

    const userId = req.user._id;

    const newInfo = { name, bio }

    if (profilePic) {
      let uploadedImg = await cloudinary.uploader.upload(profilePic, {
        transformation: [
          { width: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: "auto" }
        ]
      });
      newInfo.profilePic = uploadedImg.secure_url
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      newInfo.password = hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      newInfo,
      { new: true }
    );


    res.status(200).json({ updatedUser, message: "اطلاعات با موفقیت ویرایش شد" });
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
