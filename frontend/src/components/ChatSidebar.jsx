import { AnimatePresence, motion } from 'framer-motion'
import { UserSearchIcon, Users, UserCircle, X } from "lucide-react";
import useModal from '../hooks/useModal'
import {SendRequestModal} from './index';
const ChatSidebar = ({ isOpen, onClose, user }) => {

    const [isRequestModalShown, toggleRequestModal] = useModal()

    return (
        <AnimatePresence>
         
            {isOpen && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute top-0 left-0 h-full w-full  md:w-1/3 bg-zinc-900 text-white shadow-2xl z-30 flex flex-col  overflow-hidden"
                >
   <SendRequestModal
                isOpen={isRequestModalShown}
                onClose={toggleRequestModal}
            />
                    {/* Header */}
                    <div className="relative flex items-center gap-3 p-4 border-b border-zinc-700">
                        <img
                            src={user?.profilePic || "/avatar.png"}
                            alt="user avatar"
                            className="w-12 h-12 rounded-full border border-zinc-600"
                        />
                        <div className="flex flex-col">
                            <p className="font-semibold text-lg">{user?.name || "کاربر مهمان"}</p>
                            <p className="text-sm text-zinc-400">@{user?.bio || "guest"}</p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-800 transition"
                        >
                            <X size={20} className="text-zinc-300 hover:text-white transition" />
                        </button>
                    </div>

                    {/* Menu */}
                    <div className="flex flex-col p-3 space-y-2">
                        <button
                            onClick={toggleRequestModal}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition">
                            <UserSearchIcon size={22} />
                            <span className="text-base font-medium">جستجو مخاطب یا گروه</span>
                        </button>
                        <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition">
                            <Users size={22} />
                            <span className="text-base font-medium"> گروه جدید</span>
                        </button>

                        <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition">
                            <UserCircle size={22} />
                            <span className="text-base font-medium"> پروفایل من</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto p-4 text-center text-xs text-zinc-500 border-t border-zinc-700">
                        نسخه ۱.۰.۰
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ChatSidebar