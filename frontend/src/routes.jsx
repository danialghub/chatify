import { useRoutes, Navigate } from "react-router"
import { useAuthStore } from "./store/useAuthStore";

import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";


const routes = () => {
    const { authUser } = useAuthStore();
    
    const routes = useRoutes([
        {
            path: "/",
            element: authUser ? <ChatPage /> : <Navigate to={"/login"} />
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