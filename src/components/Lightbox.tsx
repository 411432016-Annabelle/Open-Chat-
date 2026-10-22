import type { ChatMessage } from '../chat';
import { useI18n } from '../i18n';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Overlay } from './Overlay';

export function Lightbox({ message, onClose }: { message: ChatMessage; onClose: () => void }) {
  const { t, lang } = useI18n();
  const time = new Date(message.createdAt).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  return (
    <Overlay kind="lightbox" label={t('lightbox.label', { name: message.nickname })} onClose={onClose}>
      <div className="lightbox__bar">
        <Avatar id={message.avatarId} size={36} />
        <span className="lightbox__who">
          {message.nickname} · {time}
        </span>
        <button type="button" className="icon-btn lightbox__close" aria-label={t('lightbox.close')} onClick={onClose}>
          <Icon name="x" />
        </button>
      </div>
      <div className="lightbox__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img src={message.imageUrl ?? ''} alt={t('lightbox.label', { name: message.nickname })} />
      </div>
      <p className="lightbox__hint">{t('lightbox.hint')}</p>
    </Overlay>
  );
}
