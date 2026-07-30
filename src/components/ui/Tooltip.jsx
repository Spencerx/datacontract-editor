import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ content, children, placement = 'top', variant = 'dark', delay = 0, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const showTimerRef = useRef(null);

  // Clear a pending delayed show on unmount
  useEffect(() => () => clearTimeout(showTimerRef.current), []);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      // When the wrapper uses `display: contents` it has a zero-sized
      // bounding rect, so fall back to the first real child element.
      const hostRect = triggerRef.current.getBoundingClientRect();
      const firstChild = triggerRef.current.firstElementChild;
      const rect =
        hostRect.width === 0 && hostRect.height === 0 && firstChild
          ? firstChild.getBoundingClientRect()
          : hostRect;
      if (placement === 'right') {
        setPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 8,
        });
      } else if (placement === 'bottom-start') {
        // Align to the content start: full-width rows (e.g. indented tree
        // rows) begin their visible content at their padding-left, and the
        // arrow should point there, not at the row's left edge.
        const contentEl = firstChild || triggerRef.current;
        const paddingLeft = contentEl ? parseFloat(getComputedStyle(contentEl).paddingLeft) || 0 : 0;
        setPosition({
          top: rect.bottom + 6,
          left: rect.left + paddingLeft + 4,
        });
      } else {
        setPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      }
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    if (delay > 0) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = setTimeout(() => setIsVisible(true), delay);
    } else {
      setIsVisible(true);
    }
  };
  const handleMouseLeave = () => {
    clearTimeout(showTimerRef.current);
    setIsVisible(false);
  };

  const variantClass = variant === 'light'
    ? 'text-gray-900 bg-white border border-gray-200'
    : 'text-white bg-gray-900';
  const arrowVariantClass = variant === 'light'
    ? 'bg-white border-gray-200'
    : 'bg-gray-900';
  const tooltipClassBase = `fixed px-3 py-2 text-xs font-normal ${variantClass} rounded-lg shadow-lg pointer-events-none max-w-xs z-[9999]`;
  const tooltipPlacementClass =
    placement === 'right'
      ? '-translate-y-1/2'
      : placement === 'bottom-start'
        ? ''
        : '-translate-x-1/2 -translate-y-full';

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className || 'inline-flex cursor-help'}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          className={`${tooltipClassBase} ${tooltipPlacementClass}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          {placement === 'right' ? (
            <div className={`absolute w-2 h-2 ${arrowVariantClass} ${variant === 'light' ? 'border-l border-b' : ''} transform rotate-45 top-1/2 -translate-y-1/2 -left-1`} />
          ) : placement === 'bottom-start' ? (
            <div className={`absolute w-2 h-2 ${arrowVariantClass} ${variant === 'light' ? 'border-l border-t' : ''} transform rotate-45 -top-1 left-4`} />
          ) : (
            <div className={`absolute w-2 h-2 ${arrowVariantClass} ${variant === 'light' ? 'border-r border-b' : ''} transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1`} />
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
