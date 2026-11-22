const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** "2026-10-03" -> "Oct 3" (null-safe). */
export function shortDateOnly(iso: string | null): string {
  if (!iso) return '';
  return shortDate.format(new Date(`${iso}T00:00:00`));
}

/** "2026-10-03" -> "October 3, 2026" (null-safe). */
export function longDateOnly(iso: string | null): string {
  if (!iso) return '2026';
  return longDate.format(new Date(`${iso}T00:00:00`));
}

/** 1 -> "01" (topic numbering). */
export function pad(n: number): string {
  return String(n).padStart(2, '0');
}
