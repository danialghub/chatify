import { useEffect, useRef, memo, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from '@/store/useChatStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Reply, ClipboardCopy, Edit, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast'

const ContextMenu = forwardRef((props, ref) => {

  const { targetId, chatContainerRef, isOpen, menuPos, close, textareaRef } = props;
  const [targetMsg, setTargetMsg] = useState(null)

  const overlayRef = useRef(null);



  const { removeMessage, openModal, setReplyToMsg, messages } = useChatStore()
  const { authUser } = useAuthStore()


  useEffect(() => {
    const targetMsg = messages.find(msg => msg._id === targetId)
    const isMyMessage = authUser._id === targetMsg?.senderId?._id
    setTargetMsg({ msg: targetMsg, isMyMessage })
  }, [targetId])

  // ------------------------
  // 🔥 متن را کپی کن
  // ------------------------
  const copyText = () => {
    navigator.clipboard.writeText(targetMsg?.msg?.text);
    toast('متن کپی شد')
    close()
  }
  const removeMsgHandler = () => {
    console.log(targetMsg.msg);

    openModal("Alert", {
      title: "حذف پیام",
      onComplete: () => removeMessage(targetMsg?.msg?._id),
      size: "sm",
    })
    close()

  }
  const replyToMsgHandler = () => {
    setReplyToMsg(targetMsg.msg)
    textareaRef.current.focus()
    close()
  }


  useEffect(() => {
    const closeMenuHandler = () => {
      if (open) {
        close()
      }
    }
    document.addEventListener('click', closeMenuHandler)
    return () => {
      document.removeEventListener('click', closeMenuHandler)

    }
  }, [])



  const items = [
    {
      id: "reply",
      label: "پاسخ",
      color: "text-gray-800",
      icon: Reply,
      onClick: replyToMsgHandler
    },
    {
      id: "copy",
      label: "کپی",
      icon: ClipboardCopy,
      color: "text-gray-700",
      onClick: copyText
    },
    {
      id: "edit",
      label: "ویرایش",
      color: "text-blue-600",
      icon: Edit
    },
    {
      id: "delete",
      label: "حذف",
      onClick: removeMsgHandler,
      color: "text-red-600",
      icon: Delete
    },
  ].filter(item => targetMsg?.isMyMessage || item.id !== "delete" && item.id !== "edit");

  return (
    < >

      {/* OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            className="absolute top-0 left-0   w-full h-full bg-black/30 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            
          />

        )}
      </AnimatePresence>

      {/* CONTEXT MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            className="fixed z-[999]  w-40 bg-white rounded-2xl shadow-lg overflow-hidden border border-black/5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            style={{
              top: menuPos.y
              , left: menuPos.x - chatContainerRef.current.getBoundingClientRect().left
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => item?.onClick()}
                className={`flex items-center gap-3 p-3 hover:bg-black/10 cursor-pointer text-black/80
                  ${i === 2 ? "border-b border-black/20" : ""}
                `}
              >
                <span className="text-blue-500 w-5 text-center">
                  <item.icon size={25} className={item.color} />
                </span>
                <span className="text-md">{item.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
})
export default memo(ContextMenu)