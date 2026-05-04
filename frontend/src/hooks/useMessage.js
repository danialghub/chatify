import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";
import { useChatStore } from "@/store/useChatStore";
import toast from "react-hot-toast";




export function useFetchMessages(roomId) {

    return useQuery({
        queryKey: ["messages", roomId],
        queryFn: async () => {
            const { data } = await axiosInstance(`/messages/${roomId}`, {
            });
            return data;
        },

    });
}

export function useSendMessage() {
    const { authUser } = useAuthStore();
    const { selectedRoom, updateRoomStates } = useRoomStore();
    const { setUploadController, resetSendingStates, setSendingStates, setIsSendingMessage } = useChatStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ formData, forwardedMessage = null }) => {
            const replyToRaw = formData.get("replyTo");
            const stickerRaw = formData.get("sticker");
            console.log(JSON.parse(stickerRaw));

            const replyTo = replyToRaw ? JSON.parse(replyToRaw)._id : null;
            const sticker = stickerRaw ? JSON.parse(stickerRaw) : null;

            const payload = {
                ...Object.fromEntries(formData),
                replyTo,
                sticker,
                forwardedFrom: forwardedMessage?._id || null,
            };

            const controller = new AbortController();
            setUploadController(controller);

            const { data } = await axiosInstance.post(
                `/messages/send/${selectedRoom._id}`,
                payload,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    signal: controller.signal,
                    onUploadProgress: (ev) => {
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        setSendingStates({
                            uploadProgress: percent,
                            uploadedSize: ev.loaded,
                            uploadTotal: ev.total,
                        });
                    },
                }
            );

            return data;
        },

        onMutate: async ({ formData, previewData, forwardedMessage = null }) => {
            if (!selectedRoom?._id) return { previous: null };

            await queryClient.cancelQueries(["messages", selectedRoom._id]);

            const previous = queryClient.getQueryData(["messages", selectedRoom._id]);

            const fileUrl = previewData ? URL.createObjectURL(previewData.file) : null;
            const replyToStr = formData.get("replyTo");

            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isOptimistic: true,
                type: "user",
                senderId: {
                    _id: authUser._id,
                    name: authUser.name,
                    profilePic: authUser.profilePic,
                },
                roomId: {
                    _id: selectedRoom._id,
                    isGroup: selectedRoom.isGroup,
                },
                text: formData.get("text") || "",
                file: previewData
                    ? {
                        type: previewData.type,
                        name: previewData.file.name,
                        size: previewData.file.size,
                        url: fileUrl,
                    }
                    : null,
                replyTo: replyToStr ? JSON.parse(replyToStr) : null,
                forwardedFrom: forwardedMessage || null,
            };

            // Update query data with simple messages array (no pages)
            queryClient.setQueryData(["messages", selectedRoom._id], (old) => {
                if (!old) {
                    return {
                        messages: [optimisticMessage]
                    };
                }

                // Add optimistic message to the beginning of messages array
                return {
                    ...old,
                    messages: [...old.messages, optimisticMessage]
                };
            });

            updateRoomStates(optimisticMessage);
            return { previous, optimisticMessage, fileUrl };
        },

        onSuccess: (realMsg, _, ctx) => {
            setIsSendingMessage(null);

            queryClient.setQueryData(["messages", selectedRoom._id], (old) => {
                if (!old || !old.messages) {
                    return {
                        messages: [realMsg]
                    };
                }

                // Replace optimistic message with real message
                const filteredMessages = old.messages.filter(
                    m => m._id !== ctx.optimisticMessage._id
                );

                return {
                    ...old,
                    messages: [...filteredMessages, realMsg]
                };
            });

            updateRoomStates(realMsg);

            if (ctx.fileUrl) URL.revokeObjectURL(ctx.fileUrl);
        },

        onError: (error, _, ctx) => {
            if (error.code === "ERR_CANCELED") {
                toast("آپلود لغو شد");
            } else {
                toast.error(error.response?.data?.message || "خطایی رخ داد");
            }

            setIsSendingMessage(null);

            if (ctx?.previous) {
                queryClient.setQueryData(["messages", selectedRoom._id], ctx.previous);
            }

            if (ctx?.fileUrl) URL.revokeObjectURL(ctx.fileUrl);
        },

        onSettled: () => {
            resetSendingStates();
            setUploadController(null);
        },
    });
}

export const useRemoveMessage = (roomId) => {
    const queryClient = useQueryClient();
    const { setIsMessageProccessing } = useChatStore()
    return useMutation({
        mutationFn: async (msgId) => {
            const response = await axiosInstance.delete(`/messages/remove/${msgId}`);
            setIsMessageProccessing("isMessageRemoving", true)
            return response.data;
        },
        onMutate: async (msgId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages', roomId] });

            // Snapshot the previous value
            const previousMessages = queryClient.getQueryData(['messages', roomId]);

            // Optimistically update to the new value
            queryClient.setQueryData(['messages', roomId], (old) => {
                return old?.filter((m) => m._id !== msgId);
            });

            // Return context with the snapshot
            return { previousMessages };
        },
        onError: (error, msgId, context) => {
            // Rollback to the previous value on error
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', roomId], context.previousMessages);
            }
            const errorMessage = error.response?.data?.message || error.message || "خطا در برقراری";
            toast.error(errorMessage);
        },
        onSuccess: () => {
            toast('پیام با موفقیت حذف شد');
        },
        onSettled: () => {
            // Always refetch after error or success to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
            setIsMessageProccessing("isMessageRemoving", false)
        }
    })
};
