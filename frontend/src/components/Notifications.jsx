import { useState } from 'react'
import { Check, X, Bell } from "lucide-react";
import { useRequestStore } from '../store/useRequestStore';

const Notifications = () => {

    const { allRequests, responseToRequest } = useRequestStore()
    const [open, setOpen] = useState(false);

    return (
        <div className='absolute right-2 top-2'>
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className=" p-2 rounded-full hover:bg-slate-200 transition "
            >
                <Bell className="w-6 h-6 text-slate-500" />

                {allRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {allRequests.length}
                    </span>
                )}
            </button>

            <div
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className={` absolute bottom-12 right-4  md:left-8 mt-3 w-72 bg-slate-950 border border-slate-700 rounded-2xl shadow-xl transition-all duration-300 ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-90 invisible  "
                    }`}
            >
                <div className="p-3">
                    {allRequests.length > 0 && (
                        <h3 className="text-sm font-semibold text-slate-500 mb-2">
                            درخواست‌های جدید
                        </h3>
                    )}
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        {allRequests.length === 0 ? (
                            <p className="text-center text-slate-400 text-lg py-4">
                                درخواستی وجود ندارد
                            </p>
                        ) : (
                            allRequests.map((req) => (
                                <div
                                    key={req._id}
                                    className="flex items-center justify-between bg-slate-900 hover:bg-slate-800 rounded-xl p-2 transition cursor-pointer"
                                >
                                    {/* left Side */}
                                    <div className="flex items-center gap-3">

                                        {/* profilePicture */}
                                        {req.from.profilePic ? (
                                            <img
                                                src={req.from.profilePic}
                                                alt={req.from.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <span
                                                className='w-10 h-10 rounded-full bg-indigo-100 text-2xl flex items-center justify-center font-bold text-indigo-500'>
                                                {req.from.name[0].toUpperCase()}
                                            </span>
                                        )}

                                        {/* user name */}
                                        <span className="text-slate-500 text-sm font-medium">
                                            {req.from.name}
                                        </span>
                                    </div>
                                    
                                    {/* right Side */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => responseToRequest(req._id, "Accepted")}
                                            className="p-1.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => responseToRequest(req._id, "Rejected")}
                                            className="p-1.5 rounded-full bg-red-700 text-white hover:bg-red-600 transition">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>

    );
}

export default Notifications