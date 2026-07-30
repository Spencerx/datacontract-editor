import { matchPath, useLocation } from 'react-router';
import { useEditorStore } from '../../store.js';

/**
 * Index of the schema currently open in the form view (/schemas/:schemaId),
 * or null when no schema page is open. Used by the browse panel's
 * click-to-add buttons, which append to the current schema.
 *
 * Returns null in the diagram view: the route persists from the form view
 * there, but no single schema is "open", so quick-add has no clear target
 * (the diagram is drag-only).
 */
export function useCurrentSchemaIndex() {
  const currentView = useEditorStore((state) => state.currentView);
  const location = useLocation();
  if (currentView !== 'form') return null;
  const match = matchPath('/schemas/:schemaId', location.pathname);
  const index = match ? parseInt(match.params.schemaId, 10) : NaN;
  return Number.isNaN(index) ? null : index;
}
