// Aliran pesan + logika "tetap di bawah" dan tombol "⬇ Pesan baru".
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { ChatMessage } from '../chat';
import { useI18n } from '../i18n';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  selfId: string | null;
  newCount: number;
  onAtBottomChange: (atBottom: boolean) => void;
  onOpenMenu: (m: ChatMessage, button: HTMLButtonElement) => void;
  onOpenImage: (m: ChatMessage) => void;
  /** Hiasan di pojok kanan bawah (maskot kecil). */
  corner?: ReactNode;
}

export interface MessageListHandle {
  scrollToBottom: (smooth?: boolean) => void;
  isAtBottom: () => boolean;
}

const BOTTOM_SLACK = 80;

export const MessageList = forwardRef<MessageListHandle, Props>(function MessageList(
  { messages, selfId, newCount, onAtBottomChange, onOpenMenu, onOpenImage, corner },
  ref,
) {
  const { t } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);

  const isAtBottom = () => {
    const el = scroller.current;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_SLACK;
  };

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useImperativeHandle(ref, () => ({ scrollToBottom, isAtBottom }), [scrollToBottom]);

  // Pesan baru masuk: kalau sedang di bawah, tetap di bawah.
  useLayoutEffect(() => {
    if (atBottom.current) scrollToBottom();
  }, [messages, scrollToBottom]);

  // Gambar yang selesai dimuat bisa mendorong isi ke atas.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onLoad = () => atBottom.current && scrollToBottom();
    el.addEventListener('load', onLoad, true);
    return () => el.removeEventListener('load', onLoad, true);
  }, [scrollToBottom]);

  const onScroll = () => {
    const now = isAtBottom();
    if (now !== atBottom.current) {
      atBottom.current = now;
      onAtBottomChange(now);
    }
  };

  return (
    <div className="messages-wrap">
      <div className="messages" ref={scroller} onScroll={onScroll}>
        {messages.length === 0 ? (
          <div className="empty">
            <Mascot mood="sad" size={130} idle />
            <p className="empty__title">{t('empty.title')}</p>
            <p className="empty__body">{t('empty.body')}</p>
          </div>
        ) : (
          <ol className="messages__list">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} mine={m.userId === selfId} onOpenMenu={onOpenMenu} onOpenImage={onOpenImage} />
            ))}
          </ol>
        )}
      </div>
      {corner}
      {newCount > 0 && (
        <button type="button" className="new-msgs" onClick={() => scrollToBottom(true)}>
          <Icon name="arrowDown" size={18} />
          {t('msg.newMessages', { n: newCount })}
        </button>
      )}
    </div>
  );
});
