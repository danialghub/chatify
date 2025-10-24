import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";
import { useRoomStore } from "./useRoomStore";

export const useRequestStore = create((set, get) => ({
    isRequestLoading: false,
    isSendingLoading: null,
    searchedRooms: null,
    allRequests: [],
    errors: null,
    getSeachedRooms: async (name) => {
        try {
            set({ isRequestLoading: true, errors: null })
            const { data } = await axiosInstance.get('/requests', {
                params: { name }
            })
            set({ searchedRooms: data })
        } catch (error) {
            set({ errors: error.response?.data?.message || "", searchedRooms: [] })
        } finally {
            set({ isRequestLoading: false })
        }
    },
    sendRequest: async (to) => {
        try {
            set({ isSendingLoading: to })
            const { data } = await axiosInstance.post(`/requests/send/${to}`)

            toast.success(data.message)
        } catch (error) {
            toast.error(error.response?.data?.message || "Error")
        } finally {
            set({ isSendingLoading: null })
        }
    },
    getRequests: async () => {
        try {
            const { data } = await axiosInstance.get('/requests/get')
            set({ allRequests: data })

        } catch (error) {
            set({ allRequests: [] })

        }
    },
    responseToRequest: async (requestId, status) => {

        set(({ allRequests }) => (
            { allRequests: allRequests.filter(req => req._id !== requestId) }
        ))

        try {
            const { data } = await axiosInstance.post(`/requests/response/${requestId}`, { status })
            useRoomStore.setState(prev => ({
                allPrivateChat: [...prev.allPrivateChat, data.privateRoom]
            }))

            toast.success(data.message)
        } catch (error) {
            console.log(error.response?.data?.message || "Error")
        }
    },
    addToRequests: (newRequest) => {
        const { isSoundEnabled } = useChatStore.getState()

        const currentRequests = get().allRequests || []
        set({ allRequests: [...currentRequests, newRequest] })
        toast.success(` داری ${newRequest.from.name} یک درخواست دوستی از سمت `)

        if (isSoundEnabled) {
            const notificationSound = new Audio("/sounds/notification.mp3");

            notificationSound.currentTime = 0; // reset to start
            notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
    },

}))