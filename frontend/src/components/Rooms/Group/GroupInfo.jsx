import React, { useState } from 'react'
import { ChatIcon } from '@/components/index'
import { X, Edit, LogOut, UserPlus, Trash } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from '@/store/useRoomStore';
import { useChatStore } from '@/store/useChatStore';

const GroupInfo = () => {
    const [activeTab, setActiveTab] = useState("members");

    const { onlineUsers, authUser } = useAuthStore();
    const { setModalType } = useChatStore()
    const { leaveingTheGroup, selectedRoom: room, removeRoom } = useRoomStore();

    const media = [
        { id: 1, src: "https://picsum.photos/200?random=1" },
        { id: 2, src: "https://picsum.photos/200?random=2" },
        { id: 3, src: "https://picsum.photos/200?random=3" },
        { id: 4, src: "https://picsum.photos/200?random=4" },
        { id: 5, src: "https://picsum.photos/200?random=5" },
        { id: 6, src: "https://picsum.photos/200?random=6" },
        { id: 7, src: "https://picsum.photos/200?random=7" },
        { id: 8, src: "https://picsum.photos/200?random=8" },
    ];

    const visibleMembers = room?.members?.slice(0, 6);
    const isOwner = room.createdBy === authUser._id


    const visibleMedia = media.slice(0, 9);



    return (
        <div className="  flex items-center justify-center ">
            <div className="bg-white w-[400px] rounded-2xl overflow-hidden shadow-xl flex flex-col">
                {/* Header */}
                <div className="bg-blue-700/80  text-white p-4 relative flex flex-col items-center">
                    {isOwner && (
                        <button
                            onClick={() => setModalType("groupEdit")}
                            className="absolute top-3 right-3 hover:bg-blue-700 p-2 rounded-full">
                            <Edit size={18} />
                        </button>
                    )}

                    <ChatIcon
                        profile={room?.logo}
                        name={room?.name}
                        classProps="size-20 rounded-full border-4 border-white mb-2"
                    />
                    <h2 className="text-lg font-semibold text-center">
                        {room?.name}
                    </h2>
                    <p dir="rtl" className="text-sm text-blue-100">{room?.members?.length} عضو</p>

                    <button
                        onClick={() => setModalType(null)}
                        className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 rounded-full p-2">
                        <X size={18} />
                    </button>

                    <div className="flex items-center justify-center w-full gap-3 pt-4">
                        {/* Buttons */}
                        <div className="flex justify-center py-1 border-b-2 bg-black/10  hover:bg-black/20 rounded-md flex-1 transition">
                            {isOwner
                                ? <button
                                    onClick={() => removeRoom(room)}
                                    className="flex items-center gap-2  text-white font-medium px-4 py-2  ">
                                    <Trash size={18} />
                                    حذف گروه
                                </button>
                                : <button
                                    onClick={() => leaveingTheGroup(room._id)}
                                    className="flex items-center gap-2  text-white font-medium px-4 py-2  ">
                                    <LogOut size={18} />
                                    ترک گروه
                                </button>
                            }
                        </div>

                        {/* Add Members */}
                        <div className="flex justify-center py-1 border-b-2  bg-black/10 hover:bg-black/20 rounded-md flex-1 transition">
                            <button
                                onClick={() => setModalType('AddMembers')}
                                className="flex items-center gap-2  font-medium  px-4 py-2 ">
                                <span className="text-2xl leading-none"><UserPlus size={20} /></span> عضویت
                            </button>
                        </div>
                    </div>


                </div>


                {/* Tabs */}
                <div className="flex border-b text-sm bg-gray-50">
                    <button
                        className={`flex-1 py-2 font-medium transition ${activeTab === "members"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                            : "text-gray-500 hover:bg-gray-200"
                            }`}
                        onClick={() => setActiveTab("members")}
                    >
                        اعضاء
                    </button>
                    <button
                        className={`flex-1 py-2 font-medium transition ${activeTab === "media"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                            : "text-gray-500 hover:bg-gray-100"
                            }`}
                        onClick={() => setActiveTab("media")}
                    >
                        رسانه
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 py-1 max-h-[40vh] min-h-[40vh] overflow-y-auto text-black/50">
                    {activeTab === "members" ? (
                        <div className="divide-y">
                            {visibleMembers && visibleMembers.map((user) => {

                                const isOnline = onlineUsers.includes(user._id)

                                return (
                                    <div
                                        key={user._id}
                                        className={`flex items-center gap-2 p-3 hover:bg-gray-200/50 transition`}
                                    >

                                        <div className={`avatar ${isOnline ? "online" : "offline"} `}>

                                            <ChatIcon
                                                profile={user?.profilePic}
                                                name={user.name}
                                                classProps="!size-12"

                                            />

                                        </div>
                                        <div className="flex-1 ">
                                            <p className="font-medium text-left">{user.name === authUser.name
                                                ? "You" :
                                                user.name
                                            }
                                            </p>

                                            <p className={`text-xs ${isOnline ? "text-green-600" : "text-slate-500"}`}>{isOnline ? "آنلاین" : "آفلاین"}</p>
                                        </div>
                                        {room.createdBy === user._id &&
                                            <span
                                                className="text-xs text-center font-semibold text-purple-600"
                                            >
                                                مالک
                                            </span>
                                        }
                                    </div>
                                )
                            })}
                            {room.members.length > 6 && (
                                <div className="text-center text-sm text-gray-400 py-2">
                                    +{room.members.length - 6} رسانه بیشتر
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 p-3 max-h-[40vh] min-h-[40vh] overflow-y-auto">
                            {visibleMedia.map((m) => (
                                <a href={m.src} target='_blank'>
                                    <img
                                        key={m.id}
                                        src={m.src}
                                        alt="media"
                                        className="rounded-lg object-cover w-full h-24 cursor-pointer hover:opacity-80 transition"
                                    />
                                </a>
                            ))}
                            {media.length > 9 && (
                                <div className="col-span-3 text-center text-sm text-gray-400 py-1">
                                    +{media.length - 9} مدیا بیشتر
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GroupInfo