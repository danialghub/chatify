import { axiosInstance } from "@/lib/axios";

let controller = null;

export const cancelPreviousRequest = () => {
    if (controller) {
        controller.abort();
    }
};

const cancellableRequest = (url, config = {}) => {
    // حتما قبل از ساخت درخواست جدید، درخواست قبلی لغو شود
    cancelPreviousRequest();

    // ساخت کنترلر جدید
    controller = new AbortController();
    const finalConfig = {
        ...config,
        signal: controller.signal
    };

    // انجام درخواست
    return axiosInstance.get(url, finalConfig);
};

export default cancellableRequest;
