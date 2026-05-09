import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// بررسی اطلاعات احراز شده
io.use(socketAuthMiddleware);

// بررسی آنلاین بودن یک کاربر
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
}

// برای ارسال اطلاعات به اعضاء خاص
export const emitToOnlineMembers = (members, action, info) => {
  for (const member of members) {
    
    const receiverIsOnline = getReceiverSocketId(member)
    if (receiverIsOnline) {
      io.to(receiverIsOnline).emit(action, info)
    }
  }
}

// ذخیره شناسه های تمام کاربران آنلاین در سایت
const userSocketMap = {}; // {userId:socketId}

//ایجاد یک اتصال بلادرنگ
io.on("connection", (socket) => {
  console.log("A user connected", socket.user.name);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // ارسال شناسه کاربران آنلاین 
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // متصل کردن یک کاربر به یک اتاق خاص با دریافت شناسه اتاق
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`user ${userId} joined room ${roomId}`);
  })
  // خارج کردن یک کاربر به یک اتاق خاص با دریافت شناسه اتاق
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)
    console.log(`user ${userId} left room ${roomId}`);
  })

  //قطع اتصال کاربر
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.name);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
