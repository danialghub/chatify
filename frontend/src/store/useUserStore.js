import { create } from 'zustand'
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
    isSearching: false,
    foundUsers: null,

    getSeachedUsers: async (text) => {
        try {
            set({ isSearching: true })
            const { data } = await axiosInstance.get('/user/all', { params: {text} })
            set({ foundUsers: data })

        } catch (error) {
            toast.error(error?.response?.data.message || error.message)
        } finally {
            set({ isSearching: false })
        }
    }
}))

