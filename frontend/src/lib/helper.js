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
    if (e.type === "mousedown") e.preventDefault();

    let startX = 0;
    let moved = 0;
    let isDragging = false;
    let isMouseDown = false;

    const el = e.currentTarget;
    const replyBtn = document.getElementById(`replyToBtn${index}`);
    const getClientX = (event) =>
        event.touches ? event.touches[0].clientX : event.clientX;

    const move = (event) => {
        if (!isMouseDown) return; // فقط وقتی دکمه موس پایین است
        const currentX = getClientX(event);
        moved = currentX - startX;

        if (moved < -10) {
            isDragging = true;
            event.preventDefault();
            el.style.transition = "none";
            el.style.transform = `translateX(${moved}px)`;
            replyBtn?.classList.add("visible");
        }
    };

    const end = () => {
        // ❗ حذف سریع لیسنرها قبل از هر تغییر
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", end);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);

        isMouseDown = false;

        el.style.transition = "transform 0.25s ease";

        if (moved < -80) setReplyTo(msg);

        // برگردوندن به حالت اولیه
        requestAnimationFrame(() => {
            el.style.transform = "translateX(0)";
            replyBtn?.classList.remove("visible");
        });

        isDragging = false;
    };

    const start = (event) => {
        startX = getClientX(event);
        moved = 0;
        isDragging = false;
        isMouseDown = true;

        window.addEventListener("mousemove", move, { passive: false });
        window.addEventListener("mouseup", end);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    };

    start(e);
};



