import { useEffect } from "react"
import { useAuthStore } from '../store/useAuthStore'

const useSocket = (action, callBack) => {

    const { socket } = useAuthStore()

    useEffect(() => {
        if (!socket || !action || !callBack) return

        const handler = data => callBack(data)

        socket.on(action, handler)

        return () => socket.off(action, handler)

    }, [callBack, socket, action])
}
export default useSocket