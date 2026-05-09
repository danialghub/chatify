import { motion } from 'framer-motion'
import { useRoomStore } from '@/store/useRoomStore'
import { useAuthStore } from '@/store/useAuthStore';
import { ChatIcon } from '@/components/index'
import useSocket from '@/hooks/useSocket';
import { formatChatTime } from '@/lib/helper'
import { memo } from 'react';
import { Link } from 'react-router';


const Room = memo(({ room, userId, name, logo }) => {
  const { selectedRoom, setSelectedRoom, unSeenMessages, updateRoomStates, removeFromRooms } = useRoomStore()


  const { onlineUsers, authUser } = useAuthStore();

  useSocket('message:notif', updateRoomStates)
  useSocket('room:remove', removeFromRooms)

  const last = room?.lastMessage;


  const getLastMessageText = (last) => {
    if (!last) return "پیامی وجود ندارد";

    if (last.text) {
      return last.text.length > 50
        ? last.text.slice(0, 50) + "..."
        : last.text;
    }

    if (last.image) {
      return (
        <p className='flex items-center gap-1'>
          <img src={last.image} className='size-5 rounded' alt="" />
          <span>Photo</span>
        </p>
      )
    }

    if (last.sticker) {
      return `${last.sticker.emoji} Sticker`;
    }

    if (last.forwardedFrom) {
      return <span className='text-sky-300'>
        Forwarded from {last.forwardedFrom.roomId?.name ||
          last.forwardedFrom.senderId?.name ||
          "Unknown"
        }
      </span>;
    }

    return "محتوایی ندارد";
  };

  const lastMessageSenderName = last?.senderId?._id === authUser._id ? "You" : last?.senderId?.name
console.log(last);

  return (
    <motion.div
      className={`relative  px-4 py-3 rounded-lg cursor-pointer 
    ${selectedRoom?._id === room._id
          ? "bg-cyan-500/20 shadow-inner"
          : "hover:bg-cyan-500/10 bg-cyan-900/5"
        }`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <div
        onClick={() => setSelectedRoom(room)}
        className='flex items-center gap-3'
      >
        {/* آواتار */}
        {userId ? (
          <div className={`avatar  ${onlineUsers.includes(userId) ? "online" : "offline"}`}>
            <ChatIcon
              profile={logo}
              name={name}
              classProps="!size-12 w-auto"
            />
          </div>
        ) : (
          <div className="relative shrink-0">
            <ChatIcon profile={logo} name={name} classProps="size-12" />
          </div>
        )}


        {/* متن و اطلاعات */}
        <div className="flex flex-col justify-center w-full overflow-hidden">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className="text-sm font-medium text-slate-100 truncate">{name}</h4>
            {room?.lastMessage && (
              <p className="text-[11px] text-slate-400 shrink-0">
                {formatChatTime(room.lastMessage.createdAt)}
              </p>
            )}
          </div>

          <span
            className="truncate [unicode-bidi:plaintext] text-xs text-slate-400 opacity-70 w-56"
          >
            <div

              className="text-xs truncate opacity-70 flex items-center gap-1"
            >
              {room.isGroup && last?.senderId?.name && (
                <span className="text-sky-200 font-bold text-sm">
                  {lastMessageSenderName} :{" "}
                </span>
              )}

              {last && (
                getLastMessageText(last)
              )}
            </div>

          </span>

        </div>

        {/* نشانگر پیام خوانده‌نشده */}
        {unSeenMessages[room._id] > 0 && (
          <div className="absolute right-2 bottom-2">
            <span
              className="
    bg-gradient-to-tr from-slate-600 to-slate-700
    text-white text-[11px] font-bold
    w-6 h-6 rounded-full flex items-center justify-center
    shadow-lg drop-shadow-cyan-500/50
    select-none
    relative pt-1
  "
              style={{ lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {unSeenMessages[room._id] > 99 ? "99+" : unSeenMessages[room._id]}
            </span>


          </div>
        )}

      </div>


    </motion.div>

  )
})

export default Room