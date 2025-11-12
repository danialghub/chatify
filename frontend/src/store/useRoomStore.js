import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { axiosInstance } from "../lib/axios";

export const useRoomStore = create((set, get) => ({
    groupRooms: [],
    privateRooms: [],
    unSeenMessages: {},
    selectedRoom: null,
    isRoomsLoading: false,
    isCreatingLoading: null,
    isRemovingLoading: null,
    isJoining: false,
    activeTab: "chats",

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedRoom: async (newRoom) => {
        const { joinNewRoomSocket, leaveRoomSocket, selectedRoom } = get();

        // اگر همون اتاق رو دوباره انتخاب کرده، هیچ کاری نکن
        if (selectedRoom?._id === newRoom?._id) return;

        // اول از اتاق قبلی خارج شو
        if (selectedRoom?._id) await leaveRoomSocket();
        // بعد اتاق جدید رو ست کن
        set({ selectedRoom: newRoom });

        // سپس به اتاق جدید بپیوند
        if (newRoom?._id) joinNewRoomSocket();

    },
    //apis
    getRooms: async ({ isGroup }) => {
        const roomType = isGroup ? "groupRooms" : "privateRooms"
        set({ isRoomsLoading: true });
        try {
            const { data } = await axiosInstance.get("/room/all", { params: { isGroup } });
            set({ [roomType]: data.rooms, unSeenMessages: data.unSeenMessages });

        } catch (error) {
            console.log(error.response?.data?.message || "no chat");
        } finally {
            set({ isRoomsLoading: false });
        }
    },
    createRoom: async (body, isChattingWith) => {
        const { setModalType } = useChatStore.getState()
        const roomType = body.isGroup ? "groupRooms" : "privateRooms"

        try {

            set({ isCreatingLoading: isChattingWith })
            const { data } = await axiosInstance.post("/room/create", { ...body });

            const isGroup = data?.newRoom?.isGroup || data?.room?.isGroup

            set(prev => {
                const payload = {
                    selectedRoom: data?.newRoom || data.room,
                    activeTab: isGroup ? "groups" : "chats"
                }
                if (data?.newRoom)
                    payload[roomType] = [data.newRoom, ...prev[roomType]]

                return payload;
            })

            setModalType(null)
            if (data?.message) {
                toast.success(data?.message)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
        } finally {
            set({ isCreatingLoading: false })
        }
    },
    removeRoom: async (room) => {
        const { setModalType } = useChatStore.getState()
        const { setSelectedRoom } = get()
        const roomType = room.isGroup ? "groupRooms" : "privateRooms"

        try {
            set({ isRemovingLoading: true })
            setModalType(null)
            const { data } = await axiosInstance.delete(`/room/remove/${room._id}`);
            set((prev) => ({
                [roomType]: prev[roomType].filter(r => r._id !== room._id),
            }));
            setSelectedRoom(null)
            toast.success(data.message);
        } catch (error) {
            console.log(error.response?.data?.message);
        } finally {
            set({ isRemovingLoading: null })
        }
    },
    leaveingTheGroup: async (roomId) => {
        const { setSelectedRoom } = get()
        const { setModalType } = useChatStore.getState()
        setModalType(null)

        try {
            const { data } = await axiosInstance.put(`/room/leave/${roomId}`)
            set(({ groupRooms }) => ({ groupRooms: groupRooms.filter(g => g._id !== roomId) }))
            setSelectedRoom(null)
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data.message || "Internal Error")
        }
    },
    updateGroup: async (body, roomId) => {
        const { setModalType } = useChatStore.getState()

        try {
            set({ isUpdatingLoading: true })
            const { data } = await axiosInstance.put(`/room/update/${roomId}`, { ...body });
            setModalType(null)
            if (data?.message) {
                toast.success(data?.message)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
        } finally {
            set({ isUpdatingLoading: false })
        }
    },
    addMembers: async (memberIds, roomId) => {
        const { setModalType } = useChatStore.getState()
        try {
            set({ isJoining: true })

            const { data } = await axiosInstance.put(`/room/addmember/${roomId}`, { memberIds })
            setModalType(null)
            toast.success(data.message)
        } catch (error) {
            console.log(error.response?.data?.message || "error in add members");
        } finally {
            set({ isJoining: false })
        }
    },
    //socket configs
    joinNewRoomSocket: () => {
        const { socket } = useAuthStore.getState();
        const { selectedRoom } = get();

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
        set({
            selectedRoom: null,
        });
        useChatStore.getState().setReplyToMsg(null)

    },
    //socket listeners
    addToRooms: (newRoom) => {
        const roomType = newRoom.isGroup ? "groupRooms" : "privateRooms"
        set((prev) => {
            if (prev[roomType].some(r => r._id === newRoom._id)) return state;
            return { [roomType]: [newRoom, ...prev[roomType]] };
        })
    },
    removeFromRooms: (room) => {

        const { setSelectedRoom, selectedRoom } = get()
        const roomType = room.isGroup ? "groupRooms" : "privateRooms"
        set(prev => (
            {
                [roomType]: prev[roomType].filter(r => r._id !== room._id),
            }
        ))
        if (room._id === selectedRoom._id) {
            setSelectedRoom(null)
        }
    },
    updateRoomStates: (newMessage) => {
        const { isSoundEnabled } = useChatStore.getState();
console.log(newMessage);


        set(prev => {
            const roomType = newMessage.roomId.isGroup ? "groupRooms" : "privateRooms"
            const chats = prev[roomType];
            const unSeenMessages = prev.unSeenMessages;
            const newDate = newMessage.createddAt;
            const isFromSys = newMessage.system
            const targetChat = chats.find(chat => chat._id === newMessage.roomId._id);

            if (!targetChat) return prev;

            const isCurrentRoomOpen = prev.selectedRoom?._id === newMessage.roomId._id;

            // چت به‌روز‌شده را در ابتدای آرایه می‌گذاریم
            const updatedChats = [
                { ...targetChat, updatedAt: newDate, lastMessage: newMessage },
                ...chats.filter(chat => chat._id !== newMessage.roomId._id)
            ];

            return {
                [roomType]: updatedChats,
                unSeenMessages: {
                    ...unSeenMessages,
                    [newMessage.roomId._id]: isCurrentRoomOpen || isFromSys
                        ? 0
                        : (unSeenMessages[newMessage.roomId._id] || 0) + 1
                }
            };
        });

        //صدای اعلان
        if (isSoundEnabled) {
            const notificationSound = new Audio("/sounds/notification.mp3");
            notificationSound.currentTime = 0; // reset to start
            notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
    },
    updateGroupStates: (updatedGroup) => {
        const { selectedRoom } = get()

        set(({ groupRooms }) => ({
            groupRooms: [updatedGroup, ...groupRooms.filter(g => g._id !== updatedGroup._id)]
        }));

        if (selectedRoom._id === updatedGroup._id) {
            set({ selectedRoom: { _id: selectedRoom._id, ...updatedGroup } })
        }

    }

}))