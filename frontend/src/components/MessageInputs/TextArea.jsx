import React, { useEffect, useRef, useState } from "react";

export default function TextArea({
  value,
  onChange,
  placeholder = "",
  maxRows = 5,
  className = "",
  textareaClassName = "",
  ...rest
}) {
  const taRef = useRef(null);
  const containerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(null);

  // Calculate maxHeight based on a single-row height measurement
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;

    // Save current
    const prevOverflow = ta.style.overflowY;
    const prevHeight = ta.style.height;

    // Temporarily force single row to measure line height
    ta.style.height = "auto";
    ta.rows = 1;
    ta.style.overflowY = "hidden";

    // Use scrollHeight as single-row height approximation
    const singleRowHeight = ta.scrollHeight;
    const paddingOffset = (parseFloat(getComputedStyle(ta).paddingTop) || 0) + (parseFloat(getComputedStyle(ta).paddingBottom) || 0);

    const computedMax = singleRowHeight * maxRows + paddingOffset;
    setMaxHeight(Math.ceil(computedMax));

    // restore
    ta.style.height = prevHeight;
    ta.style.overflowY = prevOverflow;
  }, [maxRows]);

  // Adjust height when value changes (or on user input)
  const adjustHeight = () => {
    const ta = taRef.current;
    if (!ta) return;

    // reset to measure
    ta.style.height = "auto";

    if (!maxHeight) {
      // fallback: use scrollHeight
      ta.style.height = ta.scrollHeight + "px";
      ta.style.overflowY = "hidden";
      return;
    }

    const desired = ta.scrollHeight;
    if (desired > maxHeight) {
      ta.style.height = maxHeight + "px";
      ta.style.overflowY = "auto"; // enable internal scroll when exceeding max rows
    } else {
      ta.style.height = desired + "px";
      ta.style.overflowY = "hidden";
    }
  };

  // run on mount and whenever value changes
  useEffect(() => {
    adjustHeight();
  }, [value, maxHeight]);

  // hook mobile virtual keyboard: when visualViewport changes, add padding to container
  useEffect(() => {
    const container = containerRef.current || document.body;
    const vv = window.visualViewport;
    let initialPaddingBottom = container.style.paddingBottom || "";

    function updatePad() {
      if (!vv) return;
      // keyboard height = layout viewport height - visual viewport height
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      container.style.paddingBottom = keyboardHeight ? `${keyboardHeight}px` : initialPaddingBottom;

      // also ensure textarea is visible when focused
      const ta = taRef.current;
      if (ta && document.activeElement === ta) {
        // scroll textarea into view (nearest) so caret is visible
        setTimeout(() => {
          try { ta.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { /* ignore */ }
        }, 50);
      }
    }

    if (vv) {
      vv.addEventListener('resize', updatePad);
      vv.addEventListener('scroll', updatePad);
    } else {
      // Fallback for browsers without visualViewport: listen to window resize
      window.addEventListener('resize', updatePad);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updatePad);
        vv.removeEventListener('scroll', updatePad);
      } else {
        window.removeEventListener('resize', updatePad);
      }
      // restore padding
      container.style.paddingBottom = initialPaddingBottom;
    };
  }, []);

  // Compose onChange handler so parent still receives events
  const handleChange = (e) => {
    if (onChange) onChange(e);
    // adjust after react state update (next tick) - using setTimeout 0 ensures DOM updated
    requestAnimationFrame(adjustHeight);
  };

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <textarea
        {...rest}
        ref={taRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={1}
        // accessibility + mobile optimizations
        inputMode="text"
        aria-label={rest['aria-label'] || 'message input'}
        className={`w-full block resize-none leading-normal outline-none rounded-md px-3 text-sm placeholder-slate-400 transition-shadow focus:ring-0 bg-transparent ${textareaClassName}`}
        style={{
          height: 'auto',
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
        onFocus={() => {
          // small delay to ensure keyboard metrics updated on some devices
          setTimeout(() => {
            const ta = taRef.current;
            if (ta) try { ta.scrollIntoView({ block: 'nearest' }); } catch (e) { }
            adjustHeight();
          }, 120);
        }}
      />
    </div>
  );
}
