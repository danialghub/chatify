import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { axiosInstance } from "../lib/axios";

export const useRoomStore = create((set, get) => ({
    //states
    groupRooms: [],
    privateRooms: [],
    unSeenMessages: {},
    selectedRoom: null,
    isRoomsLoading: false,
    isCreatingLoading: null,
    isRemovingLoading: false,
    isJoining: false,
    isLeaving: false,
    activeTab: "chats",

    //state setters
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
        const { openModal } = useChatStore.getState()
        const isGroup = body.get('isGroup')
        const roomType = isGroup ? "groupRooms" : "privateRooms"

        try {

            set({ isCreatingLoading: isChattingWith })
            const { data } = await axiosInstance.post("/room/create",
                body,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
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

            openModal(null)
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
        const { openModal } = useChatStore.getState()
        const { setSelectedRoom } = get()
        const roomType = room.isGroup ? "groupRooms" : "privateRooms"

        try {
            set({ isRemovingLoading: true })

            const { data } = await axiosInstance.delete(`/room/remove/${room._id}`);
            set((prev) => ({
                [roomType]: prev[roomType].filter(r => r._id !== room._id),
            }));
            openModal(null)
            setSelectedRoom(null)
            toast.success(data.message);
        } catch (error) {
            console.log(error.response?.data?.message);
        } finally {
            set({ isRemovingLoading: false })
        }
    },
    leaveingTheGroup: async (roomId) => {
        const { setSelectedRoom } = get()
        const { openModal } = useChatStore.getState()

        try {
            set({ isLeaving: true })
            const { data } = await axiosInstance.put(`/room/leave/${roomId}`)
            set(({ groupRooms }) => ({ groupRooms: groupRooms.filter(g => g._id !== roomId) }))
            setSelectedRoom(null)
            toast.success(data.message)
            openModal(null)
        } catch (error) {
            toast.error(error?.response?.data.message || "Internal Error")
        } finally {
            set({ isLeaving: false })
        }
    },
    updateGroup: async (body, roomId) => {
        const { openModal } = useChatStore.getState()

        try {
            set({ isUpdatingLoading: true })
            const { data } = await axiosInstance.put(`/room/update/${roomId}`,
                body,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            openModal(null)
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
        const { openModal } = useChatStore.getState()
        try {
            set({ isJoining: true })

            const { data } = await axiosInstance.put(`/room/addmember/${roomId}`, { memberIds })
            openModal(null)
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
    updateRoomStates: ({ message, actionType = "new", prevMsg }) => {
        const { isSoundEnabled } = useChatStore.getState();

        if (!message) return
        set((prev) => {
            const roomType = message.roomId.isGroup ? "groupRooms" : "privateRooms";
            const chats = [...(prev[roomType] || [])];
            const chatIndex = chats.findIndex(c => c._id === message.roomId._id);
            if (chatIndex === -1) return prev;

            const chat = { ...chats[chatIndex] };
            const unSeenMessages = { ...prev.unSeenMessages };
            const seenMessageIds = new Set(prev.seenMessageIds);

            // Delete logic
            if (actionType === "delete" && chat.lastMessage?._id === message._id) {
                chat.lastMessage = prevMsg || null;
                chat.updatedAt = chat.lastMessage?.createddAt || chat.updatedAt;
                chats[chatIndex] = chat;
                unSeenMessages[message.roomId._id] = (unSeenMessages[message.roomId._id] || 0) - 1;
                seenMessageIds.add(message._id);
                return { ...prev, [roomType]: chats, unSeenMessages, seenMessageIds };
            }

            // Seen counter (only for new messages, not edits)
            if (actionType === "new" && !seenMessageIds.has(message._id)) {
                const isSelected = prev.selectedRoom?._id === message.roomId._id;
                unSeenMessages[message.roomId._id] = (isSelected || message.system) ? 0 : (unSeenMessages[message.roomId._id] || 0) + 1;
                seenMessageIds.add(message._id);
            }

            // Update last message
            const isEditingLast = actionType === "edit" && chat.lastMessage?._id === message._id;
            if (actionType === "new" || isEditingLast) {
                chat.previousLastMessage = actionType === "new" ? chat.lastMessage : chat.previousLastMessage;
                chat.lastMessage = message;
                chat.updatedAt = message.createddAt;
            }

            chats[chatIndex] = chat;
            return { ...prev, [roomType]: chats, unSeenMessages, seenMessageIds };
        });

        // Play sound for new messages only
        if (actionType === "new" && isSoundEnabled) {
            new Audio("/sounds/notification.mp3").play().catch(() => { });
        }
    },
    updateGroupStates: (updatedGroup) => {
        const { selectedRoom, groupRooms, setSelectedRoom } = get();
        const { authUser } = useAuthStore.getState()

        const isUserKickedOut =
            groupRooms.some(g => g._id === updatedGroup._id) &&
            !updatedGroup.members.some(mem => mem._id === authUser._id)

        if (isUserKickedOut) {
            set(({ groupRooms }) => ({
                groupRooms: groupRooms.filter((g) => g._id !== updatedGroup._id)
            }));
            if (selectedRoom?._id === updatedGroup?._id) {
                setSelectedRoom(null)
                toast.error(`بیرون انداخته شدید ${updatedGroup.name} شما از گروه`)
            }

        } else {
            set(({ groupRooms }) => ({
                groupRooms: [updatedGroup, ...groupRooms.filter((g) => g._id !== updatedGroup._id)]
            }));
            if (selectedRoom?._id === updatedGroup?._id) {
                set({ selectedRoom: { ...updatedGroup, _id: selectedRoom._id || null } });
            }
        }


    },

}))