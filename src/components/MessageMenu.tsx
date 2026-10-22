// Menu ⋯ di pesan orang lain: sembunyikan / blokir (untuk diri sendiri),
// ditambah hapus / kick untuk admin.
import type { ChatMessage } from '../chat';
import { useI18n } from '../i18n';
import { Avatar } from './Avatar';
import { Crown, Icon } from './Icon';
import { Overlay } from './Overlay';

interface Props {
  message: ChatMessage;
  isAdmin: boolean;
  onHide: () => void;
  onBlock: () => void;
  onDelete: () => void;
  onKick: () => void;
  onClose: () => void;
}

export function MessageMenu({ message: m, isAdmin, onHide, onBlock, onDelete, onKick, onClose }: Props) {
  const { t } = useI18n();
  const preview = m.deleted ? t('msg.deleted') : m.kind === 'text' ? m.text : m.kind === 'sticker' ? t('stickers.title') : t('composer.image');
  return (
    <Overlay kind="sheet" label={t('menu.title')} onClose={onClose}>
      <div className="menu__preview">
        <Avatar id={m.avatarId} size={34} />
        <div className="menu__preview-text">
          <span className="menu__preview-name">{m.nickname}</span>
          <span className="menu__preview-body">{preview}</span>
        </div>
      </div>
      <button type="button" className="menu__item" onClick={onHide}>
        <Icon name="eyeOff" />
        {t('menu.hide')}
      </button>
      <button type="button" className="menu__item" onClick={onBlock}>
        <Icon name="userX" />
        {t('menu.block', { name: m.nickname })}
      </button>
      <p className="menu__note">{t('menu.selfOnly')}</p>
      {isAdmin && (
        <>
          <p className="menu__section">
            <Crown />
            {t('menu.adminOnly')}
          </p>
          {!m.deleted && (
            <button type="button" className="menu__item menu__item--danger" onClick={onDelete}>
              <Icon name="trash" />
              {t('menu.delete')}
            </button>
          )}
          <button type="button" className="menu__item menu__item--danger" onClick={onKick}>
            <Icon name="logout" />
            {t('menu.kick', { name: m.nickname })}
          </button>
        </>
      )}
      <button type="button" className="btn btn--soft menu__close" onClick={onClose}>
        {t('menu.close')}
      </button>
    </Overlay>
  );
}
