import { useState } from "react";
import { useRoomStore } from '@/store/useRoomStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useChatStore } from '@/store/useChatStore'
import { X, Check, Search, LoaderIcon } from "lucide-react";
import { ChatIcon } from "@/components/index";



const AddMembers = () => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [search, setSearch] = useState("");

    const { addMembers, privateRooms, selectedRoom, isJoining } = useRoomStore()
    const { onlineUsers, authUser } = useAuthStore()
    const { openModal } = useChatStore()

    const toggleMember = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const groupMemberIds = selectedRoom.members.map(m => m._id)
    const filteredContacts = privateRooms.filter((r) => {
        const user = r.members.filter(m => m._id !== authUser._id && !groupMemberIds.includes(m._id))[0]
        return user?.name.toLowerCase().includes(search.toLowerCase())
    });

    return (
        <div className="flex items-center justify-center">
            <div className="bg-white w-[400px] rounded-2xl overflow-hidden shadow-lg flex flex-col border border-gray-100">

                {/* Header */}
                <div className="bg-blue-500/90 text-white p-4 flex items-center justify-between shadow-sm">
                    <button
                        onClick={() => openModal('GroupInfo')}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                    >
                        <X size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-center flex-1">افزودن اعضا</h2>
                    <div className="w-8" />
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b bg-gray-50/80 flex items-center gap-2">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="جستجوی مخاطب..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                    />
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto max-h-[50vh] divide-y divide-gray-100">
                    {filteredContacts.length ? (
                        filteredContacts.map((r) => {
                            const user = r.members.filter(m => m._id !== authUser._id)[0]
                            const isOnline = onlineUsers.includes(user._id)
                            const isSelected = selectedMembers.includes(user._id)

                            return (
                                <div
                                    onClick={() => toggleMember(user._id)}
                                    key={user._id}
                                    className="flex items-center justify-between p-3 hover:bg-blue-50 transition cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                                            <ChatIcon
                                                profile={user.profilePic}
                                                name={user.name}
                                                classProps="!size-12"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{user.name}</p>
                                            <p className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                                                {isOnline ? "آنلاین" : "آفلاین"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Custom Checkbox */}
                                    <button

                                        className={`w-6 h-6 flex items-center justify-center border-2 rounded-md transition 
                    ${isSelected
                                                ? "bg-blue-500 border-blue-500"
                                                : "border-gray-300 hover:border-blue-400 bg-white/60"
                                            }`}
                                    >
                                        {isSelected && <Check size={16} className="text-white" />}
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-6">مخاطبی یافت نشد</p>
                    )}
                </div>

                {/* Confirm Button */}
                <div className="p-4 bg-gray-50/80 border-t">
                    <button
                        disabled={!selectedMembers.length || isJoining}
                        onClick={() => addMembers(selectedMembers, selectedRoom._id)}
                        className={`w-full py-2.5 rounded-xl font-medium text-white transition
            ${selectedMembers.length
                                ? "bg-blue-500 hover:bg-blue-600 shadow-sm"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isJoining
                            ? <div className="flex items-center justify-center">
                                <LoaderIcon className="animate-spin" />
                            </div>
                            :
                            `تایید(${selectedMembers.length})`
                        }
                    </button>
                </div>
            </div>
        </div>
    );

}


export default AddMembers