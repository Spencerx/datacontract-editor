// Quality check icons: one glyph per ODCS quality dimension, plus a generic one for checks
// that declare no (recognized) dimension. Streamline Ultimate Light glyphs on a 24x24 grid,
// stroke only, so they inherit the badge's text color.
//
// Kept in sync with the schema view of the Entropy Data catalog, which renders the same badges.

// ODCS 3.1 allows a two-letter synonym for every dimension, so both spellings must resolve
// to the same icon.
const DIMENSION_ALIASES = {
  ac: 'accuracy',
  cp: 'completeness',
  cf: 'conformity',
  cs: 'consistency',
  cv: 'coverage',
  tm: 'timeliness',
  uq: 'uniqueness',
};

const DIMENSION_ICON_PATHS = {
  // Cog Approved 1
  generic: [
    'M23.5 0.5 12.74 13.6a1 1 0 0 1 -0.74 0.4 1 1 0 0 1 -0.77 -0.33L8 10',
    'M19.88 8.73a1.88 1.88 0 0 0 1.11 1l1.26 0.45a1.88 1.88 0 0 1 0 3.54l-1.25 0.5a1.88 1.88 0 0 0 -1.11 1 1.91 1.91 0 0 0 0 1.52L20.5 18a1.88 1.88 0 0 1 -2.5 2.5l-1.21 -0.58a1.91 1.91 0 0 0 -1.52 0 1.88 1.88 0 0 0 -1 1.11l-0.45 1.26a1.88 1.88 0 0 1 -3.54 0L9.78 21a1.88 1.88 0 0 0 -1 -1.11 1.91 1.91 0 0 0 -1.52 0L6 20.5A1.88 1.88 0 0 1 3.5 18l0.58 -1.21a1.91 1.91 0 0 0 0 -1.52 1.88 1.88 0 0 0 -1.11 -1l-1.26 -0.45a1.88 1.88 0 0 1 0 -3.54L3 9.78a1.88 1.88 0 0 0 1.11 -1 1.91 1.91 0 0 0 0 -1.52L3.5 6A1.88 1.88 0 0 1 6 3.5l1.21 0.58a1.91 1.91 0 0 0 1.52 0A1.88 1.88 0 0 0 9.78 3l0.45 -1.26a1.88 1.88 0 0 1 3.54 0L14.22 3a1.88 1.88 0 0 0 1 1.11',
  ],
  // Target Center 2
  accuracy: [
    'M13.24 13.49A4.44 4.44 0 0 1 13.5 15a4.51 4.51 0 1 1 -1.32 -3.18',
    'M16.34 10.71A8.52 8.52 0 1 1 15 9',
    'm0.5 23.5 2.49 -2.49',
    'm15.01 21.01 2.49 2.49',
    'm16.43 7.57 -0.36 -3.89L19.25 0.5l1.07 3.18 3.18 1.07 -3.18 3.18 -3.89 -0.36z',
    'M19 5 9 15',
  ],
  // Task List Check 1
  completeness: [
    'm14.5 9.5 0 -4 -11 0 0 12.999 5 0.001',
    'M17.5 8.5v-5a1 1 0 0 0 -1 -1h-4.448a3.329 3.329 0 0 0 -6.1 0H1.5a1 1 0 0 0 -1 1v17a1 1 0 0 0 1 1h8',
    'm6.5 8.5 5 0',
    'm6.5 11.5 5 0',
    'm6.5 14.5 3 0',
    'M11.5 17.5a6 6 0 1 0 12 0 6 6 0 1 0 -12 0Z',
    'm20.174 15.755 -2.905 3.874a0.751 0.751 0 0 1 -1.131 0.08l-1.5 -1.5',
  ],
  // Measure Ruler
  conformity: [
    'M17.571 3.429A10 10 0 0 0 3.429 17.571l-1.768 1.768a0.5 0.5 0 0 0 0 0.707l3.308 3.308a0.5 0.5 0 0 0 0.707 0L23.354 5.676a0.5 0.5 0 0 0 0 -0.707l-3.308 -3.308a0.5 0.5 0 0 0 -0.707 0ZM6.257 14.743a6 6 0 0 1 8.486 -8.486Z',
    'm7.09 21.939 -1.768 -1.767',
    'M9.211 19.818 7.444 18.05',
    'm11.333 17.697 -1.768 -1.768',
    'm13.454 15.575 -1.768 -1.767',
    'm15.575 13.454 -1.767 -1.768',
    'm17.697 11.333 -1.768 -1.768',
    'M19.818 9.211 18.05 7.444',
    'm21.939 7.09 -1.767 -1.768',
  ],
  // Synchronize Arrows
  consistency: [
    'M0.713 10.34 3.5 14.49l3.205 -3.838',
    'M3.489 14.439a8.947 8.947 0 0 1 6.554 -10.727 8.492 8.492 0 0 1 8.325 2.641',
    'M23.285 13.642 20.498 9.49l-3.205 3.838',
    'M20.509 9.543a8.948 8.948 0 0 1 -6.554 10.727 8.5 8.5 0 0 1 -8.325 -2.641',
    'M10 11.991a2 2 0 1 0 4 0 2 2 0 1 0 -4 0Z',
  ],
  // Layers
  coverage: [
    'M12.21 12.44a0.51 0.51 0 0 1 -0.42 0L0.82 7.67a0.53 0.53 0 0 1 -0.32 -0.49 0.55 0.55 0 0 1 0.32 -0.49l11 -4.76a0.51 0.51 0 0 1 0.42 0l11 4.76a0.55 0.55 0 0 1 0.32 0.49 0.53 0.53 0 0 1 -0.32 0.49Z',
    'm23.18 10.88 -11 4.77a0.51 0.51 0 0 1 -0.42 0l-11 -4.77',
    'm23.18 14.1 -11 4.76a0.51 0.51 0 0 1 -0.42 0L0.82 14.1',
    'm23.18 17.31 -11 4.76a0.51 0.51 0 0 1 -0.42 0l-11 -4.76',
  ],
  // Time Clock Circle
  timeliness: [
    'M0.499 12.001a11.5 11.5 0 1 0 23 0 11.5 11.5 0 1 0 -23 0Z',
    'm12 6.501 0 5.5 6 5.5',
  ],
  // Touch Id 1
  uniqueness: [
    'M12 23.5a9 9 0 0 0 9 -9v-5a8.967 8.967 0 0 0 -2.293 -6',
    'M3 11.5v3a9 9 0 0 0 5.5 8.294',
    'M16.5 1.706A9 9 0 0 0 3.014 9',
    'M9.5 4.044A6 6 0 0 1 18 9.5v5a6.026 6.026 0 0 1 -0.189 1.5',
    'M16.472 18.5A6 6 0 0 1 6 14.5v-5a5.979 5.979 0 0 1 1.528 -4',
    'M9 14.5a3 3 0 0 0 6 0v-5a3 3 0 0 0 -6 0v3',
    'm12 9.5 0 3',
    'm12 14.5 0 1',
  ],
};

const createIcon = (paths) => {
  const Icon = ({className = 'w-3 h-3'}) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, index) => <path key={index} d={d}/>)}
    </svg>
  );
  return Icon;
};

const DIMENSION_ICONS = Object.fromEntries(
  Object.entries(DIMENSION_ICON_PATHS).map(([dimension, paths]) => [dimension, createIcon(paths)]),
);

const normalizeQualityDimension = (dimension) => {
  if (!dimension) {
    return null;
  }
  const key = String(dimension).trim().toLowerCase();
  const resolved = DIMENSION_ALIASES[key] || key;
  return resolved !== 'generic' && DIMENSION_ICONS[resolved] ? resolved : null;
};

/**
 * Icon component for a quality check, picked by its dimension.
 *
 * @param {object} qualityCheck an ODCS quality object
 */
export const getQualityCheckIcon = (qualityCheck) => {
  const dimension = normalizeQualityDimension(qualityCheck?.dimension);
  return DIMENSION_ICONS[dimension] || DIMENSION_ICONS.generic;
};
