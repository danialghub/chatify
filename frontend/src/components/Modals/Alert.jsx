import { AlertTriangle, LoaderIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'
import { useRoomStore } from '@/store/useRoomStore'
import { useAuthStore } from '@/store/useAuthStore'

const Alert = ({ onComplete, title, message }) => {
    const { openModal, isMessageRemoving } = useChatStore()
    const { isRemovingLoading, isLeaving } = useRoomStore()
    const { isLoggingOut } = useAuthStore()

    const isProccessing = isMessageRemoving || isMessageRemoving || isLeaving || isRemovingLoading || isLoggingOut

    return (
        <>
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className='flex justify-center mb-4'>
                <AlertTriangle className='size-14 text-yellow-500' />
            </motion.div>
            <h2 className='text-xl font-semibold text-center mb-2 text-gray-300'>
                {title || "هشدار!"}
            </h2>
            <p className='text-center text-zinc-500 mb-6'>
                {message || "آیا مطمئن هستید که میخواهید این عملیات را انجام دهید؟"}
            </p>
            <div className='flex  gap-3'>

                <button
                    onClick={onComplete}
                    disabled={isProccessing}
                    className='flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition'
                >
                    {isProccessing
                        ? <div className="flex items-center justify-center">
                            <LoaderIcon className="animate-spin" />
                        </div>
                        : "بله"
                    }
                </button>
                <button
                    onClick={() => openModal(null)}
                    disabled={isProccessing}
                    className='flex-1 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition text-gray-900'
                >
                    انصراف
                </button>

            </div>
        </>
    )
}

export default Alert