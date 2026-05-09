//setup
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
//routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import chatRoomRoutes from "./routes/chatRoom.route.js";
import userRoutes from "./routes/user.route.js";
//configs
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// ========== MIDDLEWARES ==========
app.use('/uploads', express.static('uploads')); //معرفی پوشه فایل های ثابت 
app.use(express.json({ limit: "5mb" })); //با محدودیت حجم 5 مگابایت json برای دریافت اطلاعات 
//مدیریت سایت هایی که به سرور ما درخواست میدهند
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser()); // خواندن کوکی‌ها

//APIs
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/room", chatRoomRoutes);
app.use("/api/user", userRoutes);

// آماده سازی بک اند و فرانت اند برای استقرار سایت
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
})

