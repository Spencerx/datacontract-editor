/**
 * Small shared UI pieces for the browse panel sources.
 */
import { Tooltip } from '../ui/index.js';

/**
 * Marker on a tree row whose element is already used in the edited contract.
 * The icon differs per source (blue semantic link vs green check); the
 * tooltip names the linking schema/properties.
 */
export function LinkedBadge({ tooltip, children }) {
  return (
    <span data-linked-badge className="flex-shrink-0 flex items-center">
      <Tooltip content={tooltip}>{children}</Tooltip>
    </span>
  );
}

export const LinkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
);

export function BrowseSearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex-shrink-0 border-b border-gray-200 px-3 py-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-md border-0 py-1 pl-8 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
      </div>
    </div>
  );
}

export function PanelHint({ text }) {
  return (
    <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
      {text}
    </div>
  );
}

export function TreeChevron({ hasChildren, isExpanded, onToggle }) {
  if (!hasChildren) return <span className="w-4 flex-shrink-0" />;
  return (
    <button type="button" onClick={onToggle} className="w-4 flex-shrink-0 flex items-center justify-center">
      <svg className={`size-3.5 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

export const ExternalLinkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
  </svg>
);

export function OpenDetailsButton({ url, label }) {
  if (!url) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); window.open(url, '_blank', 'noopener'); }}
      className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
      title={label}
      data-open-details
    >
      <span className="sr-only">{label}</span>
      <ExternalLinkIcon className="h-3.5 w-3.5" />
    </button>
  );
}
