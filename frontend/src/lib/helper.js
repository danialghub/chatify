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


export const handleSwipe = (e, msg, setReplyTo, inputRef) => {
    let startX = 0;
    let startY = 0;
    let movedX = 0;
    let movedY = 0;
    let isDragging = false;
    let isMouseDown = false;
    let swipeLocked = false; // جهت lock

    const el = e.currentTarget;
    const width = e.target.offsetWidth + 30; // محدودیت جابجایی


    const getClientX = (event) =>
        event.touches ? event.touches[0].clientX : event.clientX;
    const getClientY = (event) =>
        event.touches ? event.touches[0].clientY : event.clientY;

    const move = (event) => {
        if (!isMouseDown) return;

        const currentX = getClientX(event);
        const currentY = getClientY(event);

        movedX = currentX - startX;
        movedY = currentY - startY;

        if (!swipeLocked) {
            // Lock جهت حرکت
            if (Math.abs(movedX) > Math.abs(movedY) && Math.abs(movedX) > 10) {
                swipeLocked = true; // swipe افقی
            } else if (Math.abs(movedY) > Math.abs(movedX)) {
                swipeLocked = true; // اسکرول عمودی
                return; // دیگر افقی پردازش نشود
            }
        }

        if (swipeLocked && Math.abs(movedX) > Math.abs(movedY) && movedX < 0) {
            isDragging = true;

            // محدودیت جابجایی تا width
            const translateX = Math.max(movedX, -width);

            if (event.cancelable) event.preventDefault(); // فقط وقتی افقی است جلوی scroll را بگیر
            el.style.transition = "none";
            el.style.transform = `translateX(${translateX}px)`;
        }
    };

    const end = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", end);
        window.removeEventListener("touchmove", move, { passive: false });
        window.removeEventListener("touchend", end);

        isMouseDown = false;
        el.style.transition = "transform 0.25s ease";

        // فقط اگر به حد لازم رسیده بود trigger reply
        if (movedX < -80) {
            setReplyTo(msg);
            inputRef.current.focus()
        }


        requestAnimationFrame(() => {
            el.style.transform = "translateX(0)";
        });

        isDragging = false;
        swipeLocked = false;
    };

    const start = (event) => {
        startX = getClientX(event);
        startY = getClientY(event);
        movedX = 0;
        movedY = 0;
        isDragging = false;
        isMouseDown = true;
        swipeLocked = false;

        // جلوگیری از انتخاب متن در drag
        el.style.userSelect = "none";

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    };

    start(e);
};



export const parseDynamicContent = (msgText) => {
    let html = null;
    if (!msgText) return [null, false]
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const emojis = msgText.match(emojiRegex) || [];

    const isOnlyEmoji = emojis.length > 0 && emojis.join('') === msgText;

    // حالت فقط ایموجی

    let fontSizeClass = "text-xl ";
    if (isOnlyEmoji) {

        switch (emojis.length) {
            case 1:
                fontSizeClass = "text-6xl max-sm:text-5xl";
                break;
            case 2:
                fontSizeClass = "text-5xl max-sm:text-4xl";
                break;
            case 3:
                fontSizeClass = "text-4xl max-sm:text-3xl";
                break;
            default:
                fontSizeClass = "text-3xl max-sm:text-2xl";
        }

        html = `<span class="${fontSizeClass}">${msgText}</span>`
        return [html, true];
    } else {
        html = msgText.replace(emojiRegex, (emoji) => {
            return `<span class="${fontSizeClass} max-sm:text-sm">${emoji}</span>`
        })
    }

    // --------------------------
    // لینک‌سازی برای متن معمولی
    // --------------------------
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    html = html.replace(urlRegex, (url) => {
        const displayText = url.replace(/^https?:\/\//, '');
        return `<a 
            class="text-blue-300"
            href="${url}" 
            target="_blank"
            rel="noopener noreferrer"
        >${displayText}</a>`;
    });

    return [html, false];
};



