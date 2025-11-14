import React, { useEffect, useRef, useState } from "react";

export default function TextArea({
  value,
  onChange,
  maxRows = 5,
  taRef,
  ...rest
}) {

  const containerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(null);


  const resize = () => {
    const ta = taRef.current;
    if (!ta) return;

    // ریست برای محاسبه صحیح scrollHeight
    ta.style.height = "auto";

    // ارتفاع یک خط = scrollHeight زمانی که rows = 1
    const lineHeight = parseInt(getComputedStyle(ta).lineHeight, 10);
    const maxHeight = lineHeight * maxRows;

    // ارتفاع واقعی متن
    const desired = ta.scrollHeight;

    // اعمال محدودیت
    if (desired > maxHeight) {
      ta.style.height = maxHeight + "px";
      ta.style.overflowY = "auto";
    } else {
      ta.style.height = desired + "px";
      ta.style.overflowY = "hidden";
    }
  };

  // هنگام تغییر value
  useEffect(() => {
    resize();
  }, [value]);

  // برای اولین رندر
  useEffect(() => {
    window.visualViewport.addEventListener('resize', () => {
      containerRef.current.scrollIntoView({ block: "center" })
    })
    resize();
  }, []);

  return (
    <div ref={containerRef} className={`w-full`}>
      <textarea
        {...rest}
        ref={taRef}
        dir="auto"
        value={value}
        onChange={onChange}
        rows={1}
        inputMode="text"
        aria-label={rest["aria-label"] || "message input"}
        className={`w-full  resize-none  outline-none block mx-1 px-3  text-sm placeholder-slate-400 bg-transparent text-white/80 input-scrollbar focus:border-slate-500 `}
        style={{
          height: "auto",
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
        }}

      />
    </div>
  );
}
