import { Modal, PageLoader } from "../index"
import { useEffect, useRef } from "react";
import { UserSearch, Search } from 'lucide-react'
import { useRequestStore } from '../../store/useRequestStore'


const SendRequestModal = ({ isOpen, onClose }) => {

    const inputRef = useRef()

    const {
        getSeachedRooms,
        isRequestLoading,
        searchedRooms,
        errors,
        sendRequest,
        isSendingLoading

    } = useRequestStore()

    const requestHandler = (e) => {
        e.preventDefault()
        const input = inputRef.current.value
        if (input.trim()) {
            getSeachedRooms(input)
        }
    }
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current.focus()
            }, 50);
        }
    }, [isOpen])
    return (

        <Modal isOpen={isOpen} onClose={onClose} title="جستجوی کاربر یا گروه">

            <div className="flex flex-col items-center justify-center w-full text-white">
                {/* فرم جستجو */}
                <form
                    onSubmit={requestHandler}
                    className="bg-[#282142]/90 backdrop-blur-md rounded-full relative py-2 px-4  w-[90%] md:w-[70%] flex items-center border border-white/10 shadow-inner"

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
                                    {searchedRooms.map((user, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl cursor-pointer hover:bg-slate-800/30 flex items-center justify-between p-2 transition"
                                            whileHover={{ scale: 1.02 }}
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
                                                onClick={() => sendRequest(user._id)}
                                                title="درخواست دوستی"
                                                className="px-3 py-2 bg-purple-700/70 hover:bg-purple-700 disabled:bg-gray-700 transition rounded-lg text-sm flex items-center gap-1"
                                                disabled={isSendingLoading === user._id}
                                            >
                                                <UserSearch className="size-5" />
                                                {isSendingLoading === user._id
                                                    ? <span>در حال ارسال</span>
                                                    : <span> ارسال</span>
                                                }
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[10vh] flex items-center justify-center text-lg text-gray-300">
                                    {errors}
                                </div>
                            )
                        ) : (
                            <div className="text-center text-gray-300 py-5 text-md">
                                نام کاربر یا گروهی را جستجو کنید
                            </div>
                        )
                    ) : (
                        <div className="h-[50vh] flex items-center justify-center text-lg text-gray-300 animate-pulse">
                            <PageLoader />
                        </div>

                    )}
                </div>
            </div>


        </Modal>
    )
}

export default SendRequestModal