import { axiosInstance } from '../lib/axios'

export const authService = {

    checkAuth: async () => {
        const { data } = await axiosInstance.get("/auth/check")
        return data
    },
    signUp: async (authData) => {
        const { data } = await axiosInstance.post("/auth/signup", authData);
        return data
    },
    login: async (authData) => {
        const { data } = await axiosInstance.post("/auth/login", authData);
        return data
    },
    logout: async () => {
        await axiosInstance.post("/auth/logout");
    },
    updateProfile : async (profileData)=>{
        const {data} = await axiosInstance.put("/auth/update-profile", profileData);
        return data
    }
}
