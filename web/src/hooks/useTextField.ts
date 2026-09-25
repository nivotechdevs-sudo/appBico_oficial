import { useLayoutEffect, useRef, type ChangeEvent } from 'react';

// Browsers only honour `autofocus` for the first such element a document ever sees; later ones are
// ignored. The legacy app relied on that native behaviour (its fields were plain DOM nodes with the
// attribute), so it's emulated here instead of React's autoFocus, which focuses on every mount.
let autofocusProcessed = false;

type Field = HTMLInputElement | HTMLTextAreaElement;

/**
 * Wiring shared by every controlled text field: keeps the caret where it was when the value is
 * reformatted on input (CPF/CNPJ masks, digits-only fields) — as the legacy render loop did — and
 * applies the once-per-document autofocus rule above.
 */
export function useTextField<T extends Field>(onValue: ((value: string) => void) | undefined, autoFocus = false) {
  const ref = useRef<T>(null);
  const selection = useRef<[number | null, number | null] | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const sel = selection.current;
    selection.current = null;
    if (!el || !sel || document.activeElement !== el || typeof sel[0] !== 'number') return;
    try {
      el.setSelectionRange(sel[0], sel[1]);
    } catch {
      /* not a text-selectable input */
    }
  });

  useLayoutEffect(() => {
    if (!autoFocus || autofocusProcessed) return;
    autofocusProcessed = true;
    const active = document.activeElement;
    if (!active || active === document.body) ref.current?.focus();
  }, [autoFocus]);

  const onChange = (e: ChangeEvent<T>) => {
    selection.current = [e.target.selectionStart, e.target.selectionEnd];
    if (onValue) onValue(e.target.value);
  };

  return [ref, onChange] as const;
}
