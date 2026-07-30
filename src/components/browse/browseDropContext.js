import { createContext, useContext } from 'react';

/**
 * While a browse drag is in progress: { schemaIndex, index } of the current
 * insertion point, so property rows can render a drop indicator line.
 * Null otherwise. Provided by EditorDndProvider.
 */
export const BrowseDropContext = createContext(null);

export const useBrowseDropIndicator = () => useContext(BrowseDropContext);
