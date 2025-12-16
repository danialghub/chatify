import { motion, AnimatePresence } from "framer-motion";
import { Forward, XCircle } from "lucide-react";
import { useChatStore } from '@/store/useChatStore'
import { useRoomStore } from '@/store/useRoomStore'
/**
 * ForwardOverlay
 * فقط یک Overlay مستقل برای حالت فوروارد
 * - کل صفحه زیرین را قفل می‌کند
 * - انیمیشن نرم
 * - دکمه لغو
 */
export default function ForwardOverlay({
    hint = "یک گفتگو را برای ارسال انتخاب کنید",
}) {
    const forwardedMessage = useChatStore(s => s.forwardedMessage)
    const setForwardMessage = useChatStore(s => s.setForwardMessage)
    const targetForwardRoom = useRoomStore(s => s.targetForwardRoom)



    return (
        <AnimatePresence>
            {(forwardedMessage && !targetForwardRoom ) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-70 max-sm:hidden"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative z-10 h-full w-full flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900/80 border border-white/10 px-10 py-8 shadow-2xl">
                            {/* Icon */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                                className="relative"
                            >
                                <div className="absolute inset-0 rounded-full blur-xl bg-sky-500/30" />
                                <Forward className="relative w-16 h-16 text-sky-400" />
                            </motion.div>

                            {/* Text */}
                            <div className="text-center">
                                <p className="text-lg font-semibold">در حال فوروارد پیام</p>
                                <p className="mt-1 text-sm text-gray-400">{hint}</p>
                            </div>

                            {/* Cancel */}
                            <button
                                onClick={() => setForwardMessage(null)}
                                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-red-500/90 hover:bg-red-500 px-5 py-2 text-sm font-medium transition"
                            >
                                <XCircle className="w-4 h-4" />
                                لغو فوروارد
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
