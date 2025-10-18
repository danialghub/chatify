import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useRoomtStore = create((set, get) => ({
    allPrivateChat: [],
    allGroupChat: [],
    selectedRoom: null,
    isRoomsLoading: false,
    isCreatingLoading: false,

    setSelectedRoom: (selectedRoom) => {
        const { joinNewRoom } = get()
        set({ selectedRoom });
        if (selectedRoom)
            joinNewRoom()

    },
    getPrivateChats: async () => {
        set({ isRoomsLoading: true });
        try {
            const { data } = await axiosInstance.get("/room/private-chats");
            set({ allPrivateChat: data });

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
            set({ allGroupChat: data });
        } catch (error) {
            console.log(error.response?.data?.message || "no group")

        } finally {
            set({ isRoomsLoading: false });
        }
    },
    createGroup: async (memberIds, groupName) => {
        try {
            set({ isCreatingLoading: true })
            const { data } = await axiosInstance.post("/room/group", { memberIds, groupName });
            const currentGroups = get().allGroupChat;
            set({ allGroupChat: [...currentGroups, data?.group] });
            toast.success(data.message)
        } catch (error) {
            console.log(error.response?.data?.message || "Failed to create group");
        } finally {
            set({ isCreatingLoading: false })
        }
    },
    joinNewRoom: () => {
        const { socket } = useAuthStore.getState();
        const { selectedRoom } = get();

        if (!selectedRoom?._id) return;
        socket.emit("join-room", selectedRoom._id);
    },
    leaveRoom: () => {
        const { socket } = useAuthStore.getState();
        const { selectedRoom } = get();
        if (!socket?.connected || !selectedRoom?._id) return;
        socket.emit("leave-room", selectedRoom._id);
        get().setSelectedRoom(null)
    },
    subscribeToNewRoom: () => {
        const { socket } = useAuthStore.getState();


        socket.on('newRoom', (room) => {
            console.log('frontend');
            if (room.type === "private") {
                console.log(room.type);
                set((state) => ({
                    allPrivateChat: [...state.allPrivateChat, room],
                }));
            } else {
                set((state) => ({
                    allGroupChat: [...state.allGroupChat, room],
                }));
            }
        })
    },
    unSubscribeToNewRoom: () => {
        const { socket } = useAuthStore.getState();
        socket.off('newRoom')
    },


}))