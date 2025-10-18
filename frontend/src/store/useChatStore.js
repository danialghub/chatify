import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useRoomtStore } from "./useRoomStore";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  FindRoomModal: false,
  isUsersLoading: false,
  activeTab: "chats",
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleFindRoomModal: () => {
    set(({ FindRoomModal }) => ({ FindRoomModal: !FindRoomModal }))
    console.log(get().FindRoomModal);

  },

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  getMessagesByRoomId: async (roomId) => {
    set({ isMessagesLoading: true });
    try {
      const { data } = await axiosInstance.get(`/messages/${roomId}`);
      set({ messages: data });


    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { messages } = get();
    const { authUser } = useAuthStore.getState();
    const { selectedRoom } = useRoomtStore.getState();
    if (!selectedRoom?._id) return

    const tempId = `temp-${Date.now()}`;
    
    
    const optimisticMessage = {
      _id: tempId,
      senderId: {
        _id: authUser._id,
        name: authUser.name,
        profilePic: authUser.profilePic
      },
      roomId: selectedRoom._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedRoom._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { isSoundEnabled } = get();
    const { selectedRoom } = useRoomtStore.getState();
    const { authUser } = useAuthStore.getState();
    if (!selectedRoom) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isFromCurrentUser = newMessage.senderId === authUser._id;
      const isForCurrentChat = newMessage.roomId === selectedRoom?._id;

      // اگه پیام از خود کاربر بود، نیازی به اضافه کردن دوباره نیست
      if (isFromCurrentUser) return;

      // اگه پیام برای چت فعلی نیست، فعلاً نمایش نده
      if (!isForCurrentChat) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
