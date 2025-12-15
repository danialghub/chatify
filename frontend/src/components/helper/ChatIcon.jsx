import { memo } from "react";

const ChatIcon = memo(({ profile, name, classProps = "", ...props }) => {
  if (!name && !profile) return null;

  const isEnglish = /^[A-Za-z]/.test(name?.[0] || "");
  const translateY = isEnglish ? "pt-1.5" : "";

  return (
    <div
      {...props}
      className={`
        ${classProps}
        
        rounded-full
        shrink-0
        flex
        items-center
        justify-center
      
        bg-indigo-100
        text-indigo-600
      `}
    >
      {profile ? (
        <img
          src={profile}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className={`text-2xl font-medium leading-none ${translateY}`}
        >
          {name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
});

export default ChatIcon;
