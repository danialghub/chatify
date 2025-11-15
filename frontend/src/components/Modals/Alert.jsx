import { AlertTriangle, LoaderIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'
const Alert = ({ onComplete, title, message, isProccessing }) => {
    const { openModal } = useChatStore()
    console.log(isProccessing);
    
    return (
        <>
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className='flex justify-center mb-4'>
                <AlertTriangle className='size-14 text-yellow-500' />
            </motion.div>
            <h2 className='text-xl font-semibold text-center mb-2'>
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