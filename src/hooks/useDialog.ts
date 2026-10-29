import { useEffect, useRef } from 'react';
/** Keep focus inside an open dialog and return it to its trigger on close. */
export function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    if (!root) return;
    const elements = () => Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]')).filter(el=>el.getClientRects().length>0);
    (root.querySelector<HTMLElement>('input') || elements()[0])?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = elements(), first=items[0], last=items[items.length-1];
      if(event.shiftKey && document.activeElement===first) { event.preventDefault(); last?.focus(); }
      else if(!event.shiftKey && document.activeElement===last) { event.preventDefault(); first?.focus(); }
    };
    root.addEventListener('keydown',key);
    return () => { root.removeEventListener('keydown',key); previous?.focus(); };
  },[]);
  return ref;
}
