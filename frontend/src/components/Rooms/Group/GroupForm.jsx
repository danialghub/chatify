import { useEffect, useRef, useState } from "react";
import { LoaderIcon, XIcon } from "lucide-react";
import { ChatIcon, ImageUploader, PageLoader } from '@/components/index'
import { useRoomStore } from "@/store/useRoomStore";
import { useAuthStore } from "@/store/useAuthStore";

const GroupForm = ({ state }) => {
    const { privateRooms, createRoom, updateGroup, selectedRoom, isCreatingLoading, isUpdatingLoading } = useRoomStore()


    const { authUser } = useAuthStore()

    const isCreateMode = state === "create"

    const imageInputRef = useRef(null)
    const groupNameRef = useRef(null)


    const [groupName, setGroupName] = useState(
        isCreateMode ? "" : selectedRoom?.name
    )
    const [groupImage, setGroupImage] = useState(
        isCreateMode ? null : selectedRoom?.logo
    )
    const [selectedUsers, setSelectedUsers] = useState(
        isCreateMode
            ? []
            : selectedRoom?.otherMember
    );
console.log(isCreateMode);


    const toggleUser = (user) => {
        setSelectedUsers((prev) =>
            prev.some((u) => u._id === user._id)
                ? prev.filter((u) => u._id !== user._id)
                : [...prev, user]
        );
    };

    const removeUser = (id) => setSelectedUsers((prev) => prev.filter((u) => u._id !== id));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupNameRef.current.value.trim() || !selectedUsers.length) return;
        const memberIds = selectedUsers.map(m => m._id)
        const img = imageInputRef.current?.files[0] ? groupImage.data : null
        const data = { isGroup: true, memberIds, groupName, groupImage: img }
        if (isCreateMode) {
            createRoom(data, true)
        } else {
            updateGroup(data, selectedRoom._id)
        }

    };
    const removeLogo = () => {
        setGroupImage(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }

    useEffect(() => {
        groupNameRef?.current?.focus()
        setTimeout(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
        }, 100);
        return () => setSelectedUsers([])
    }, [])
    if (!privateRooms?.length)
        return <div className="text-center text-xl">ابتدا مخاطب پیدا کنید</div>

    return (

        <div className="w-full max-w-md mx-auto px-5 rounded-2xl ">
            {/* Header: Selected Users */}
            {selectedUsers?.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 mb-4 border-b border-white/40 text-gray-200">
                    {selectedUsers.map((user) => (
                        <div
                            key={user._id}
                            className="relative mt-1 flex flex-col items-center min-w-[64px] "
                        >
                            <ChatIcon
                                profile={user?.profilePic}
                                name={user.name} />
                            <button
                                onClick={() => removeUser(user._id)}
                                className="absolute -top-1 -right-1 z-50 bg-red-500 hover:bg-red-600 text-white p-[2px] rounded-full"
                            >
                                <XIcon size={16} />
                            </button>
                            <span className="text-xs mt-1 text-gray-200 truncate max-w-[60px]">
                                {user.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

                <div className="flex justify-center items-end gap-6">

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-200 mb-1">
                            نام گروه
                        </label>
                        <input
                            type="text"
                            ref={groupNameRef}
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-zinc-800 p-2.5  text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="نام گروه"
                        />
                    </div>

                    <ImageUploader
                        setFile={setGroupImage}
                        inputRef={imageInputRef}
                    />
                    {groupImage
                        ?
                        <div className="relative">
                            <ChatIcon
                                profile={groupImage?.data || groupImage}
                                classProps="!size-20"
                            />
                            <button
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                                type="button"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                        :
                        <span
                            onClick={() => imageInputRef.current?.click()}
                            className="px-2 py-1 text-sm text-blue-600 bg-blue-100 rounded">انتخاب لوگو</span>
                    }

                </div>

                {/* Contact List */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        انتخاب اعضای گروه
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-52 overflow-y-auto overflow-x-hidden p-1 text-gray-200">
                        {privateRooms.map(r => {
                            const members = r.otherMember
                            const isSelected = selectedUsers?.some((u) => u._id === members._id)

                            return (
                                <div
                                    key={members._id}
                                    onClick={() => toggleUser(members)}
                                    className={`cursor-pointer flex items-center gap-2 p-2 rounded-xl border transition-all duration-200  ${isSelected
                                        ? "border-indigo-500 hover:bg-indigo-800/50 dark:bg-indigo-800/30"
                                        : "border-gray-700 hover:bg-zinc-700"
                                        }`}
                                >

                                    <ChatIcon
                                        profile={members?.profilePic}
                                        name={members.name}
                                        classProps="size-9"
                                    />

                                    <span className="text-sm font-medium text-gray-200">
                                        {members.name.length > 6
                                            ? members.name.slice(0, 6).concat('...')
                                            : members.name
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit */}
                <button
                    disabled={!selectedUsers?.length || !groupName || isCreatingLoading || isUpdatingLoading}
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-indigo-600  disabled:bg-gray-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-lg "
                >

                    {isCreatingLoading || isUpdatingLoading ?
                        <div className="flex items-center justify-center">
                            <LoaderIcon className=" animate-spin" />
                        </div>
                        : isCreateMode ? "ایجاد گروه" : "ادیت گروه"}
                </button>
            </form>
        </div>

    );
}
export default GroupForm