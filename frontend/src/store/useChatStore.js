import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useRoomStore } from "./useRoomStore";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  //states
  messages: [],
  modal: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessageSending: false,
  replyToMsg: null,
  messageInput: "",
  messageInputMode: "create",
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  //state setters
  openModal: (type, props = {}) => set({ modal: { type, props } }),

  setReplyToMsg: (val) => set(({ replyToMsg }) => (
    { replyToMsg: replyToMsg?._id === val?._id ? null : val }
  )),

  setMessageInput: (val) => set({ messageInput: val }),
  setMessageInputMode: (val) => set({ messageInputMode: val }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  //apis
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

  sendMessage: async (formData, previewImg) => {
    const { authUser } = useAuthStore.getState();
    const { selectedRoom, updateRoomStates } = useRoomStore.getState();

    if (!selectedRoom?._id) return;

    const replyToRaw = formData.get("replyTo");
    const stickerRaw = formData.get("sticker");
    const text = formData.get('text') || null
    const replyTo = replyToRaw ? JSON.parse(replyToRaw) : null;
    const sticker = stickerRaw ? JSON.parse(stickerRaw) : null;

    // --------------------------
    // 🔹 ساخت پیام موقت (Optimistic)
    // --------------------------
    const fileUrl = previewImg || null;
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      senderId: {
        _id: authUser._id,
        name: authUser.name,
        profilePic: authUser.profilePic,
      },
      roomId: {
        _id: selectedRoom._id,
        isGroup: selectedRoom.isGroup,
      },
      text,
      sticker,
      image: fileUrl,
      replyTo,
    };

    // --------------------------
    // 🔹 اضافه به UI
    // --------------------------
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));
    updateRoomStates({ message: optimisticMessage, acactionType: 'create' });


    set({ isMessageSending: optimisticMessage._id });

    const payload = { ...Object.fromEntries(formData), replyTo: replyTo?._id, sticker };

    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedRoom._id}`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // --------------------------
      // 🔹 جایگزینی پیام موقت با پیام واقعی
      // --------------------------

      set((state) => ({
        messages: [
          ...state.messages.filter((msg) => msg._id !== optimisticMessage._id),
          data
        ],
      }));
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        toast("Upload canceled");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
      // حذف پیام موقت در صورت خطا
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== optimisticMessage._id),
      }));
    } finally {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      set({ isMessageSending: false, });
    }
  },
  editMessage: async (msgId, text) => {
    const { messages, setMessageInputMode } = get()
    const { updateRoomStates } = useRoomStore.getState()
    const currentMessage = messages.find(msg => msg._id === msgId)

    // optimistic update
    set(state => ({
      messages: state.messages.map(msg =>
        msg._id === msgId ? { ...msg, text, isEdited: true, updatedAt: new Date() } : msg
      )
    }))

    try {
      const { data: editedMessage } = await axiosInstance.put(`/messages/edit/${msgId}`, { text })
      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === editedMessage._id
            ? editedMessage
            : msg
        )
      }))
      updateRoomStates({ message: editedMessage, actionType: 'edit' });
    } catch (error) {
      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === msgId ? currentMessage : msg
        )
      }))
    } finally {
      setMessageInputMode('create')
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
  checkMessageAsSeen: async (roomId) => {
    try {
      const { data } = await axiosInstance.post(`/messages/seenby/${roomId}`)
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  //socket listeners

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
    console.log(room);

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


}));
