import { motion } from 'framer-motion'
import { useRoomStore } from '@/store/useRoomStore'
import { useAuthStore } from '@/store/useAuthStore';
import { ChatIcon } from '@/components/index'
import useSocket from '@/hooks/useSocket';
import { formatChatTime } from '@/lib/helper'
import { memo } from 'react';

const Room = memo(({ room, userId, name, logo }) => {
  const { selectedRoom, setSelectedRoom, unSeenMessages, updateRoomStates, removeFromRooms } = useRoomStore()
  const { onlineUsers } = useAuthStore();

  useSocket('message:notif', updateRoomStates)
  useSocket('room:remove', removeFromRooms)

  const last = room?.lastMessage;
  const isPersian = (text) => /[\u0600-\u06FF]/.test(text);
  console.log(last);

  return (
    <motion.div
      onClick={() => setSelectedRoom(room)}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer 
    ${selectedRoom?._id === room._id
          ? "bg-cyan-500/20 shadow-inner"
          : "hover:bg-cyan-500/10 bg-cyan-900/5"
        }`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
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
          className="truncate [unicode-bidi:plaintext] text-xs text-slate-400 opacity-70 w-60"
        >
          <p
            dir={isPersian(last?.text || "س") ? "rtl" : "ltr"}
            className="text-xs truncate opacity-70"
          >
            {room.isGroup && last?.senderId?.name && (
              <span className="text-sky-200 font-bold">
                {last.senderId.name}:{" "}
              </span>
            )}

            {last
              ? last.text
                ? last.text.length > 50
                  ? last.text.slice(0, 50) + "..."
                  : last.text
                : last.file
                  ? last.file.type === "image"
                    ? "📷 Photo"
                    : last.file.type
                      ? `📄 ${last.file.name}`
                      : "محتوایی ندارد"
                  : last.sticker
                    ? `${last.sticker.emoji} Sticker`
                    : "محتوایی ندارد"
              : "پیامی وجود ندارد"}
          </p>

        </span>

      </div>

      {/* نشانگر پیام خوانده‌نشده */}
      {unSeenMessages[room._id] > 0 && (
        <div className="absolute right-2 bottom-2">
          <span
            className="
        bg-cyan-800 text-white text-[10px] font-bold 
        w-6 h-6 rounded-full flex items-center justify-center
        shadow-sm select-none
      "
            style={{ lineHeight: "1" }}
          >
            {unSeenMessages[room._id] > 99 ? "99+" : unSeenMessages[room._id]}
          </span>
        </div>
      )}


    </motion.div>

  )
})

export default Room