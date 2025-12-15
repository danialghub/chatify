import { useEffect, useRef, memo, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from '@/store/useChatStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Reply, ClipboardCopy, Edit, Delete, SaveIcon } from 'lucide-react';
import { toast } from 'react-hot-toast'

const ContextMenu = forwardRef((props, ref) => {

  const { targetId, chatContainerRef, isOpen, menuPos, close, textareaRef } = props;
  const [targetMsg, setTargetMsg] = useState(null)

  const overlayRef = useRef(null);



  const { removeMessage, openModal, setReplyToMsg, messages, downloadedFiles } = useChatStore()

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
  const saveFileHandler = () => {
    const url = downloadedFiles[targetMsg.msg._id]
    if (!url) return;
    const fileName = targetMsg.msg.file.name

    // ساخت لینک موقت
    
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; // نام فایل هنگام ذخیره
    link.target = "_blank"
    document.body.appendChild(link);

    // شبیه‌سازی کلیک روی لینک
    link.click();

    // حذف لینک از DOM
    document.body.removeChild(link);

    close()
  };



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
      color: "text-green-600", // پاسخ: سبز نشون‌دهنده تعامل مثبت
      icon: Reply,
      onClick: replyToMsgHandler
    },
    {
      id: "copy",
      label: "کپی",
      color: "text-yellow-600", // کپی: زرد ملایم برای توجه
      icon: ClipboardCopy,
      onClick: copyText
    },
    {
      id: "edit",
      label: "ویرایش",
      color: "text-blue-600", // ویرایش: آبی کلاسیک برای تغییر و اصلاح
      icon: Edit
    },
    {
      id: "save",
      label: "ذخیره",
      color: "text-indigo-600", // ذخیره: ایندگو برای حس حرفه‌ای و امنیت
      icon: SaveIcon,
      onClick: saveFileHandler
    },
    {
      id: "delete",
      label: "حذف",
      color: "text-red-600", // حذف: قرمز هشدار دهنده
      icon: Delete,
      onClick: removeMsgHandler
    },
  ]
    .filter(item => targetMsg?.isMyMessage || item.id !== "delete" && item.id !== "edit")
    .filter(item => item.id !== "copy" || targetMsg?.msg?.text)
    .filter(item => {
      if (item.id === "save") {
        return targetMsg?.msg?.file && downloadedFiles[targetMsg?.msg?._id];
      }
      return true;
    });



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
            className="fixed z-[999]  min-w-32 bg-white rounded-lg shadow-lg overflow-hidden border border-black/5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            style={{
              top: menuPos.y
              , left: menuPos.x
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => item?.onClick()}
                className={`flex items-center gap-3 px-2 py-2.5 hover:bg-black/10 cursor-pointer text-black/80
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