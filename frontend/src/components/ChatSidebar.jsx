import { AnimatePresence, motion } from 'framer-motion'
import {
    UserSearchIcon, Users, UserCircle, X,
    Moon, Sun, Settings, LogOut, MessageCircle,
    MoreHorizontal, CheckCheck, Bell, BellOff,
    Search, Filter, PlusCircle, Crown, Shield,
    Volume2, VolumeX, Pin, Trash2, Edit3
} from "lucide-react";
import { ChatIcon, ModalManager } from '@/components/index';
import { useChatStore } from '@/store/useChatStore';
import { Link } from 'react-router';
import { useState, useEffect, useCallback, memo } from 'react';

// کامپوننت وضعیت آنلاین با انیمیشن پالس
const OnlineStatus = ({ isOnline }) => (
    <div className="relative">
        {isOnline && (
            <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-900"
            >
                <motion.span
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500 rounded-full opacity-50"
                />
            </motion.span>
        )}
    </div>
);

// کامپوننت آیتم مکالمه با انیمیشن هوشمند
const ConversationItem = memo(({ chat, isActive, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => onClick(chat.id)}
            className={`
        relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-200 group
        ${isActive
                    ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-400/30'
                    : 'hover:bg-zinc-800/50'
                }
      `}
        >
            {/* Badge اعلان */}
            {chat.unreadCount > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                    <span className="text-[10px] font-bold text-white">{chat.unreadCount}</span>
                </motion.div>
            )}

            {/* آواتار با افکت شیشه‌ای */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-600/50">
                    {chat.avatar ? (
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-white">
                            {chat.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <OnlineStatus isOnline={chat.isOnline} />
            </div>

            {/* اطلاعات مکالمه */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-white truncate">{chat.name}</h3>
                    <span className="text-[10px] text-zinc-500">{chat.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                    {chat.lastMessage.isRead && chat.lastMessage.sender === 'me' && (
                        <CheckCheck size={12} className="text-emerald-400" />
                    )}
                    <p className="text-xs text-zinc-400 truncate flex-1">
                        {chat.lastMessage.preview}
                    </p>
                </div>
            </div>

            {/* آیکون‌های اکشن هاور */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex gap-1"
                    >
                        <button className="p-1.5 rounded-lg hover:bg-zinc-700 transition">
                            <Pin size={14} className="text-zinc-400" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-zinc-700 transition">
                            <MoreHorizontal size={14} className="text-zinc-400" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

// کامپوننت سکشن دسته‌بندی شده
const CategorySection = ({ title, icon: Icon, children }) => (
    <div className="mt-4 first:mt-0">
        <div className="flex items-center gap-2 px-3 py-2">
            <Icon size={16} className="text-emerald-400" />
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</h4>
            <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
        </div>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

// م component اصلی سایدبار
const ChatSidebar = ({ isOpen, onClose, user }) => {
    const { openModal, activeChat, setActiveChat } = useChatStore();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // دیتای دمو برای مکالمات
    const [conversations, setConversations] = useState([
        {
            id: 1,
            name: 'سارا محمدی',
            avatar: null,
            isOnline: true,
            unreadCount: 3,
            time: '15:42',
            lastMessage: {
                preview: 'جلسه ساعت ۳ برگزار میشه؟',
                isRead: false,
                sender: 'them'
            }
        },
        {
            id: 2,
            name: 'تیم توسعه',
            avatar: null,
            isOnline: false,
            unreadCount: 0,
            isGroup: true,
            members: 5,
            time: '14:30',
            lastMessage: {
                preview: 'عالی بود! ممنون از همه',
                isRead: true,
                sender: 'me'
            }
        },
        {
            id: 3,
            name: 'علی رضایی',
            avatar: null,
            isOnline: true,
            unreadCount: 0,
            time: '12:15',
            lastMessage: {
                preview: 'فردا میتونم بیام دفتر',
                isRead: true,
                sender: 'them'
            }
        },
        {
            id: 4,
            name: 'مهدی کریمی',
            avatar: null,
            isOnline: false,
            unreadCount: 1,
            time: '10:22',
            lastMessage: {
                preview: 'لینک رو برام بفرست',
                isRead: false,
                sender: 'them'
            }
        }
    ]);

    // فیلتر کردن بر اساس جستجو و آنلاین
    const filteredConversations = conversations.filter(chat => {
        const matchesSearch = chat.name.includes(searchQuery);
        const matchesOnline = showOnlineOnly ? chat.isOnline : true;
        return matchesSearch && matchesOnline;
    });

    // گروه‌بندی مکالمات
    const pinnedChats = filteredConversations.filter(c => c.isPinned);
    const recentChats = filteredConversations.filter(c => !c.isPinned);

    // انیمیشن‌های پیشرفته برای ورود/خروج
    const sidebarVariants = {
        hidden: {
            x: '-100%',
            opacity: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: {
            x: '-100%',
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    // مدیریت کلیدهای میانبر
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-input')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <>
            <ModalManager />

            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`
              fixed top-0 left-0 h-full w-full md:w-[380px] lg:w-[420px]
              backdrop-blur-xl bg-black/95 md:bg-black/90
              border-r border-white/10 shadow-2xl
              z-50 flex flex-col overflow-hidden
              ${isDarkMode ? 'dark' : ''}
            `}
                    >
                        {/* گرادیانت پس‌زمینه داینامیک */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                        </div>

                        {/* هدر با افکت شیشه‌ای */}
                        <motion.div
                            variants={itemVariants}
                            className="relative backdrop-blur-md bg-white/5 border-b border-white/10"
                        >
                            <div className="flex items-center gap-3 p-4">
                                {/* آواتار با انیمیشن چرخش */}
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-0.5">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                            {user?.profilePic ? (
                                                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-white">
                                                    {user?.name?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <OnlineStatus isOnline={true} />
                                </motion.div>

                                {/* اطلاعات کاربر */}
                                <div className="flex-1">
                                    <h2 className="font-bold text-white text-lg leading-tight">
                                        {user?.name || "کاربر مهمان"}
                                    </h2>
                                    <p className="text-xs text-emerald-400 font-mono">
                                        @{user?.userName || "guest_user"}
                                    </p>
                                </div>

                                {/* دکمه اکشن هدر */}
                                <div className="flex gap-1">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsDarkMode(!isDarkMode)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition"
                                    >
                                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* بخش سرچ پیشرفته */}
                            <div className="px-4 pb-4">
                                <div className={`
                  relative transition-all duration-300
                  ${isSearchFocused ? 'scale-105' : 'scale-100'}
                `}>
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        id="search-input"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                        placeholder="جستجو... (Ctrl+K)"
                                        className="w-full bg-white/10 rounded-xl py-2.5 pr-10 pl-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <X size={14} className="text-zinc-500 hover:text-white" />
                                        </button>
                                    )}
                                </div>

                                {/* فیلترهای سریع */}
                                <div className="flex gap-2 mt-3">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                                        className={`
                      flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition
                      ${showOnlineOnly
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                                                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            }
                    `}
                                    >
                                        <UserCircle size={14} />
                                        آنلاین‌ها
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-zinc-400 hover:bg-white/10 transition"
                                    >
                                        <Filter size={14} />
                                        فیلتر
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 transition"
                                    >
                                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        {/* لیست مکالمات با اسکرول سفارشی */}
                        <motion.div
                            variants={itemVariants}
                            className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3"
                        >
                            {filteredConversations.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <MessageCircle size={48} className="text-zinc-600 mb-3" />
                                    <p className="text-zinc-500">هیچ مکالمه‌ای یافت نشد</p>
                                    <button
                                        onClick={() => openModal("SearchingRooms", { title: "شروع چت جدید" })}
                                        className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition"
                                    >
                                        شروع مکالمه جدید
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    {pinnedChats.length > 0 && (
                                        <CategorySection title="پین شده‌ها" icon={Pin}>
                                            {pinnedChats.map(chat => (
                                                <ConversationItem
                                                    key={chat.id}
                                                    chat={chat}
                                                    isActive={activeChat?.id === chat.id}
                                                    onClick={() => setActiveChat(chat)}
                                                />
                                            ))}
                                        </CategorySection>
                                    )}

                                    <CategorySection title="اخیراً" icon={MessageCircle}>
                                        {recentChats.map(chat => (
                                            <ConversationItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={activeChat?.id === chat.id}
                                                onClick={() => setActiveChat(chat)}
                                            />
                                        ))}
                                    </CategorySection>
                                </>
                            )}
                        </motion.div>

                        {/* منوی سریع با انیمیشن گرادیانت */}
                        <motion.div
                            variants={itemVariants}
                            className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm"
                        >
                            <div className="grid grid-cols-3 gap-2 p-3">
                                <motion.button
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openModal("SearchingRooms", { title: "جستجو کاربر" })}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition group"
                                >
                                    <div className="p-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/30 transition">
                                        <UserSearchIcon size={18} className="text-emerald-400" />
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-400">جستجو</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openModal("GroupCreate", { title: "ایجاد گروه", state: "create" })}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition group"
                                >
                                    <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition">
                                        <Users size={18} className="text-blue-400" />
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-400">گروه جدید</span>
                                </motion.button>

                                <Link
                                    to='/edit'
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition group"
                                >
                                    <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition">
                                        <UserCircle size={18} className="text-purple-400" />
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-400">پروفایل</span>
                                </Link>
                            </div>

                            {/* فوتر با تنظیمات و خروج */}
                            <div className="flex items-center justify-between p-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ rotate: 90 }}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Settings size={16} className="text-zinc-500" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ rotate: 90 }}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Bell size={16} className="text-zinc-500" />
                                    </motion.button>
                                </div>

                                <div className="text-[10px] text-zinc-600 font-mono">
                                    v2.0.0-beta
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition group"
                                >
                                    <LogOut size={16} className="text-red-400/70 group-hover:text-red-400" />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* استایل اسکرول سفارشی */}
                        <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            `}</style>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* اورلی برای بستن سایدبار در موبایل */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default memo(ChatSidebar);






// import { AnimatePresence, motion } from 'framer-motion'
// import { UserSearchIcon, Users, UserCircle, X } from "lucide-react";
// import { ChatIcon, ModalManager } from '@/components/index';
// import { useChatStore } from '@/store/useChatStore';
// import { Link } from 'react-router'
// const ChatSidebar = ({ isOpen, onClose, user }) => {

//     const { openModal } = useChatStore()

//     return (
//         <>
//             <ModalManager />

//             <AnimatePresence mode='wait'>

//                 {isOpen && (
//                     <motion.div
//                         initial={{ x: "-100%" }}
//                         animate={{ x: 0 }}
//                         exit={{ x: "-100%" }}
//                         transition={{ duration: 0.3, ease: "easeInOut" }}
//                         className="absolute top-0 left-0 h-full w-full  md:w-1/3 bg-zinc-900 text-white shadow-2xl z-30 flex flex-col  "
//                     >

//                         {/* Header */}
//                         <div className="relative flex items-center gap-3 p-4 border-b border-zinc-700">
//                             <ChatIcon
//                                 profile={user.profilePic}
//                                 name={user.name}
//                             />
//                             <div className="flex flex-col">
//                                 <p className="font-semibold text-lg">{user?.name || "کاربر مهمان"}</p>
//                                 <p className="text-sm text-zinc-400">{user.userName || "guest"}</p>
//                             </div>

//                             {/* Close button */}
//                             <button
//                                 onClick={onClose}
//                                 className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-800 transition"
//                             >
//                                 <X size={20} className="text-zinc-300 hover:text-white transition" />
//                             </button>
//                         </div>

//                         {/* Menu */}
//                         <div className="flex flex-col p-3 space-y-2">
//                             <button
//                                 onClick={() =>
//                                     openModal("SearchingRooms", { title: "جستجو کاربر" })
//                                 }
//                                 className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition">
//                                 <UserSearchIcon size={22} />
//                                 <span className="text-base font-medium">جستجو مخاطب یا گروه</span>
//                             </button>

//                             <button
//                                 onClick={() =>
//                                     openModal("GroupCreate", { title: "ایجاد گروه", state: "create" })
//                                 }
//                                 className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition">
//                                 <Users size={22} />
//                                 <span className="text-base font-medium"> گروه جدید</span>
//                             </button>

//                             <Link
//                                 to='/edit'
//                                 className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition">
//                                 <UserCircle size={22} />
//                                 <span className="text-base font-medium"> پروفایل من</span>
//                             </Link>
//                         </div>

//                         {/* Footer */}
//                         <div className="mt-auto p-4 py-5 text-center text-xs text-zinc-500 border-t border-zinc-700 relative">
//                             <span>نسخه ۱.۰.۰</span>
//                         </div>

//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </>
//     )
// }

// export default ChatSidebar