import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store.js';
import { useBrowseVisible } from './useBrowseVisible.js';

const ChevronRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
  </svg>
);

/**
 * Floating chevron on the divider between the section nav and the content
 * that opens the browse panel. Rendered only while the panel is closed; the
 * matching collapse chevron floats on the open panel's outer edge
 * (see BrowsePanel).
 */
export default function BrowseEdgeTab() {
  const { t } = useTranslation();
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const isOpen = useEditorStore((state) => state.isBrowsePanelOpen);
  const toggleBrowsePanel = useEditorStore((state) => state.toggleBrowsePanel);
  const isDiagram = useEditorStore((state) => state.currentView) === 'diagram';
  const isVisible = useBrowseVisible();

  const hasSources = !!(editorConfig?.semantics?.baseUrl
    || editorConfig?.dataProducts?.upstreamUrl
    || editorConfig?.dataProducts?.productsUrl);
  if (!isVisible || !hasSources || isOpen) return null;

  const label = t('browsePanel.expand');

  return (
    <div className="hidden md:block relative w-0 flex-shrink-0 z-20">
      <button
        type="button"
        onClick={toggleBrowsePanel}
        aria-expanded={false}
        className={`group absolute top-1/2 -translate-y-1/2 ${isDiagram ? 'left-1' : '-left-3'} h-6 min-w-6 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:pr-2 transition-all`}
      >
        <span className="sr-only">{label}</span>
        <ChevronRightIcon className="size-4 flex-shrink-0" />
        {/* Expands the round chevron into a labeled pill on hover */}
        <span aria-hidden="true" className="hidden group-hover:inline text-xs font-medium whitespace-nowrap">
          {label}
        </span>
      </button>
    </div>
  );
}
