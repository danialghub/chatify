import dayjs from "dayjs";
import jalaliday from "jalaliday";

// افزونه Jalali برای dayjs
dayjs.extend(jalaliday);
dayjs.calendar("jalali");
// تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (input) => {
    if (input === null || input === undefined) return "";
    const str = String(input); // ⚡ تبدیل به رشته
    return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
};


export const formatChatTime = (date) => {
    if (!date) return "";
    const now = dayjs();
    const d = dayjs(date).calendar("jalali"); // استفاده از تقویم شمسی

    if (!d.isValid()) return "تاریخ نامعتبر";

    // اگر امروز
    if (d.isSame(now, "day")) {
        return toPersianDigits(d.format("HH:mm"));
    }

    // اگر دیروز
    if (d.isSame(now.subtract(1, "day"), "day")) {
        return "دیروز";
    }

    // اگر در همین هفته
    if (d.isSame(now, "week")) {
        // نام روز هفته به فارسی
        const weekDays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
        return weekDays[d.day()];
    }

    // بقیه تاریخ‌ها: روز و ماه به شمسی
    const monthNames = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];

    const day = toPersianDigits(d.date());
    const month = monthNames[d.month()]; // month شمسی
    return `${day} ${month}`;
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
    const width = e.target.offsetWidth + 20; // محدودیت جابجایی


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

    const end = (e) => {

        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", end);
        window.removeEventListener("touchmove", move, { passive: false });
        window.removeEventListener("touchend", end);

        isMouseDown = false;
        el.style.transition = "transform 0.25s ease";

        // فقط اگر به حد لازم رسیده بود trigger reply
        if (movedX < -70) {
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
                fontSizeClass = "text-7xl max-sm:text-6xl ";
                break;
            case 2:
                fontSizeClass = "text-6xl max-sm:text-5xl";
                break;
            case 3:
                fontSizeClass = "text-5xl max-sm:text-4xl";
                break;
            default:
                fontSizeClass = "text-4xl max-sm:text-3xl";
        }

        html = `<span class="${fontSizeClass} leading-[90px]">${msgText}</span>`
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

export const checkFileType = (file) => {
    const name = file.name.toLowerCase();
    const type = file.type

    // Images
    if (type.startsWith("image/")) return "image";

    if (name.endsWith(".pdf")) return "pdf";

    if (name.endsWith(".doc") || name.endsWith(".docx")) return "word";

    if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "powerpoint";

    if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "excel";

    if (name.endsWith(".zip")) return "zip";

    if (name.endsWith(".rar")) return "rar";

    return "file"; // Default
};


export const injectDateMessages = (messages) => {
    let newList = [];
    let lastDate = null;

    messages.forEach(msg => {

        const msgDate = dayjs(msg.createdAt).locale("fa").format("YYYY-MM-DD");

        if (msgDate !== lastDate) {

            newList.push({
                _id: `date-${msgDate}`,
                type: "date",
                text: dayjs(msg.createdAt).locale("fa").format("D MMMM")
            });
            lastDate = msgDate;
        }

        newList.push(msg);
    });

    return newList;
}



