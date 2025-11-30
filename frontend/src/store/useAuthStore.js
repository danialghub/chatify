import { create } from "zustand";
import { authService } from "@/services/auth.services";
import { useRoomStore } from '@/store/useRoomStore';
import { useChatStore } from '@/store/useChatStore';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// تعیین BASE_URL بسته به محیط
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

/**
 * Zustand store برای مدیریت Authentication
 * - ورود، ثبت‌نام، خروج
 * - بروزرسانی پروفایل
 * - اتصال/قطع اتصال Socket
 * - مدیریت کاربران آنلاین
 */
export const useAuthStore = create((set, get) => ({
  // --------------------------
  // 🔹 State اصلی
  // --------------------------
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdating: false,
  socket: null,
  onlineUsers: [],

  // --------------------------
  // 🔹 بررسی احراز هویت کاربر
  // --------------------------
  checkAuth: async () => {
    try {
      const data = await authService.checkAuth();
      set({ authUser: data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --------------------------
  // 🔹 ثبت‌نام
  // --------------------------
  signup: async (authData) => {
    set({ isSigningUp: true });
    try {
      const data = await authService.signUp(authData);
      set({ authUser: data });

      toast.success("حساب شما با موفقیت ساخته شد");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "خطا در ثبت‌نام");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // --------------------------
  // 🔹 ورود
  // --------------------------
  login: async (authData) => {
    set({ isLoggingIn: true });
    try {
      const data = await authService.login(authData);
      set({ authUser: data });

      toast.success("با موفقیت وارد شدید");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "خطا در ورود");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // --------------------------
  // 🔹 خروج
  // --------------------------
  logout: async () => {
    try {
      await authService.logout();

      // پاکسازی state
      set({ authUser: null });
      useRoomStore.getState().setSelectedRoom(null);
      useChatStore.getState().openModal(null);

      toast.success("با موفقیت خارج شدید");
      get().disconnectSocket();
    } catch (error) {
      toast.error("خطایی پیش آمد");
      console.log("Logout error:", error);
    }
  },

  // --------------------------
  // 🔹 بروزرسانی پروفایل کاربر
  // --------------------------
  updateProfile: async (body) => {
    try {
      set({ isUpdating: true });
      const data = await authService.updateProfile(body);

      set({ authUser: data.updatedUser });
      toast.success(data.message);
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "خطا در بروزرسانی پروفایل");
    } finally {
      set({ isUpdating: false });
    }
  },

  // --------------------------
  // 🔹 اتصال Socket
  // --------------------------
  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true, // ارسال کوکی‌ها با اتصال
    });

    newSocket.connect();
    set({ socket: newSocket });

    // دریافت کاربران آنلاین
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // --------------------------
  // 🔹 قطع اتصال Socket
  // --------------------------
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
  },
}));
