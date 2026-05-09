import { create } from "zustand";
import { useRoomStore } from '@/store/useRoomStore'
import { useChatStore } from '@/store/useChatStore'
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdating: false,
  socket: null,
  onlineUsers: [],

  //apis
  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.get("/auth/check")
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

      const { data } = await axiosInstance.post("/auth/signup", authData);
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
      const { data } = await axiosInstance.post("/auth/login", authData);
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
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("با موفقیت خارج شدید");
      get().disconnectSocket();
      useRoomStore.getState().setSelectedRoom(null)
      useChatStore.getState().openModal(null)
    } catch (error) {
      toast.error("خطایی پیش آمد");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (body) => {
    try {
      set({ isUpdating: true })
      const { data } = await axiosInstance.put(
        "/auth/update-profile",
        body,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      set({ authUser: data.updatedUser });
      toast.success(data.message);
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdating: false })
    }
  },

  //socket configs
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
