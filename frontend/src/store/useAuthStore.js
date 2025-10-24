import { create } from "zustand";
import { authService } from "../services/auth.services";
import { useRoomStore } from './useRoomStore'
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const data = await authService.checkAuth()
      set({ authUser: data });
      get().connectSocket();

    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (authData) => {
    set({ isSigningUp: true });
    try {

      const data = await authService.signUp(authData);
      set({ authUser: data });

      toast.success("حساب شما با موفقیت ساخته شد");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (authData) => {
    set({ isLoggingIn: true });
    try {
      const data = await authService.login(authData);
      set({ authUser: data });

      toast.success("با موفقیت وارد شدید");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout()
      set({ authUser: null });
      toast.success("با موفقیت خارج شدید");
      get().disconnectSocket();
      useRoomStore.getState().setSelectedRoom(null)
    } catch (error) {
      toast.error("خطایی پیش آمد");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData)
      set({ authUser: data });
      toast.success("پروفایل با موفقیت آپدیت شد");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
