import { matchPath, useLocation } from 'react-router';
import { useEditorStore } from '../../store.js';

/**
 * Whether the browse rail/panel applies to the current editing context:
 * the schema form page (/schemas/:schemaId) or the diagram view — the two
 * places with drop targets for properties.
 */
export function useBrowseVisible() {
  const currentView = useEditorStore((state) => state.currentView);
  const yamlParseError = useEditorStore((state) => state.yamlParseError);
  const location = useLocation();

  if (yamlParseError) return false;
  if (currentView === 'diagram') return true;
  return currentView === 'form' && !!matchPath('/schemas/:schemaId', location.pathname);
}
