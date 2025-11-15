import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useRoomStore } from "./useRoomStore";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  modal: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessageSending: false,
  replyToMsg: null,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  openModal: (type, props = {}) => set({ modal: { type, props } }),

  setReplyToMsg: (val) => set(({ replyToMsg }) => ({ replyToMsg: replyToMsg?._id === val?._id ? null : val })),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

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
    const { selectedRoom, updateRoomStates } = useRoomStore.getState();

    if (!selectedRoom?._id) return

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderId: {
        _id: authUser._id,
        name: authUser.name,
        profilePic: authUser.profilePic
      },
      roomId: {
        _id: selectedRoom?._id,
        isGroup: selectedRoom?.isGroup
      },
      replyTo: messageData?.replyTo && {
        ...messageData.replyTo,
        senderId: { name: messageData?.replyTo?.senderId?.name }
      },
      ...messageData,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    //تازه سازی چت ها
    updateRoomStates(optimisticMessage)

    try {
      set({ isMessageSending: optimisticMessage._id })
      const { data } = await axiosInstance.post(`/messages/send/${selectedRoom._id}`, { ...messageData, replyTo: messageData?.replyTo?._id || null });
      set({ messages: messages.concat(data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessageSending: false })
    }
  },

  removeMessage: async (msgId) => {
    const { messages, openModal } = get()
    const msgs = [...messages]

    try {
      await axiosInstance.delete(`/messages/remove/${msgId}`)
      set(prev => (
        {
          messages: prev.messages.filter(m => m._id !== msgId)
        }
      ))
      openModal(null)

    } catch (error) {
      set({ messages: msgs })
      toast.error(error.response?.data?.message || "خطا در برقراری")
    }
  },

  addToMessages: (newMessage) => {
    const { isSoundEnabled, checkMessageAsSeen } = get();
    const { selectedRoom } = useRoomStore.getState()
    if (!selectedRoom) return;

    const isForCurrentChat = newMessage.roomId === selectedRoom?._id;
    if (!isForCurrentChat) return;

    set(({ messages }) => ({
      messages: [...messages, ...newMessage.messages],
    }));
    checkMessageAsSeen(selectedRoom._id)
    if (isSoundEnabled) {
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.currentTime = 0; // reset to start
      notificationSound.play().catch((e) => console.log("Audio play failed:", e));
    }
  },
  removeFromMessages: ({ msgId, room }) => {
    const { selectedRoom } = useRoomStore.getState()
    const chatType = room.isGroup ? "groupRooms" : "privateRooms"
    if (!selectedRoom) return;

    set(({ messages }) => ({
      messages: messages.filter(msg => msg._id !== msgId),
    }));
    useRoomStore.setState((prev) => (
      {
        [chatType]: prev[chatType].map(chat => chat._id === room._id
          ? { ...chat, lastMessage: room.lastMessage }
          : chat
        )
      }
    ))
  },
  checkMessageAsSeen: async (roomId) => {
    try {
      const { data } = await axiosInstance.post(`/messages/seenby/${roomId}`)
    } catch (error) {
      console.log(error.response.data.message);
    }
  },

}));
