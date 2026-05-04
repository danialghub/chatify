import React, { useEffect, useRef, useState } from 'react'
import { ChatIcon } from '@/components/index'
import { X, Edit, LogOut, UserPlus, Trash, MessageCircle, Copy } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from '@/store/useRoomStore';
import { useChatStore } from '@/store/useChatStore';
import { useSmartFileHandler } from '@/hooks/useSmartFileHandler';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router';

const Content = ({ isGroup, activeTab, informations }) => {

    const { authUser, onlineUsers } = useAuthStore()
    const { openModal, messages } = useChatStore()
    const { privateRooms } = useRoomStore()

    const visibleMembers = isGroup && informations.members;
    const targetPvRoom = !isGroup && privateRooms.find(room => room.members.find(pv => pv._id === informations._id))

    return (
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
                                        onClick={
                                            () => openModal('RoomInfo', { isGroup: false, informations: user })
                                        }

                                    />

                                </div>
                                <div className="flex-1 ">
                                    <p className="font-medium text-left">{informations.name === authUser.name
                                        ? "You" :
                                        user.name
                                    }
                                    </p>

                                    <p className={`text-xs ${isOnline ? "text-green-600" : "text-slate-500"}`}>{isOnline ? "آنلاین" : "آفلاین"}</p>
                                </div>
                                {informations.createdBy === user._id &&
                                    <span
                                        className="text-xs text-center font-semibold text-purple-600"
                                    >
                                        مالک
                                    </span>
                                }
                            </div>
                        )
                    })}

                </div>
            ) : false && (
                <div className="grid grid-cols-3 gap-2 p-3 ">
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
    )
}


const RoomInfo = ({ isGroup, informations }) => {
    const [activeTab, setActiveTab] = useState("members");
    const [showMore, setShowMore] = useState(false)

    const infoModalRef = useRef(null)
    // const [informations, setInformations] = useState(null)
    const navigate = useNavigate()
    const { authUser } = useAuthStore();
    const { openModal, messages } = useChatStore()
    const { leaveingTheGroup, removeRoom, getUserOrGroupInfo, privateRooms, createRoom } = useRoomStore();

    const { onlineUsers } = useAuthStore();

    if (informations._id === authUser._id) return navigate('/edit')

    // const media = messages
    //     .filter(msg => msg?.file?.type === "image")
    //     .map((msg, id) => ({ id, src: msg?.file?.url }))

    // const files = messages
    //     .filter(msg => msg?.file?.type !== "image")
    //     .map((msg, id) => ({ id, src: msg?.file }))


    const isOwner = isGroup && informations.createdBy === authUser._id


    // const visibleMedia = media.slice(0, 9);

    const Groupinfos = [
        { title: "توضیحات", content: "..." },
        { title: "لینک", content: "seniors" },
    ]
    console.log(informations);

    const Pvinfos = [
        { title: "نام کاربری", content: informations.userName },
        { title: "توضیحات", content: informations.bio || "" },
    ]

    const pv = privateRooms.find(room => room.members.find(pv => pv._id == informations._id)) || null

    const infos = isGroup ? Groupinfos : Pvinfos
    const groupInfoBtns = [
        { title: "پیام", icon: <MessageCircle size={20} />, callBack: () => openModal(null) },
        {
            title: isOwner ? "حذف گروه" : "ترک گروه",
            icon: isOwner ? <Trash size={20} /> : <MessageCircle size={20} />,
            callBack: isOwner
                ? () => openModal('Alert', { title: "حذف گروه", onComplete: () => removeRoom(informations), size: "sm" })
                : () => openModal('Alert', { title: "ترک گروه", onComplete: () => leaveingTheGroup(informations._id), size: "sm" })  // اضافه کردن () =>
        },
        { title: "عضویت", icon: <UserPlus size={22} />, callBack: () => openModal('AddMembers') },  // دابل تابع
    ]



    const pvInfoBtns = [
        {
            title: "پیام",
            icon: <MessageCircle size={20} />,
            callBack: () => {
                createRoom({ isGroup: false, memberIds: [informations._id] }, informations._id)
                openModal(null)
            }
        },
        {
            title: "حذف گفتگو",
            icon: <Trash size={20} />,
            callBack: () => {
                openModal(
                    'Alert',
                    {
                        title: "حذف گفتگو",
                        onComplete: () => removeRoom(pv),
                        size: "sm",
                    })
            }
        },
    ].filter(btn => btn.title !== "حذف گفتگو" || pv)
    const infoBtns = isGroup ? groupInfoBtns : pvInfoBtns

    const logo = isGroup ? informations.logo : informations.profilePic


    const englishExpr = /^[A-Za-z]/;


    useEffect(() => {
        if (infoModalRef?.current) {
            infoModalRef.current.scrollTop = 0;
        }
    }, [infoModalRef?.current])



    return informations && (
        <div className="  flex items-center justify-center ">
            <div
                ref={infoModalRef}
                className="bg-white w-[400px]  max-h-[60vh] sm:max-h-[70vh] custom-scroll  rounded-2xl overflow-auto shadow-xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/90 to-blue-950/90  text-white p-4 px-2 relative flex flex-col items-center">
                    {isGroup && isOwner && (
                        <button
                            onClick={() =>
                                openModal(
                                    "GroupEdit",
                                    { title: "ادیت گروه", state: "edit" })
                            }
                            className="absolute top-3 right-3 hover:bg-blue-700/30 p-2 rounded-full">
                            <Edit size={18} />
                        </button>
                    )}

                    <ChatIcon
                        profile={logo}
                        name={informations.name}
                        classProps="size-20 rounded-full border-4 border-white mb-2"
                    />
                    <h2 className="text-lg font-semibold text-center">
                        {informations.name}
                    </h2>
                    <p dir="rtl" className="text-sm text-blue-100">
                        {isGroup
                            ? `${informations?.members?.length}عضو`
                            : onlineUsers.includes(informations._id) ? "آنلاین" : "آفلاین"
                        }
                    </p>

                    <button
                        onClick={() => openModal(null)}
                        className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 rounded-full p-2 ">
                        <X size={18} />
                    </button>

                    <div className="flex items-center justify-center w-full gap-1.5 pt-4 text-sm">

                        {/* Buttons */}
                        {infoBtns.map((btn, id) => (
                            <div
                                key={id}
                                onClick={btn.callBack}
                                className="flex justify-center py-1 border-b-2  bg-black/10 hover:bg-black/20 rounded-lg flex-1 transition">
                                <button
                                    className="flex items-center gap-1  font-medium   py-1  flex-col">
                                    <span className="leading-none">
                                        {btn.icon}
                                    </span>
                                    <span>{btn.title}</span>
                                </button>
                            </div>
                        ))

                        }

                    </div>
                    {/* information */}
                    <div className='bg-gradient-to-r from-slate-800/30 to-slate-900/30  rounded-lg w-full mt-5 flex flex-col gap-4 px-3 py-2'>
                        {
                            infos.map((info, id) => (
                                <div
                                    key={id}
                                    className='relative group'>
                                    <div
                                        className='flex flex-col justify-items-start'>
                                        <p
                                        
                                            className={`
    text-sm break-words whitespace-pre-line [unicode-bidi:plaintext]
    overflow-hidden transition-all duration-500 ease-in-out
    ${showMore
                                                    ? "max-h-[500px]"   // به اندازه کافی بزرگ برای کل متن
                                                    : "max-h-[3rem] line-clamp-2"  // خط-کلمپ فقط برای حالت بسته
                                                }
  `}
                                        >
                                            {info.content}
                                        </p>
                                        <div className=' relative'>

                                            {
                                                !showMore && info.title === "توضیحات" &&
                                                info.content.length > 93
                                                && (
                                                    <button
                                                        onClick={() => setShowMore(true)}
                                                        className={`bg-slate-900/90 py-2 px-3 rounded text-slate-200 absolute bottom-6 
                                                        ${englishExpr.test(info.content || "") ? "right-0" : "left-0"}  text-sm z-20`}>
                                                        بیشتر
                                                    </button>
                                                )
                                            }

                                            <span className='text-slate-100/40 text-[11px]'>{info.title}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(info.content)}
                                        className='absolute -bottom-3 right-6 px-2 py-1  items-center justify-center gap-3 bg-slate-900/60 text-slate-100/60 z-10 rounded hidden group-hover:flex text-sm'>
                                        <Copy size={16} /> copy
                                    </button>
                                </div>
                            ))
                        }
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
                    {<button
                        className={`flex-1 py-2 font-medium transition ${activeTab === "media"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                            : "text-gray-500 hover:bg-gray-100"
                            }`}
                        onClick={() => setActiveTab("media")}
                    >
                        رسانه
                    </button>}
                </div>

                {
                    /* Content */
                    <Content

                        isGroup={isGroup}
                        activeTab={activeTab}
                        informations={informations}
                    />
                }
            </div>
        </div>
    )
}

export default RoomInfo