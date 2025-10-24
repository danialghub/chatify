import { memo } from 'react';

const ChatIcon = memo(({ profile, name, classProps, ...props }) => {

    if (!name && !profile) return;

    return (

        profile ?
            <div className="rounded-full w-12" {...props}>
                <img
                    src={profile}
                    alt={name}
                    className={`${classProps} size-12 rounded-full object-cover max-h-12 `}
                />
            </div>
            :
            <span
                {...props}
                className={`${classProps} size-10 rounded-full  text-2xl flex items-center justify-center pt-2 bg-indigo-100 text-indigo-600`}>{name[0].toUpperCase()}</span>

    )
}
)
export default ChatIcon