export const chatRoomService =
{
    getPrivateChats: async () => {
        const { data } = await axiosInstance.get("/room/private-chats");
        return data
    },
    getAllGroups: async () => {
        const { data } = await axiosInstance.get("/room/group-chats");
        return data
    },
    createGroup: async (groupData) => {
        const { data } = await axiosInstance.post("/room/group", groupData);
        return data
    },


}