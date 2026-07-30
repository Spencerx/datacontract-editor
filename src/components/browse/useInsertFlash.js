import { useEffect, useState } from 'react';
import { useEditorStore } from '../../store.js';
import { scrollIntoNearestScrollParent } from './browseInsert.js';

/**
 * Flash feedback for a property row that was just inserted from the browse
 * panel: returns true for ~1.6s when this row matches the store's
 * lastInsertedProperty marker. When a scrollRef is passed, the row is also
 * scrolled into view inside its nearest scrollable container (used by the
 * form editor; the diagram canvas has no scroll container, the drop target
 * node is already on screen).
 */
export function useInsertFlash(schemaIndex, index, { enabled = true, scrollRef = null } = {}) {
  const lastInsertedProperty = useEditorStore((state) => state.lastInsertedProperty);
  const clearInsertedProperty = useEditorStore((state) => state.clearInsertedProperty);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const isMatch = enabled
      && lastInsertedProperty?.schemaIndex === schemaIndex
      && lastInsertedProperty?.index === index;

    if (!isMatch) {
      // A newer insert took over before this row's fade-out timer fired
      // (the cleanup below cancels it) — end any still-running flash.
      const raf = requestAnimationFrame(() => setIsFlashing(false));
      return () => cancelAnimationFrame(raf);
    }

    if (scrollRef && lastInsertedProperty.scroll !== false) {
      scrollIntoNearestScrollParent(scrollRef.current);
    }
    const raf = requestAnimationFrame(() => setIsFlashing(true));
    const timer = setTimeout(() => {
      setIsFlashing(false);
      clearInsertedProperty();
    }, 1600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [lastInsertedProperty, enabled, schemaIndex, index, scrollRef, clearInsertedProperty]);

  return isFlashing;
}
