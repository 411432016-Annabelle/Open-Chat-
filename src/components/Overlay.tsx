// Lapisan di atas layar: dialog di tengah, bottom sheet, atau panel.
// Menutup dengan Esc atau ketuk di luar; fokus pindah ke dalam saat dibuka
// dan kembali ke tombol asal saat ditutup.
import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  kind: 'dialog' | 'sheet' | 'panel' | 'lightbox';
  label: string;
  onClose: () => void;
  role?: 'dialog' | 'alertdialog';
  children: ReactNode;
}

export function Overlay({ kind, label, onClose, role = 'dialog', children }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const box = boxRef.current;
    const first = box?.querySelector<HTMLElement>('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])');
    (first ?? box)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      } else if (e.key === 'Tab' && box) {
        // Fokus tetap berputar di dalam lapisan ini.
        const items = Array.from(
          box.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, textarea, [tabindex]:not([tabindex="-1"])'),
        );
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className={`overlay overlay--${kind}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={boxRef} className={`overlay__box overlay__box--${kind}`} role={role} aria-modal="true" aria-label={label} tabIndex={-1}>
        {kind === 'sheet' && <div className="sheet-handle" aria-hidden="true" />}
        {children}
      </div>
    </div>
  );
}
