import type { TKey } from '../i18n';
import { useI18n } from '../i18n';
import { STICKERS, avatarById } from '../lib/characters';
import { Icon } from './Icon';
import { Mascot } from './Mascot';

export function StickerPicker({ onPick, onClose, disabled }: { onPick: (id: string) => void; onClose: () => void; disabled: boolean }) {
  const { t } = useI18n();
  return (
    <div className="stickers" role="region" aria-label={t('stickers.title')}>
      <div className="stickers__head">
        <h2 className="stickers__title">{t('stickers.title')}</h2>
        <button type="button" className="icon-btn icon-btn--small" aria-label={t('stickers.close')} onClick={onClose}>
          <Icon name="x" size={18} />
        </button>
      </div>
      <div className="stickers__grid">
        {STICKERS.map((s) => {
          const look = avatarById(s.look);
          const label = t(s.labelKey as TKey);
          return (
            <button key={s.id} type="button" className="stickers__item" disabled={disabled} onClick={() => onPick(s.id)} aria-label={t('msg.sticker', { label })}>
              <Mascot mood={s.mood} size={60} fur={look.fur} face={look.face} accent={look.accent} />
              <span aria-hidden="true">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
