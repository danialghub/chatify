import { PageLoader } from "./index"
import { useEffect, useRef } from "react";
import { User, Search } from 'lucide-react'
import { useRequestStore } from '../store/useRequestStore'
import { useRoomStore } from "../store/useRoomStore";
import { motion } from 'framer-motion'

const SendRequest = () => {

    const inputRef = useRef()

    const {
        getSeachedRooms,
        isRequestLoading,
        searchedRooms,
        errors,
        sendRequest,
        isSendingLoading

    } = useRequestStore()
    const { removePrivateRoom } = useRoomStore()

    const searchtHandler = (e) => {
        e.preventDefault()
        const input = inputRef.current.value
        if (input.trim()) {
            getSeachedRooms(input)
        }
    }
    useEffect(() => {
        inputRef.current.focus()
    }, [])

    return (


        <div className="flex flex-col items-center justify-center w-full text-white">
            {/* فرم جستجو */}
            <form
                onSubmit={searchtHandler}
                className=" w-[90%] md:w-[70%]  bg-[#282142]/90 backdrop-blur-md rounded-full relative py-2 px-4 flex items-center border border-white/10 shadow-inner"
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1 px-2"
                />
                <button
                    type="submit"
                    className="size-9 bg-indigo-600 hover:bg-indigo-700 transition rounded-full flex items-center justify-center cursor-pointer shadow-md"
                >
                    <Search className="size-5" />
                </button>
            </form>

            {/* لیست کاربران */}
            <div className="mt-6 w-full ">
                {!isRequestLoading ? (
                    searchedRooms ? (
                        searchedRooms.length ? (
                            <div
                                dir="rtl"
                                className="mt-4 h-[50vh] overflow-y-auto custom-scrollbar px-2"

                            >
                                <p className="text-slate-400 py-3 text-sm"> نتیجه جستجو :</p>
                                {searchedRooms.map(user => {

                                    const bgColor = user?.request?.status === "Pending" ? "bg-blue-700/70 hover:bg-blue-700" : user?.request?.status === "Accepted" ? "bg-red-700/70 hover:bg-red-700" : "bg-purple-700/70 hover:bg-purple-700"

                                    const isDisable = isSendingLoading === user._id || user?.request?.status === "Pending"

                                    const requestHandler = () => {
                                        if (user?.request?.status === "Accepted") {
                                            removePrivateRoom(user._id)


                                        } else {
                                            sendRequest(user._id)
                                        }
                                    }

                                    return (
                                        <motion.div
                                            key={user._id}
                                            className="rounded-xl cursor-pointer hover:bg-slate-800/30 flex items-center justify-between p-2 transition"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user?.profilePic || './avatar.png'}
                                                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                    alt=''
                                                />
                                                <span className="text-sm font-medium">{user.name}</span>
                                            </div>
                                            <button
                                                onClick={requestHandler}
                                                className={`px-3 py-2 disabled:bg-gray-700 transition rounded-lg text-sm flex items-center gap-1 ${bgColor}`}
                                                disabled={isDisable}
                                            >
                                                <User className="size-5" />
                                                {isSendingLoading === user._id
                                                    ? <span>در حال ارسال</span>
                                                    : user?.request?.status === "Pending"
                                                        ? <span> در انتظار پاسخ</span>
                                                        : user?.request?.status === "Accepted"
                                                            ? <span> حذف</span>
                                                            : <span> درخواست</span>

                                                }
                                            </button>

                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-[10vh] flex items-center justify-center text-lg text-gray-300">
                                {errors}
                            </div>
                        )
                    ) : (
                        <div className="text-center text-gray-300 py-5 text-md">
                            نام کاربری را جستجو کنید
                        </div>
                    )
                ) : (
                    <div className="h-[50vh] flex items-center justify-center text-lg text-gray-300 animate-pulse">
                        <PageLoader />
                    </div>

                )}
            </div>
        </div >



    )
}

export default SendRequest