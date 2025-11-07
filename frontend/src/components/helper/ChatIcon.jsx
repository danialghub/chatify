import { memo } from 'react';

const ChatIcon = memo(({ profile, name, classProps, ...props }) => {

    if (!name && !profile) return;
    
    const isEnglish = /^[A-Za-z]/.test(name?.[0] || "");
    const translateY = isEnglish ? "pt-1.5" : ""; // فقط برای انگلیسی

    return (

        profile ?
            <div className="rounded-full" {...props}>
                <img
                    src={profile}
                    alt={name}
                    className={`${classProps} size-12 rounded-full object-cover  `}
                />
            </div>
            :
            <span
                {...props}
                className={`${classProps} size-12 rounded-full text-2xl flex items-center justify-center bg-indigo-100 text-indigo-600 leading-none ${translateY}`}
            >
                {name[0].toUpperCase()}
            </span>

    )
}
)
export default ChatIcon