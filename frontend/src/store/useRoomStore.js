import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { axiosInstance } from "../lib/axios";

/**
 * Zustand store برای مدیریت روم‌ها (چت‌های گروهی و خصوصی)
 * - مدیریت روم‌ها و انتخاب روم
 * - API برای ایجاد، حذف، و بروزرسانی روم‌ها
 * - socket join/leave و listeners
 * - بروزرسانی state پیام‌ها و روم‌ها
 */
export const useRoomStore = create((set, get) => ({
  // --------------------------
  // 🔹 State اصلی
  // --------------------------
  groupRooms: [],
  privateRooms: [],
  unSeenMessages: {},
  selectedRoom: null,
  targetForwardRoom: null,
  isRoomsLoading: false,
  isCreatingLoading: null,
  isRemovingLoading: false,
  isJoining: false,
  isLeaving: false,
  activeTab: "chats",

  // --------------------------
  // 🔹 Active tab
  // --------------------------
  setActiveTab: (tab) => set({ activeTab: tab }),
  // --------------------------
  // 🔹 انتخاب یک اتاق برای فوروارد پیام
  // --------------------------
  setTargetForwardRoom: (room) => set({ targetForwardRoom: room }),

  // --------------------------
  // 🔹 انتخاب روم
  // --------------------------
  setSelectedRoom: async (newRoom) => {
    const { joinNewRoomSocket, leaveRoomSocket, selectedRoom } = get();

    // اگر روم فعلی همان روم است، هیچ کاری انجام نده
    if (selectedRoom?._id === newRoom?._id) return;

    // ابتدا از روم قبلی خارج شو
    if (selectedRoom?._id) await leaveRoomSocket();

    // سپس روم جدید را انتخاب کن
    set({ selectedRoom: newRoom });

    // در نهایت به روم جدید بپیوند
    if (newRoom?._id) joinNewRoomSocket();
  },

  // --------------------------
  // 🔹 API‌ها
  // --------------------------

  /**
   * دریافت تمام روم‌ها (گروه/خصوصی)
   */
  getRooms: async ({ isGroup }) => {
    const roomType = isGroup ? "groupRooms" : "privateRooms";
    set({ isRoomsLoading: true });

    try {
      const { data } = await axiosInstance.get("/room/all", { params: { isGroup } });
      set({
        [roomType]: data.rooms,
        unSeenMessages: data.unSeenMessages,
      });
    } catch (error) {
      console.log(error.response?.data?.message || "No chat");
    } finally {
      set({ isRoomsLoading: false });
    }
  },

  /**
   * ایجاد روم جدید
   */
  createRoom: async (body, isChattingWith) => {
    const { openModal } = useChatStore.getState();
    const roomType = body.isGroup ? "groupRooms" : "privateRooms";

    try {
      set({ isCreatingLoading: isChattingWith });
      const { data } = await axiosInstance.post("/room/create", { ...body });

      const isGroup = data?.newRoom?.isGroup || data?.room?.isGroup;

      set((prev) => {
        const payload = {
          selectedRoom: data?.newRoom || data.room,
          activeTab: isGroup ? "groups" : "chats",
        };
        if (data?.newRoom) payload[roomType] = [data.newRoom, ...prev[roomType]];
        return payload;
      });

      openModal(null);
      if (data?.message) toast.success(data.message);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    } finally {
      set({ isCreatingLoading: false });
    }
  },

  /**
   * حذف روم
   */
  removeRoom: async (room) => {
    const { openModal } = useChatStore.getState();
    const { setSelectedRoom } = get();
    const roomType = room.isGroup ? "groupRooms" : "privateRooms";

    try {
      set({ isRemovingLoading: true });
      const { data } = await axiosInstance.delete(`/room/remove/${room._id}`);

      set((prev) => ({
        [roomType]: prev[roomType].filter((r) => r._id !== room._id),
      }));

      openModal(null);
      setSelectedRoom(null);
      toast.success(data.message);
    } catch (error) {
      console.log(error.response?.data?.message);
    } finally {
      set({ isRemovingLoading: false });
    }
  },

  /**
   * خروج از گروه
   */
  leaveingTheGroup: async (roomId) => {
    const { setSelectedRoom } = get();
    const { openModal } = useChatStore.getState();

    try {
      set({ isLeaving: true });
      const { data } = await axiosInstance.put(`/room/leave/${roomId}`);

      set(({ groupRooms }) => ({ groupRooms: groupRooms.filter((g) => g._id !== roomId) }));
      setSelectedRoom(null);
      toast.success(data.message);
      openModal(null);
    } catch (error) {
      toast.error(error?.response?.data.message || "Internal Error");
    } finally {
      set({ isLeaving: false });
    }
  },

  /**
   * بروزرسانی اطلاعات گروه
   */
  updateGroup: async (body, roomId) => {
    const { openModal } = useChatStore.getState();

    try {
      set({ isUpdatingLoading: true });
      const { data } = await axiosInstance.put(`/room/update/${roomId}`, { ...body });
      openModal(null);
      if (data?.message) toast.success(data.message);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    } finally {
      set({ isUpdatingLoading: false });
    }
  },

  /**
   * اضافه کردن اعضا به گروه
   */
  addMembers: async (memberIds, roomId) => {
    const { openModal } = useChatStore.getState();
    try {
      set({ isJoining: true });
      const { data } = await axiosInstance.put(`/room/addmember/${roomId}`, { memberIds });
      openModal(null);
      toast.success(data.message);
    } catch (error) {
      console.log(error.response?.data?.message || "Error in add members");
    } finally {
      set({ isJoining: false });
    }
  },

  // --------------------------
  // 🔹 Socket
  // --------------------------

  joinNewRoomSocket: () => {
    const { socket } = useAuthStore.getState();
    const { selectedRoom } = get();

    // پاک کردن شمارنده پیام‌های خوانده نشده
    set((state) => {
      const copy = { ...state.unSeenMessages };
      delete copy[selectedRoom._id];
      return { unSeenMessages: copy };
    });

    socket.emit("join-room", selectedRoom._id);
  },

  leaveRoomSocket: () => {
    const { socket } = useAuthStore.getState();
    const { selectedRoom } = get();

    socket.emit("leave-room", selectedRoom._id);
    set({ selectedRoom: null });

    // ریست reply
    useChatStore.getState().setReplyToMsg(null);
  },

  // --------------------------
  // 🔹 Socket listeners
  // --------------------------
  addToRooms: (newRoom) => {
    const roomType = newRoom.isGroup ? "groupRooms" : "privateRooms";
    set((prev) => {
      if (prev[roomType].some((r) => r._id === newRoom._id)) return prev;
      return { [roomType]: [newRoom, ...prev[roomType]] };
    });
  },

  removeFromRooms: (room) => {
    const { setSelectedRoom, selectedRoom } = get();
    const roomType = room.isGroup ? "groupRooms" : "privateRooms";

    set((prev) => ({
      [roomType]: prev[roomType].filter((r) => r._id !== room._id),
    }));

    if (room._id === selectedRoom?._id) setSelectedRoom(null);
  },

  // --------------------------
  // 🔹 بروزرسانی state روم‌ها با پیام جدید
  // --------------------------
  updateRoomStates: (newMessage) => {
    const { isSoundEnabled } = useChatStore.getState();

    set((prev) => {
      const roomType = newMessage.roomId.isGroup ? "groupRooms" : "privateRooms";
      const chats = prev[roomType] || [];
      const unSeenMessages = { ...prev.unSeenMessages };
      const seenMessageIds = new Set(prev.seenMessageIds || []);
      const newDate = newMessage.createddAt;
      const isFromSys = newMessage.system;

      // اگر این پیام قبلاً شمرده شده، دیگر اضافه نشود
      if (!seenMessageIds.has(newMessage._id)) {
        unSeenMessages[newMessage.roomId._id] = (prev.selectedRoom?._id === newMessage.roomId._id || isFromSys)
          ? 0
          : (unSeenMessages[newMessage.roomId._id] || 0) + 1;

        seenMessageIds.add(newMessage._id);
      }

      // پیدا کردن چت مورد نظر
      const targetChatIndex = chats.findIndex((chat) => chat._id === newMessage.roomId._id);
      if (targetChatIndex === -1) return prev;

      const updatedChat = {
        ...chats[targetChatIndex],
        updatedAt: newDate,
        lastMessage: newMessage,
      };

      const updatedChats = [
        updatedChat,
        ...chats.filter((chat, idx) => idx !== targetChatIndex),
      ];

      return {
        ...prev,
        [roomType]: updatedChats,
        unSeenMessages,
        seenMessageIds,
      };
    });

    // صدای اعلان
    if (isSoundEnabled) {
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.currentTime = 0;
      notificationSound.play().catch((e) => console.log("Audio play failed:", e));
    }
  },



  // --------------------------
  // 🔹 بروزرسانی state گروه
  // --------------------------
  updateGroupStates: (updatedGroup) => {
    const { selectedRoom } = get();

    set(({ groupRooms }) => ({
      groupRooms: [updatedGroup, ...groupRooms.filter((g) => g._id !== updatedGroup._id)],
    }));

    if (selectedRoom?._id === updatedGroup._id) {
      set({ selectedRoom: { _id: selectedRoom._id, ...updatedGroup } });
    }
  },
}));
