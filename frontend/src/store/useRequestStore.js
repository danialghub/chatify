import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useRoomtStore } from "./useRoomStore";

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
        const { getPrivateChats } = useRoomtStore.getState()
        set(({ allRequests }) => (
            { allRequests: allRequests.filter(req => req._id !== requestId) }
        ))
        try {
            const { data } = await axiosInstance.post(`/requests/response/${requestId}`, { status })
            getPrivateChats()
            toast.success(data.message)
        } catch (error) {
            console.log(error.response?.data?.message || "Error")
        }
    },
    subscribeToRequests: () => {
        const socket = useAuthStore.getState().socket
        if (!socket) return;

        // جلوگیری از ثبت چندبار listener تکراری
        socket.off('newRequest')

        socket.on('newRequest', (newRequest) => {
            const currentRequests = get().allRequests || []
            set({ allRequests: [...currentRequests, newRequest] })
            toast.success(`📩 یک درخواست دوستی از سمت ${newRequest.from.name} داری`)
        })
    },

    unSubscribeToRequest: () => {
        const socket = useAuthStore.getState().socket
        if (!socket) return;
        socket.off('newRequest')
    },



}))