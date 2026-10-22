import { memo } from 'react';
import type { ChatMessage } from '../chat';
import { useI18n, type TKey } from '../i18n';
import { avatarById, stickerById } from '../lib/characters';
import { linkify } from '../lib/linkify';
import { Avatar } from './Avatar';
import { Crown, Icon } from './Icon';
import { Mascot } from './Mascot';

interface Props {
  message: ChatMessage;
  mine: boolean;
  onOpenMenu: (m: ChatMessage, button: HTMLButtonElement) => void;
  onOpenImage: (m: ChatMessage) => void;
}

function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export const MessageBubble = memo(function MessageBubble({ message: m, mine, onOpenMenu, onOpenImage }: Props) {
  const { t, lang } = useI18n();
  const time = formatTime(m.createdAt, lang);
  const sticker = m.kind === 'sticker' ? stickerById(m.stickerId) : undefined;

  let content;
  if (m.deleted) {
    content = (
      <div className="bubble bubble--deleted">
        <Icon name="ban" size={16} />
        {t('msg.deleted')}
      </div>
    );
  } else if (m.kind === 'text') {
    content = (
      <div className={`bubble ${mine ? 'bubble--mine' : m.isAdmin ? 'bubble--admin' : ''}`}>
        {linkify(m.text ?? '').map((p, i) =>
          p.type === 'link' ? (
            <a key={i} href={p.value} target="_blank" rel="noopener noreferrer nofollow">
              {p.value}
            </a>
          ) : (
            <span key={i}>{p.value}</span>
          ),
        )}
      </div>
    );
  } else if (m.kind === 'sticker') {
    const look = avatarById(sticker?.look ?? 'unknown');
    content = (
      <div className="sticker" role="img" aria-label={t('msg.sticker', { label: sticker ? t(sticker.labelKey as TKey) : '?' })}>
        <Mascot mood={sticker?.mood ?? 'hello'} size={86} fur={look.fur} face={look.face} accent={look.accent} />
      </div>
    );
  } else {
    content = (
      <button
        type="button"
        className={`thumb ${mine ? 'thumb--mine' : ''}`}
        aria-label={t('msg.openImage', { name: m.nickname })}
        onClick={() => onOpenImage(m)}
      >
        <img src={m.imageUrl ?? ''} alt="" loading="lazy" />
      </button>
    );
  }

  return (
    <li className={`msg ${mine ? 'msg--mine' : ''}`}>
      {!mine && <Avatar id={m.avatarId} size={34} />}
      <div className="msg__col">
        <div className="msg__meta">
          {!mine && <span className="msg__name">{m.nickname}</span>}
          {m.isAdmin && <Crown label={t('admin.badge')} />}
          <time dateTime={m.createdAt}>{time}</time>
        </div>
        <div className="msg__row">
          {content}
          {!mine && (
            <button
              type="button"
              className="icon-btn icon-btn--ghost msg__more"
              aria-label={t('msg.menu', { name: m.nickname })}
              onClick={(e) => onOpenMenu(m, e.currentTarget)}
            >
              <Icon name="more" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
});
