export const WHEEL_STORAGE_KEY = 'wheel-items';

/** Muted sage green for primary action buttons (readable in light & dark mode). */
export const ACTION_MINT = '#7A9E8E';

/** Vibrant wheel segments — green & purple first, then expands through the palette. */
export const WHEEL_COLORS = [
  '#708C62', // muted green
  '#8B628C', // muted purple
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#14B8A6', // teal
  '#EC4899', // pink
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function getWheelSegmentColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}

export function truncateLabel(label: string, maxLength = 14): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}
