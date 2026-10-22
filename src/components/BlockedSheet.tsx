import { useI18n } from '../i18n';
import type { BlockedUser } from '../lib/moderation';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Overlay } from './Overlay';

interface Props {
  blocked: BlockedUser[];
  hiddenCount: number;
  onUnblock: (userId: string) => void;
  onShowHidden: () => void;
  onClose: () => void;
}

export function BlockedSheet({ blocked, hiddenCount, onUnblock, onShowHidden, onClose }: Props) {
  const { t } = useI18n();
  return (
    <Overlay kind="sheet" label={t('blocked.title')} onClose={onClose}>
      <div className="sheet__head">
        <h2 className="dialog__title">{t('blocked.title')}</h2>
        <button type="button" className="icon-btn" aria-label={t('blocked.close')} onClick={onClose}>
          <Icon name="x" />
        </button>
      </div>
      <p className="sheet__body">{t('blocked.body')}</p>
      {blocked.length === 0 ? (
        <p className="sheet__empty">{t('blocked.none')}</p>
      ) : (
        <ul className="blocked__list">
          {blocked.map((b) => (
            <li key={b.userId} className="blocked__item">
              <Avatar id={b.avatarId} size={40} />
              <span className="blocked__name">{b.nickname}</span>
              <button type="button" className="chip-btn chip-btn--mint" onClick={() => onUnblock(b.userId)}>
                {t('blocked.unblock')}
              </button>
            </li>
          ))}
        </ul>
      )}
      {hiddenCount > 0 && (
        <div className="blocked__hidden">
          <Icon name="eyeOff" />
          <span>{t('blocked.hidden', { n: hiddenCount })}</span>
          <button type="button" className="chip-btn chip-btn--lavender" onClick={onShowHidden}>
            {t('blocked.showAgain')}
          </button>
        </div>
      )}
    </Overlay>
  );
}
