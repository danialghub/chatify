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
