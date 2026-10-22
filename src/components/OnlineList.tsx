import type { OnlineUser } from '../chat';
import { useI18n } from '../i18n';
import { Avatar } from './Avatar';
import { Crown, Icon } from './Icon';

interface Props {
  users: OnlineUser[];
  selfId: string | null;
  adminIds: Set<string>;
  blockedCount: number;
  onOpenBlocked: () => void;
  onClose?: () => void;
}

/** Daftar orang online: panel samping (komputer) atau panel buka-tutup (HP). */
export function OnlineList({ users, selfId, adminIds, blockedCount, onOpenBlocked, onClose }: Props) {
  const { t } = useI18n();
  // Diri sendiri di atas, lalu admin, lalu yang lain sesuai urutan masuk.
  const sorted = [...users].sort((a, b) => {
    if (a.userId === selfId) return -1;
    if (b.userId === selfId) return 1;
    const aa = adminIds.has(a.userId) ? 0 : 1;
    const bb = adminIds.has(b.userId) ? 0 : 1;
    return aa - bb || a.onlineAt.localeCompare(b.onlineAt);
  });

  return (
    <div className="online">
      <div className="online__head">
        <h2 className="online__title">
          {t('online.title')} <span className="count-chip">{users.length}</span>
        </h2>
        {onClose && (
          <button type="button" className="icon-btn" aria-label={t('online.close')} onClick={onClose}>
            <Icon name="x" />
          </button>
        )}
      </div>
      <ul className="online__list">
        {sorted.map((u) => (
          <li key={u.userId} className="online__item">
            <Avatar id={u.avatarId} size={38} />
            <span className="online__name">{u.nickname}</span>
            {adminIds.has(u.userId) && <Crown size={18} label={t('admin.badge')} />}
            {u.userId === selfId && <span className="online__you">{t('online.you')}</span>}
          </li>
        ))}
      </ul>
      <button type="button" className="soft-btn online__blocked" onClick={onOpenBlocked}>
        <Icon name="userX" size={18} />
        {t('online.blocked', { n: blockedCount })}
      </button>
    </div>
  );
}
