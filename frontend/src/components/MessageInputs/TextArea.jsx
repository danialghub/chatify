import React, { useEffect, useRef, useState } from "react";

export default function TextArea({
  value,
  onChange,
  maxRows = 5,
  taRef,
  setOpen,
  ...rest
}) {

  const containerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(null);

  // =============================
  // Measure max height
  // =============================
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;

    const prevOverflow = ta.style.overflowY;
    const prevHeight = ta.style.height;

    ta.style.height = "auto";
    ta.rows = 1;
    ta.style.overflowY = "hidden";

    const singleRowHeight = ta.scrollHeight;
    const paddingOffset =
      (parseFloat(getComputedStyle(ta).paddingTop) || 0) +
      (parseFloat(getComputedStyle(ta).paddingBottom) || 0);

    const computedMax = singleRowHeight * maxRows + paddingOffset;
    setMaxHeight(Math.ceil(computedMax));

    ta.style.height = prevHeight;
    ta.style.overflowY = prevOverflow;
  }, [maxRows]);

  // =============================
  // adjust height
  // =============================
  const adjustHeight = () => {
    const ta = taRef.current;
    if (!ta) return;

    ta.style.height = "auto";

    if (!maxHeight) {
      ta.style.height = ta.scrollHeight + "px";
      ta.style.overflowY = "hidden";
      return;
    }

    const desired = ta.scrollHeight;

    if (desired > maxHeight) {
      ta.style.height = maxHeight + "px";
      ta.style.overflowY = "auto";
    } else {
      ta.style.height = desired + "px";
      ta.style.overflowY = "hidden";
    }
  };

  useEffect(() => {
    // prevent flicker: run after 2 animation frames
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        adjustHeight();
      });
    });
  }, [value, maxHeight]);

  // =============================
  // Smooth keyboard handling (fix jumping)
  // =============================
  const smoothKeyboardFix = () => {
    const vv = window.visualViewport;
    if (!vv) return;

    setOpen(false)
    let last = vv.height;
    const ta = taRef.current;

    const check = setInterval(() => {
      if (Math.abs(last - vv.height) < 2) {
        clearInterval(check);
        requestAnimationFrame(() => {
          try {
            ta?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          } catch { }
        });
      }
      last = vv.height;
    }, 30);

    setTimeout(() => clearInterval(check), 200);
  };

  // =============================
  // visualViewport padding
  // =============================
  useEffect(() => {
    const container = containerRef.current || document.body;
    const vv = window.visualViewport;
    let initialPad = container.style.paddingBottom || "";

    function updatePad() {
      if (!vv) return;

      const keyboardHeight = Math.max(
        0,
        window.innerHeight - vv.height - (vv.offsetTop || 0)
      );

      container.style.paddingBottom = keyboardHeight
        ? `${keyboardHeight}px`
        : initialPad;
    }

    if (vv) {
      vv.addEventListener("resize", updatePad);
      vv.addEventListener("scroll", updatePad);
    } else {
      window.addEventListener("resize", updatePad);
    }

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updatePad);
        vv.removeEventListener("scroll", updatePad);
      } else {
        window.removeEventListener("resize", updatePad);
      }
      container.style.paddingBottom = initialPad;
    };
  }, []);


  // =============================
  // Handle change
  // =============================
  const handleChange = (e) => {
    onChange?.(e);
    requestAnimationFrame(adjustHeight);
  };

  return (
    <div ref={containerRef} className={`w-full`}>
      <textarea
        {...rest}
        ref={taRef}
        value={value}
        onChange={handleChange}
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
        onFocus={smoothKeyboardFix}
      />
    </div>
  );
}
