// The render loop rebuilds the whole screen on every store change, which would snap
// horizontally scrolled rails back to the start (e.g. right after saving a job). Rails
// record their offset here and restore it after the rebuild.
const offsets = new Map();

export function rememberScroll(key, left) { offsets.set(key, left); }
export function recalledScroll(key) { return offsets.get(key) || 0; }
export function forgetScroll(key) { offsets.delete(key); }
