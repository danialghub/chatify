import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { useRequestStore } from "./useRequestStore";

export const useRoomStore = create((set, get) => ({
    allPrivateChat: [],
    allGroupChat: [],
    unSeenMessages: {},
    selectedRoom: null,
    isRoomsLoading: false,
    isCreatingLoading: false,

    setSelectedRoom: (newRoom) => {
        const { joinNewRoom, leaveRoom, selectedRoom } = get();

        // اگر همون اتاق رو دوباره انتخاب کرده، هیچ کاری نکن
        if (selectedRoom?._id === newRoom?._id) return;

        // اول از اتاق قبلی خارج شو
        if (selectedRoom?._id) leaveRoom();

        // بعد اتاق جدید رو ست کن
        set({ selectedRoom: newRoom });

        // سپس به اتاق جدید بپیوند
        if (newRoom?._id) joinNewRoom();
    },
    getPrivateChats: async () => {
        set({ isRoomsLoading: true });
        try {
            const { data } = await axiosInstance.get("/room/private-chats");
            set({ allPrivateChat: data.privateRooms, unSeenMessages: data.unSeenMessages });

        } catch (error) {
            console.log(error.response?.data?.message || "no private chat");
        } finally {
            set({ isRoomsLoading: false });
        }
    },
    getAllGroups: async () => {
        set({ isRoomsLoading: true });
        try {
            const { data } = await axiosInstance.get("/room/group-chats");
            set({ allGroupChat: data.groupRooms, unSeenMessages: data.unSeenMessages });
        } catch (error) {
            console.log(error.response?.data?.message || "no group")

        } finally {
            set({ isRoomsLoading: false });
        }
    },
    createGroup: async (memberIds, groupName, groupImage) => {
        const { setModalType } = useChatStore.getState()
        try {
            set({ isCreatingLoading: true })
            const { data } = await axiosInstance.post("/room/group", { memberIds, groupName, groupImage });
            const currentGroups = get().allGroupChat;
            set({ allGroupChat: [...currentGroups, data?.group] });
            setModalType(null)
            toast.success(data.message)
        } catch (error) {
            console.log(error.response?.data?.message || "Failed to create group");
        } finally {
            set({ isCreatingLoading: false })
        }
    },
    removeGroupRoom: async (roomId) => {
        // حذف از استیت لوکال
        set((state) => ({
            allGroupChat: state.allGroupChat.filter(room => room._id !== roomId)
        }));

        try {
            const { data } = await axiosInstance.delete(`/room/group-chats/${roomId}`);
            toast.success(data.message);
        } catch (error) {
            console.log(error.response?.data?.message);
        }
    },
    removePrivateRoom: async (otherMember) => {
        // حذف از استیت لوکال
        set((state) => ({
            allPrivateChat: state.allPrivateChat.filter(({ members }) => members.user._id !== otherMember)
        }));
        try {
            const { data } = await axiosInstance.delete(`/room/private-chats/${otherMember}`);
            useRequestStore.setState({ searchedRooms: null })
            toast.success(data.message);
        } catch (error) {
            console.log(error.response?.data?.message);
        }
    },
    joinNewRoom: () => {
        const { socket } = useAuthStore.getState();
        const { selectedRoom } = get();

        set((state) => {
            const copy = { ...state.unSeenMessages };
            delete copy[selectedRoom._id];
            return { unSeenMessages: copy };
        });

        socket.emit("join-room", selectedRoom._id);
    },
    leaveRoom: async () => {
        const { socket } = useAuthStore.getState();
        const { selectedRoom } = get();

        socket.emit("leave-room", selectedRoom._id);

        set({
            selectedRoom: null,
        });
    },
    addToRooms: (newRoom) => {

        const roomType = newRoom.type === "private" ? "allPrivateChat" : "allGroupChat"
        set((state) => {
            if (state[roomType].some(r => r._id === newRoom._id)) return state;
            return { [roomType]: [newRoom, ...state[roomType]] };
        })
    },
    updateRoomStates: (newMessage) => {
        const { isSoundEnabled } = useChatStore.getState();
        let notificationSound = new Audio("/sounds/notification.mp3");

        const chatType = newMessage.roomId.type === "private" ? "allPrivateChat" : "allGroupChat";

        set(prev => {
            const chats = prev[chatType];
            const unSeenMessages = prev.unSeenMessages;
            const newDate = newMessage.createddAt;

            const targetChat = chats.find(chat => chat._id === newMessage.roomId._id);

            if (!targetChat) return prev;

            const isCurrentRoomOpen = prev.selectedRoom?._id === newMessage.roomId._id;

            // چت به‌روز‌شده را در ابتدای آرایه می‌گذاریم
            const updatedChats = [
                { ...targetChat, updatedAt: newDate, lastMessage: newMessage },
                ...chats.filter(chat => chat._id !== newMessage.roomId._id)
            ];

            return {
                [chatType]: updatedChats,
                unSeenMessages: {
                    ...unSeenMessages,
                    [newMessage.roomId._id]: isCurrentRoomOpen
                        ? 0
                        : (unSeenMessages[newMessage.roomId._id] || 0) + 1
                }
            };
        });

        //صدای اعلان
        if (isSoundEnabled) {
            notificationSound.pause();
            notificationSound.currentTime = 0;
            notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }

    }

}))