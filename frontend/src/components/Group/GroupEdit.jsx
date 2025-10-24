import React, { useState } from 'react'
import { X, ArrowLeft, Pen } from "lucide-react";
import { ChatIcon } from '../index'
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useChatStore } from '../../store/useChatStore';

const GroupEdit = () => {


    const { authUser } = useAuthStore();
    const { selectedRoom: room } = useRoomStore()
    const { setModalType } = useChatStore()

    const [kickedUsers, setKickedUsers] = useState([])
    const [groupName, setGroupName] = useState(room.name)
    const [groupLogo, setGroupLogo] = useState(room?.logo || '')

    const visibleMembers = room.members.slice(0, 6);
    const removeUser = (id) => {
        setKickedUsers(prev => [...prev, id])
    }
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            const base64Image = reader.result;
            setGroupLogo(base64Image)
        };
    };
    return (


        <div className="  flex items-center justify-center ">
            <div className="bg-white w-[400px] rounded-2xl overflow-hidden shadow-xl flex flex-col">
                {/* Header */}
                <div className="bg-blue-700/80  text-white p-4 relative flex flex-col items-center">
                    <div className='relative'>
                        <ChatIcon
                            profile={groupLogo}
                            name={groupName || room.name}
                            classProps="size-20 max-h-20  border-4 border-white mb-2"
                            className=""
                        />
                        <label
                            htmlFor='logo'
                            className='absolute -top-2 p-1 bg-zinc-900 right-0 rounded-full text-white cursor-pointer'>

                            <input
                                type="file"
                                accept="image/*"
                                id='logo'
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            <Pen size={16} />
                        </label>
                    </div>
                    <input
                        type="text"
                        onChange={e => setGroupName(e.target.value)}
                        placeholder="نام گروه"
                        value={groupName}
                        className="mt-2 w-2/3 rounded-xl border border-white/20 bg-white/10 
                 text-white px-4  py-2 text-sm  
                 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent 
                 backdrop-blur-md transition-all duration-300"/>



                    <button
                        onClick={() => setModalType("groupInfo")}
                        className="absolute top-3 left-3 hover:bg-blue-700 p-2 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                </div>



                {/* Content */}
                <div className=" flex-1 py-1 max-h-[50vh]  overflow-y-auto text-black/80">
                    <h3 className='p-1 px-2 border-b-2 text-right'>اعضاء</h3>
                    <div className="flex items-center flex-wrap gap-3 gap-y-6  p-2 mb-4  ">

                        {visibleMembers && visibleMembers.map(({ user, role }) => {

                            return user._id !== authUser._id && (
                                <div
                                    key={user._id}
                                    className="relative  flex flex-col items-center min-w-[64px] "
                                >

                                    <ChatIcon
                                        profile={user?.profilePic}
                                        name={user.name}
                                        classProps="size-12"

                                    />


                                    <button
                                        onClick={() => removeUser(user.id)}
                                        className="absolute -top-1 -right-1 z-50 bg-red-500 hover:bg-red-600 text-white p-[2px] rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                    <span className="text-xs mt-1 text-gray-700  truncate max-w-[60px]">
                                        {user.name}
                                    </span>
                                </div>
                            )
                        }
                        )}
                    </div>
                </div>

                {/* footer */}
                <div
                    className='bg-gray-700/80 p-4 text-center flex items-center justify-center gap-3'>
                    <button className='px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 rounded'>ذخیره تغییرات</button>
                    <button
                        onClick={() => setModalType('groupInfo')}
                        className='px-4 py-2 bg-zinc-600 text-zinc-200 hover:bg-zinc-700 transition-colors duration-200 rounded'>لغو</button>

                </div>

            </div>
        </div>

    );
}

export default GroupEdit