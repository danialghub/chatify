import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { ChatIcon, ImageUploader } from '../index'
import { useRoomStore } from "../../store/useRoomStore";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";


const GroupForm = ({ state }) => {
    const { allPrivateChat, createGroup, selectedRoom } = useRoomStore()
    const { authUser } = useAuthStore()

    const isCreateMode = state === "create"

    const imageInputRef = useRef(null)
    const groupNameRef = useRef(null)


    const [groupName, setGroupName] = useState(
        isCreateMode ? null : selectedRoom.name
    )
    const [groupImage, setGroupImage] = useState(
        isCreateMode ? null : selectedRoom.logo
    )
    const [selectedUsers, setSelectedUsers] = useState(
        isCreateMode
            ? []
            : selectedRoom.members
                .filter(({ user }) => user._id !== authUser._id)
                .map(({ user }) => user)
    );


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
        if (!groupName.trim() || !selectedUsers.length) return;
        if (isCreateMode) {
            createGroup(selectedUsers, groupName, groupImage)
        } else {
            updateGroup(selectedUsers, groupName, groupImage)
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
        return () => setSelectedUsers([])
    }, [])
    if (!allPrivateChat.length) 
       return <div className="text-center text-xl">ابتدا مخاطب پیدا کنید</div>
    
    return (

        <div className="w-full max-w-md mx-auto px-5 rounded-2xl ">
            {/* Header: Selected Users */}
            {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 mb-4 border-b border-white/40 ">
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
                            <span className="text-xs mt-1 text-gray-700 dark:text-gray-200 truncate max-w-[60px]">
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            نام گروه
                        </label>
                        <input
                            type="text"
                            ref={groupNameRef}
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800 p-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="نام گروه"
                        />
                    </div>

                    <ImageUploader
                        setImage={setGroupImage}
                        inputRef={imageInputRef}
                    />
                    {groupImage
                        ?
                        <div className="relative">
                            <ChatIcon
                                profile={groupImage}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        انتخاب اعضای گروه
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-52 overflow-y-auto overflow-x-hidden p-1">
                        {allPrivateChat.map(({ members }) => {

                            const isSelected = selectedUsers.some((u) => u._id === members.user._id)

                            return (
                                <div
                                    key={members.user._id}
                                    onClick={() => toggleUser(members.user)}
                                    className={`cursor-pointer flex items-center gap-2 p-2 rounded-xl border transition-all duration-200  ${isSelected
                                        ? "border-indigo-500 hover:bg-indigo-800/50 dark:bg-indigo-800/30"
                                        : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                        }`}
                                >

                                    <ChatIcon
                                        profile={members.user?.profilePic}
                                        name={members.user.name}
                                        classProps="size-9"
                                    />

                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {members.user.name.length > 6
                                            ? members.user.name.slice(0, 6).concat('...')
                                            : members.user.name
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit */}
                <button
                    disabled={!selectedUsers.length || !groupName}
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-indigo-600  disabled:bg-gray-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                >
                    {isCreateMode ? "ایجاد گروه" : "ادیت گروه"}
                </button>
            </form>
        </div>

    );
}
export default GroupForm