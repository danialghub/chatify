import { useRoutes, Navigate } from "react-router"
import { useAuthStore } from "@/store/useAuthStore";

import ChatPage from "@/pages/ChatPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import EditProfile from "@/pages/EditProfile";


const routes = () => {
    const { authUser } = useAuthStore();

    const routes = useRoutes([
        {
            path: "/",
            element: authUser ? <ChatPage /> : <Navigate to={"/login"} />
        },
       
        {
            path: "/edit",
            element: authUser ? <EditProfile /> : <Navigate to={"/login"} />
        },
        {
            path: "/login",
            element: !authUser ? <LoginPage /> : <Navigate to={"/"} />
        },
        {
            path: "/signup",
            element: !authUser ? <SignUpPage /> : <Navigate to={"/"} />
        },

    ])


    return routes
}

export default routes