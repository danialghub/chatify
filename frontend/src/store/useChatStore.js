import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import cancellableRequest from "../lib/cancellableRequest";
import toast from "react-hot-toast";
import { useRoomStore } from "./useRoomStore";
import { useAuthStore } from "./useAuthStore";

/**
 * Zustand store برای مدیریت چت
 * - پیام‌ها
 * - وضعیت آپلود و ارسال
 * - پاسخ به پیام‌ها
 * - صدا و modal
 */
export const useChatStore = create((set, get) => ({
  // --------------------------
  // 🔹 State اصلی
  // --------------------------
  messages: [],
  downloadedFiles: {},
  modal: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessageSending: false,
  isMessageRemoving: false,
  uploadProgress: 0,
  uploadedSize: 0,
  uploadTotal: 0,
  replyToMsg: null,
  uploadController: null,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  // --------------------------
  // 🔹 مدیریت Modal
  // --------------------------
  openModal: (type, props = {}) => set({ modal: { type, props } }),


  // --------------------------
  // 🔹 مدیریت reply
  // --------------------------

  addRenderedFiles: (id, url) => set(({ downloadedFiles }) => (
    { downloadedFiles: { ...downloadedFiles, [id]: url } }
  )),


  // --------------------------
  // 🔹 مدیریت reply
  // --------------------------
  setReplyToMsg: (val) =>
    set(({ replyToMsg }) => ({
      replyToMsg: replyToMsg?._id === val?._id ? null : val,
    })),

  // --------------------------
  // 🔹 فعال/غیرفعال کردن صدا
  // --------------------------
  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  // --------------------------
  // 🔹 دریافت پیام‌ها بر اساس روم
  // --------------------------
  getMessagesByRoomId: async (roomId) => {
    set({ isMessagesLoading: true });
    try {
      const { data } = await cancellableRequest(`/messages/${roomId}`);
      set({ messages: data });
    } catch (error) {
      // ❗ درخواست لغو شده → نباید Toast نمایش داده شود
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // --------------------------
  // 🔹 ارسال پیام
  // --------------------------
  sendMessage: async (formData, previewData) => {
    const { messages } = get();
    const { authUser } = useAuthStore.getState();
    const { selectedRoom, updateRoomStates } = useRoomStore.getState();

    if (!selectedRoom?._id) return;

    const replyToRaw = formData.get("replyTo");
    const stickerRaw = formData.get("sticker");
    const replyTo = replyToRaw ? JSON.parse(replyToRaw)._id : null;
    const sticker = stickerRaw ? JSON.parse(stickerRaw) : null;

    // --------------------------
    // 🔹 ساخت پیام موقت (Optimistic)
    // --------------------------
    const fileUrl = previewData ? URL.createObjectURL(previewData.file) : null;
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      type: "user",
      senderId: {
        _id: authUser._id,
        name: authUser.name,
        profilePic: authUser.profilePic,
      },
      roomId: {
        _id: selectedRoom._id,
        isGroup: selectedRoom.isGroup,
      },
      text: formData.get("text") || null,
      sticker,
      file: previewData
        ? {
          type: previewData.type,
          name: previewData.file.name,
          size: previewData.file.size,
          url: fileUrl,
        }
        : null,
      replyTo: JSON.parse(formData.get("replyTo")) || null,
    };

    // --------------------------
    // 🔹 اضافه به UI
    // --------------------------
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));
    updateRoomStates(optimisticMessage);

    // --------------------------
    // 🔹 ساخت Controller برای لغو آپلود
    // --------------------------
    const controller = new AbortController();
    set({ uploadController: controller, isMessageSending: optimisticMessage._id });

    const payload = { ...Object.fromEntries(formData), replyTo, sticker };

    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedRoom._id}`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percent = Math.round((loaded * 100) / total);
            set({
              uploadProgress: percent,
              uploadedSize: loaded,
              uploadTotal: total,
            });
          },
        }
      );

      // --------------------------
      // 🔹 جایگزینی پیام موقت با پیام واقعی
      // --------------------------

      set((state) => ({
        messages: [
          ...state.messages.filter((msg) => msg._id !== optimisticMessage._id),
          ...data
        ],
      }));
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        toast("آپلود لغو شد");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }

      // حذف پیام موقت در صورت خطا
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== optimisticMessage._id),
      }));
    } finally {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      set({
        isMessageSending: false,
        uploadProgress: 0,
        uploadedSize: 0,
        uploadTotal: 0,
        uploadController: null,
      });
    }
  },

  // --------------------------
  // 🔹 لغو آپلود
  // --------------------------
  cancelUpload: () => {
  const { uploadController, messages, uploadProgress } = get();

  if (!uploadController) return;

  // اگر آپلود بیشتر از 95% انجام شده باشد، دیگر لغو امکان‌پذیر نیست
  if (uploadProgress >= 95) {
    toast("آپلود تقریبا کامل است، دیگر نمی‌توان لغو کرد");
    return;
  }

  uploadController.abort();

  set({
    uploadController: null,
    isMessageSending: false,
    uploadProgress: 0,
    uploadedSize: 0,
    uploadTotal: 0,
    messages: messages.filter((msg) => !msg.isOptimistic),
  });
},


  // --------------------------
  // 🔹 حذف پیام
  // --------------------------
  removeMessage: async (msgId) => {
    const { messages, openModal } = get();
    const msgsBackup = [...messages];

    try {
      set({ isMessageRemoving: true })
      await axiosInstance.delete(`/messages/remove/${msgId}`);
      set((prev) => ({ messages: prev.messages.filter((m) => m._id !== msgId) }));
      openModal(null);
    } catch (error) {
      set({ messages: msgsBackup });
      toast.error(error.response?.data?.message || "خطا در برقراری");
    } finally {
      set({ isMessageRemoving: false })
    }
  },

  // --------------------------
  // 🔹 اضافه کردن پیام جدید به UI
  // --------------------------
  addToMessages: (newMessage) => {
    const { isSoundEnabled, checkMessageAsSeen } = get();
    const { selectedRoom } = useRoomStore.getState();
    if (!selectedRoom) return;

    const isForCurrentChat = newMessage.roomId === selectedRoom?._id;
    if (!isForCurrentChat) return;

    set(({ messages }) => ({ messages: [...messages, ...newMessage.messages] }));

    checkMessageAsSeen(selectedRoom._id);

    if (isSoundEnabled) {
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.currentTime = 0;
      notificationSound.play().catch((e) => console.log("Audio play failed:", e));
    }
  },

  // --------------------------
  // 🔹 حذف پیام از UI
  // --------------------------
  removeFromMessages: ({ msgId, room }) => {
    const { selectedRoom } = useRoomStore.getState();
    if (!selectedRoom) return;

    const chatType = room.isGroup ? "groupRooms" : "privateRooms";

    set(({ messages }) => ({
      messages: messages.filter((msg) => msg._id !== msgId),
    }));

    useRoomStore.setState((prev) => ({
      [chatType]: prev[chatType].map((chat) =>
        chat._id === room._id ? { ...chat, lastMessage: room.lastMessage } : chat
      ),
    }));
  },

  // --------------------------
  // 🔹 علامت‌گذاری پیام‌ها به عنوان خوانده‌شده
  // --------------------------
  checkMessageAsSeen: async (roomId) => {
    try {
      await axiosInstance.post(`/messages/seenby/${roomId}`);
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  },
}));
