import React from 'react'
import { MessageCircleX } from 'lucide-react'

const ImageModal = ({ msg, setMessage }) => {
    return (
        <dialog id='img' className='modal backdrop-blur-sm !px-8' open>
            <div className='bg-black/80 absolute p-6 space-y-6 sm:max-w-[80vw]  '>
                <div className='absolute top-2 right-2  hover:text-red-500'>
                    <MessageCircleX
                        onClick={() => setMessage(null)}
                        className='cursor-pointer '
                    />
                </div>

                <img src={msg.image} alt="" className='max-h-96'/>
                <div className='flex justify-between items-center'>
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                    <h3 className='text-xl '>{msg.text}</h3>

                </div>
            </div>

        </dialog>
    )
}

export default ImageModal