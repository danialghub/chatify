import { Message, ContextMenu } from "@/components/index";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from '@/store/useChatStore'
import { useRoomStore } from '@/store/useRoomStore'
import { useAuthStore } from '@/store/useAuthStore'
import { injectDateMessages } from '@/lib/helper'
import useSocket from "@/hooks/useSocket";

function SystemMessage({ msg, chatContainerRef }) {
  const [isSticky, setIsSticky] = useState(false);
  let timeoutRef = useRef(null);
  const container = chatContainerRef?.current

  useEffect(() => {
    const handleScroll = () => {
      // اگر تایمر قبلی هست، لغوش کن
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // تا وقتی اسکرول انجام میشه، isSticky=true
      setIsSticky(true);

      // وقتی اسکرول قطع شد، بعد نیم‌ثانیه false کن
      timeoutRef.current = setTimeout(() => {
        setIsSticky(false);
        timeoutRef.current = null;
      }, 1500); // نیم‌ثانیه
    };


    container?.addEventListener("scroll", handleScroll);
    return () => {
      container?.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);



  return (
    <div
      id={msg._id}
      className={`
      text-center text-white/60
      ${msg.type === "date" && isSticky ? "sticky top-2 z-10" : ""}
    `}
      style={{ height: msg.type === "date" ? 28 : "auto" }} // <-- ارتفاع ثابت
    >
      <span className="px-4 py-1 text-sm bg-slate-900/5 backdrop-blur-md rounded-lg shadow-lg inline-block">
        {msg.text}
      </span>
    </div>
  );

}

const MessageList = ({
  messages,
  textareaRef,
  messageEndRef,
  chatContainerRef
}) => {
  const [targetMsg, setTargetMsg] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const { isMessageSending, checkUserMessagesAsSeen } = useChatStore()
  const { selectedRoom } = useRoomStore()
  const { authUser } = useAuthStore()

  useSocket('message:seen', checkUserMessagesAsSeen)

  const goToMsg = useCallback((e, id) => {
    e.stopPropagation()
    const targetMsgId = messages.find(msg => msg._id === id)._id;
    const targetMsg = document.getElementById(`msg_${targetMsgId}`);

    if (!targetMsg) return;

    // اسکرول به سمت پیام
    targetMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // ساخت observer برای تشخیص ورود به viewport
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // وقتی وارد viewport شد:
          targetMsg.classList.add('flash');

          setTimeout(() => {
            targetMsg.classList.remove('flash');
          }, 1000);

          // بعد از اجرا فقط یکبار نظارت کن
          observerInstance.disconnect();
        }
      },
      { threshold: 0.5 } // یعنی حداقل ۵۰٪ از المنت داخل دید باشه
    );

    observer.observe(targetMsg);
  }, []);

  const openMenuForMessage = useCallback((e, isMyMessage, msg) => {
    e.preventDefault();

    const msgElem = e.target;
    if (!msgElem) return;

    const rect = msgElem.getBoundingClientRect();
    const container = chatContainerRef?.current;
    if (!container) return;

    const crect = container.getBoundingClientRect();

    const menuW = 150;
    const menuH = 240;

    // موقعیت اولیه نسبت به container
    let x = 0;
    let y = rect.bottom - crect.top + container.scrollTop;

    if (isMyMessage) {
      // پیام من → منو سمت چپ پیام
      x = rect.left - menuW - 25;
    } else {
      // پیام طرف مقابل → منو سمت راست پیام
      x = rect.right + 25;
    }


    // جلوگیری از خروج از کانتینر
    if (x < crect.left) x = crect.left + 25;
    if (x + menuW > crect.right) x = crect.right - menuW - 25;

    // چک خروج پایین
    const containerBottom = container.scrollTop + container.clientHeight;
    if (y + menuH > containerBottom) {
      y = container.scrollTop - menuH;
    }

    // چک خروج بالا
    if (y < container.scrollTop) {
      y = container.scrollTop + menuH;
    }

    x -= crect.left

    setTargetMsg(msg._id);
    setMenuPos({ x, y });
    setIsMenuOpen(true);
  }, []);


  const closeMenu = () => {
    setIsMenuOpen(false);
    setTargetMsg(null);

  };



  const msgs = injectDateMessages(messages)
  return (
    <div className="relative py-6 px-3 pr-5 space-y-3 will-change-transform">
      {
        msgs.map((msg, idx) => {
          const next = messages[idx + 1];

          const isStillSameSender = next?.senderId?._id === msg.senderId?._id;
          const isMyMessage = msg?.senderId?._id === authUser._id;
          const selectedMsg = targetMsg === msg._id;


          return msg.type === "user" ? (
            <Message
              key={msg._id}
              msg={msg}
              isMyMessage={isMyMessage}
              isGroup={selectedRoom.isGroup}
              isStillSame={isStillSameSender}
              inputRef={textareaRef}
              selectedMsg={selectedMsg}
              isMessageSending={isMessageSending === msg._id}
              openMenu={openMenuForMessage}
              goToMsg={goToMsg}
            />
          ) : (
            <SystemMessage
              key={msg._id}
              msg={msg}
              chatContainerRef={chatContainerRef}
            />
          )
        })
      }
      <ContextMenu
        targetId={targetMsg}
        chatContainerRef={chatContainerRef}
        close={closeMenu}
        menuPos={menuPos}
        isOpen={isMenuOpen}
        textareaRef={textareaRef}
      />
      <div ref={messageEndRef} id="messageEndRef" />
    </div >
  );
}
export default memo(MessageList)