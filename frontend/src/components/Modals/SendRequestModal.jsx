import {Modal} from "../index"
import { motion } from 'framer-motion';
import { useState } from "react";
import { UserSearch, Search } from 'lucide-react'

const SendRequestModal = ({ loading, searchedUsers, isOpen, onClose, searchUsersHandler }) => {
    const [input, setInput] = useState('')
    return (

        <Modal isOpen={isOpen} onClose={onClose} title="ارسال درخواست دوستی">
            <div className="flex flex-col items-center justify-center w-full text-white">
                {/* فرم جستجو */}
                <motion.form
                    onSubmit={searchUsersHandler}
                    className="bg-[#282142]/90 backdrop-blur-md rounded-full relative py-2 px-4 mt-6 w-[90%] md:w-[70%] flex items-center border border-white/10 shadow-inner"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        type="text"
                        placeholder="Search User..."
                        className="bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1 px-2"
                    />
                    <button
                        type="submit"
                        className="size-9 bg-indigo-600 hover:bg-indigo-700 transition rounded-full flex items-center justify-center cursor-pointer shadow-md"
                    >
                        <Search className="size-5"/>
                    </button>
                </motion.form>

                {/* لیست کاربران */}
                <div className="mt-6 w-full px-4">
                    {!loading ? (
                        searchedUsers ? (
                            searchedUsers.length ? (
                                <motion.div
                                    dir="rtl"
                                    className="mt-4 h-[50vh] overflow-y-auto custom-scrollbar px-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {searchedUsers.map((user, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="rounded-xl cursor-pointer hover:bg-slate-800/30 flex items-center justify-between p-2 transition"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.profilePic || assets.avatar_icon}
                                                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                    alt="avatar"
                                                />
                                                <span className="text-sm font-medium">{user.fullName}</span>
                                            </div>
                                            <button
                                                onClick={() => sendRequest(user._id)}
                                                title="درخواست دوستی"
                                                className="px-3 py-2 bg-purple-700/70 hover:bg-purple-700 transition rounded-lg text-sm flex items-center gap-1"
                                            >
                                                <UserSearch className="size-5" />
                                                <span>ارسال</span>
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="h-[50vh] flex items-center justify-center text-lg text-gray-300">
                                    {error || 'کاربری یافت نشد'}
                                </div>
                            )
                        ) : (
                            <div className="text-center text-gray-300 py-10 text-md">
                                نام دوست خود را جهت درخواست جستجو کنید
                            </div>
                        )
                    ) : (
                        <div className="h-[50vh] flex items-center justify-center text-lg text-gray-300 animate-pulse">
                            Loading...
                        </div>
                    )}
                </div>
            </div>

            {/* استایل اسکرول زیبا */}
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 80, 255, 0.3);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 80, 255, 0.6);
        }
      `}</style>

        </Modal>
    )
}

export default SendRequestModal