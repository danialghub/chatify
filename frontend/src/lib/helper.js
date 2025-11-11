import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { faIR } from "date-fns/locale";

const toPersianDigits = (str) => str.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export const formatChatTime = (date) => {
    if (!date) return "";
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "تاریخ نامعتبر";

    if (isToday(newDate))
        return toPersianDigits(format(newDate, "HH:mm", { locale: faIR }));

    if (isYesterday(newDate))
        return "دیروز";

    if (isThisWeek(newDate))
        return format(newDate, "EEEE", { locale: faIR });

    return toPersianDigits(format(newDate, "d MMM", { locale: faIR }));
};


export const handleSwipe = (e, msg, setReplyTo, index) => {
    let startX = 0;
    let moved = 0;
    const el = e.currentTarget;
    el.style.transition = "none"; // جلوگیری از transition هنگام drag

    const getClientX = (event) =>
        event.touches ? event.touches[0].clientX : event.clientX;

    const onMove = (moveEvent) => {
        const currentX = getClientX(moveEvent);
        moved = currentX - startX;
        if (moved < 0) {
            
            moveEvent.preventDefault(); // جلوگیری از اسکرول عمودی
            el.style.transform = `translateX(${moved}px)`;
            document.documentElement.style.pointerEvents = `none`;

            document.getElementById(`replyToBtn${index}`).style.display = "block"
            
        }

    };

    const onEnd = () => {
        el.style.transition = "transform 0.25s ease"; // بازگشت نرم
        if (moved < -80) {
            setReplyTo(msg);

        }

        el.style.transform = "translateX(0)";
        document.documentElement.style.pointerEvents = `unset`;
        document.getElementById(`replyToBtn${index}`).style.display = "none"

        // پاکسازی لیسنرها
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
        el.removeEventListener("touchmove", onMove);
        el.removeEventListener("touchend", onEnd);
    };

    startX = getClientX(e);

    if (e.type === "touchstart") {
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onEnd);
    } else {
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onEnd);
    }
};

