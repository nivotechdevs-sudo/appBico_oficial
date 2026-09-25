/** Joins the truthy class names with a space (same output as the legacy `cx()` helper). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Design sizes are authored as familiar px-equivalent numbers (matching the source design
 * system's scale, e.g. icon size 20) but every emitted CSS length is rem.
 */
export function rem(px: number): string {
  return px / 16 + 'rem';
}
