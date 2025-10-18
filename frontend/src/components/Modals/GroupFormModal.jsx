import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Modal, ChatIcon } from '../index'
import { useRoomtStore } from "../../store/useRoomStore";


const GroupFormModal = ({ isOpen, onClose }) => {

    const groupNameRef = useRef(null)
    const [groupName, setGroupName] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { allPrivateChat, createGroup } = useRoomtStore()

    const toggleUser = (user) => {
        setSelectedUsers((prev) =>
            prev.some((u) => u._id === user._id)
                ? prev.filter((u) => u._id !== user._id)
                : [...prev, user]
        );
    };

    const removeUser = (id) => setSelectedUsers((prev) => prev.filter((u) => u.id !== id));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupName.trim() || !selectedUsers.length) return;

        createGroup(selectedUsers, groupName)

    };
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                groupNameRef.current.focus()
            }, 50);
        }
        return () => setSelectedUsers([])
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="ایجاد گروه جدید"
        >
            <div className="w-full max-w-md mx-auto p-5 rounded-2xl ">
                {/* Header: Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 mb-4 border-b border-white/40 ">
                        {selectedUsers.map((user) => (
                            <div
                                key={user._id}
                                className="relative  flex flex-col items-center min-w-[64px] "
                            >
                                <ChatIcon
                                    profile={user?.profilePic}
                                    name={user.name} />
                                <button
                                    onClick={() => removeUser(user.id)}
                                    className="absolute -top-1 -right-1 z-50 bg-red-500 hover:bg-red-600 text-white p-[2px] rounded-full"
                                >
                                    <X size={16} />
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
                                placeholder="مثلاً گروه دوستان"
                            />
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <img src="/avatar.png" className="size-12 rounded-full" alt="logo" />
                            <label htmlFor="logo" >
                                <input id="logo" type="file" hidden name="myImage" accept="image/*" />
                                <span className="px-2 py-1 text-sm text-blue-500 bg-blue-100 rounded">انتخاب </span>
                            </label>

                        </div>



                    </div>

                    {/* Contact List */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            انتخاب اعضای گروه
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-52 overflow-y-auto overflow-x-hidden p-1">
                            {allPrivateChat.map(({ user }) => {
                                const isSelected = selectedUsers.some((u) => u._id === user._id);

                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUser(user)}
                                        className={`cursor-pointer flex items-center gap-2 p-2 rounded-xl border transition-all duration-200  ${isSelected
                                            ? "border-indigo-500 hover:bg-indigo-800/50 dark:bg-indigo-800/30"
                                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            }`}
                                    >

                                        <ChatIcon
                                            profile={user?.profilePic}
                                            name={user.name}
                                            classProps="size-9"
                                        />

                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {user.name.length > 6
                                                ? user.name.slice(0, 6).concat('...')
                                                : user.name
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
                        ایجاد گروه
                    </button>
                </form>
            </div>
        </Modal>
    );
}
export default GroupFormModal