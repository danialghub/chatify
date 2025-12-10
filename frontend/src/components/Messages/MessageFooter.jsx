import { memo } from "react"
import { Clock, Check } from "lucide-react";
const MessageFooter = memo(({ hasBg, isMyMessage, hasSeen, placedTime, isMessageSending }) => {
    return (
        <div
            className={`flex items-center gap-1.5 rounded-xl text-[11px] leading-[11px] opacity-75 justify-start mt-3 w-max relative 
      ${hasBg ? "bg-black/40 backdrop-blur-sm px-2" : "pr-2"}`} >
            {/* آیکون وضعیت پیام */}
            {isMessageSending ?
                (<div className="size-4 h-5">
                    <Clock size={16} className="animate-pulse" />
                </div>
                ) :
                (isMyMessage &&
                    (
                        <div className="size-4 h-5 ">
                            <Check size={16}
                                className={`${hasSeen ? "text-blue-400" : "text-gray-400"}`}
                                strokeWidth={3}
                                style={{ position: "absolute", bottom: 1, right: 2 }}
                            />
                            {hasSeen && (
                                <Check size={16}
                                    className="text-blue-400"
                                    strokeWidth={3}
                                    style={{ position: "absolute", bottom: 1, right: 9 }}
                                />
                            )}
                        </div>
                    )
                )} {/* زمان پیام */}
            <span
                className={`flex items-center text-xs justify-center ${hasBg ? "text-white/80 pt-1 rounded-xl" : ""}`} >
                {new Date(placedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", })}
            </span>
        </div>
    )
})
export default MessageFooter