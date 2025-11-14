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
    // فقط اگر موجود بود

    let startX = 0;
    let moved = 0;
    let isDragging = false;
    let isMouseDown = false;

    const el = e.currentTarget;
    const width = e.target.offsetWidth + 30;
    const replyBtn = document.getElementById(`replyToBtn${index}`);
    const getClientX = (event) =>
        event.touches ? event.touches[0].clientX : event.clientX;

    const move = (event) => {
        if (!isMouseDown) return;

        const currentX = getClientX(event);
        moved = currentX - startX;

        if (moved < -10) {
            isDragging = true;

            // فقط اگر event قابل لغو باشد

            if (event.cancelable) event.preventDefault();
            if (moved > (width * -1)) {

                el.style.transition = "none";
                el.style.transform = `translateX(${moved}px)`;
                replyBtn?.classList.add("visible");
            }
        }
    };

    const end = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", end);
        window.removeEventListener("touchmove", move, { passive: false });
        window.removeEventListener("touchend", end);

        isMouseDown = false;
        el.style.transition = "transform 0.25s ease";

        if (moved < -80) setReplyTo(msg);

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

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    };

    start(e);
};

export const parseDynamicContent = (msgText) => {
    let html = null;
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const emojis = msgText.match(emojiRegex) || [];

    const isOnlyEmoji = emojis.length > 0 && emojis.join('') === msgText;

    // حالت فقط ایموجی

    let fontSizeClass = "text-xl";
    if (isOnlyEmoji) {

        switch (emojis.length) {
            case 1:
                fontSizeClass = "text-6xl";
                break;
            case 2:
                fontSizeClass = "text-5xl";
                break;
            case 3:
                fontSizeClass = "text-4xl";
                break;
            default:
                fontSizeClass = "text-3xl";
        }

        return `<span class="${fontSizeClass}">${msgText}</span>`;
    } else {
        html = msgText.replace(emojiRegex, (emoji) => {
            return `<span class="${fontSizeClass}">${emoji}</span>`
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

    return html;
};



