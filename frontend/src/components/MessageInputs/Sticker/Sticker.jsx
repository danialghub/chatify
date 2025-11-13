import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import StickerPanel from './StikerPanel'
const Sticker = ({ tab, setTab, open, setOpen, setText, inputContainerRef }) => {

    const panelRef = useRef(null);
    const [query, setQuery] = useState('')
    const EMOJIS = [
        '😂', '😔', '🙂', '❤️', '😘', '😳', '😍', '👍', '😊',
        '😱', '😁', '😃', '😭', '💋', '🤮', '😒', '😜', '🙈', '😉',
        '😢', '😡', '😌', '😴', '🤩', '😆', '🤨', '😅', '🤡', '🤪'
    ];
    const stikers =
        [
            { name: "hi", url: "/Stickers/Hi.tgs", emoji: "👋" },
            { name: "cowboy", url: "/Stickers/cowboy.tgs", emoji: "😎" },
            { name: "fuck", url: "/Stickers/diggy_fuck.tgs", emoji: "🖕" },
            { name: "smart", url: "/Stickers/gamee_smart.tgs", emoji: "🤓" },
            { name: "love", url: "/Stickers/kangaroo_love.tgs", emoji: "❤️" },
            { name: "money", url: "/Stickers/kangaroo_money.tgs", emoji: "🤙" },
            { name: "cool", url: "/Stickers/Robot_cool.tgs", emoji: "😎" },
            { name: "fuck", url: "/Stickers/Robot_fuck.tgs", emoji: "🖕" },
        ]

    const filteredEmojis = EMOJIS.filter((e) =>
        query.trim() ? e.includes(query) : true
    );
    const filteredStickers = stikers.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
    );


    useEffect(() => {
        function handleClickOutside(e) {
            const panelEl = panelRef.current;
            const inputContainerEl = inputContainerRef?.current;

            if (
                panelEl &&
                !panelEl.contains(e.target) &&
                !inputContainerEl.contains(e.target)
            ) {
                setOpen(false);
            }
        }


        if (open) document.addEventListener('mousedown', handleClickOutside);
        else document.removeEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1, transition: { duration: 0.25 } },
        exit: (direction) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            transition: { duration: 0.25 },
        }),
    };

    const [direction, setDirection] = useState(0);

    const switchTab = (newTab, dir = 0) => {
        if (newTab !== tab) {
            setDirection(dir);
            setTab(newTab);
        }
    };

    // هندل سوایپ لمسی
    const handleDragEnd = (event, info) => {
        const offsetX = info.offset.x;
        if (tab === 'emoji' && offsetX < -30) {
            // ایموجی → سوایپ چپ → استیکر
            switchTab('sticker', 1);
        } else if (tab === 'sticker' && offsetX > 30) {
            // استیکر → سوایپ راست → ایموجی
            switchTab('emoji', -1);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={panelRef}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative bottom-0 w-full bg-gray-800 border-t border-gray-600 shadow-2xl z-40 overflow-hidden"
                >
                    {/* Header Tabs */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800">
                        <div className="relative flex items-center bg-gray-700 p-1 rounded-full shadow-sm border border-gray-600 backdrop-blur-md">
                            <button
                                onClick={() => switchTab("emoji", -1)}
                                className={`relative flex-1 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 
                ${tab === "emoji"
                                        ? "bg-gray-600 text-white shadow-md"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                                    }`}
                            >
                                Emoji
                                {tab === "emoji" && (
                                    <span className="absolute inset-0 rounded-full ring-2 ring-blue-400/30"></span>
                                )}
                            </button>

                            <button
                                onClick={() => switchTab("sticker", 1)}
                                className={`relative flex-1 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 
                ${tab === "sticker"
                                        ? "bg-gray-600 text-white shadow-md"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                                    }`}
                            >
                                Stickers
                                {tab === "sticker" && (
                                    <span className="absolute inset-0 rounded-full ring-2 ring-blue-400/30"></span>
                                )}
                            </button>
                        </div>

                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={tab === "emoji" ? "Search emoji..." : "Search sticker..."}
                            className="text-sm px-2 py-2 bg-gray-700 text-white border border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-400 w-full mx-5"
                        />
                    </div>

                    {/* Body با drag */}
                    <div className="relative h-60 overflow-hidden">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={tab}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute w-full h-full top-0 left-0 p-3 overflow-y-auto"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                            >
                                {tab === "emoji" ? filteredEmojis.length ? (
                                    <div className="grid grid-cols-12 sm:grid-cols-22 gap-3">
                                        {filteredEmojis.map((emo, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setText((m) => m + emo)}
                                                className="p-2 rounded-lg hover:bg-gray-600 text-2xl sm:text-4xl flex items-center justify-center"
                                            >
                                                {emo}
                                            </button>
                                        ))
                                        }
                                    </div>
                                ) : <div className="text-white text-lg text-center w-full py-8">😅 هیچ ایموجی وجود ندارد</div>
                                    : (
                                        <StickerPanel stickers={filteredStickers} setOpen={setOpen} />
                                    )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Sticker