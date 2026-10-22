// Pop-up kecil "X masuk / X keluar" — hilang sendiri ±3 detik, maks. 3 ditumpuk.
import { Avatar } from './Avatar';

export interface ToastItem {
  id: string;
  kind: 'joined' | 'left';
  text: string;
  avatarId: string;
}

export function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`}>
          <Avatar id={t.avatarId} size={30} />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
