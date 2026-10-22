// Layar Ruang Chat — architecture.md 6 (alur data) & 7.2, design.md 6 (baris 2–3).
// Layar ini hanya berbicara lewat `chat` (ChatService), tidak tahu soal mock/Supabase.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chat, IS_DEMO, type ChatMessage, type ConnectionStatus, type OnlineUser, type SendFailReason, type SendResult } from '../chat';
import { useI18n, type TKey } from '../i18n';
import type { Mood } from '../lib/characters';
import { checkImage, shrinkImage } from '../lib/image';
import { loadBlocked, loadHidden, saveBlocked, saveHidden, type BlockedUser } from '../lib/moderation';
import { playPop, unlockSound } from '../lib/sound';
import { load, save } from '../lib/storage';
import { setUnreadTitle } from '../lib/unreadTitle';
import { BlockedSheet } from '../components/BlockedSheet';
import { Composer } from '../components/Composer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Icon } from '../components/Icon';
import { ImagePreview } from '../components/ImagePreview';
import { LanguageMenu, LanguageSwitch } from '../components/LanguageSwitch';
import { Lightbox } from '../components/Lightbox';
import { Mascot } from '../components/Mascot';
import { MessageList, type MessageListHandle } from '../components/MessageList';
import { MessageMenu } from '../components/MessageMenu';
import { OnlineList } from '../components/OnlineList';
import { Toasts, type ToastItem } from '../components/Toasts';

interface Props {
  self: OnlineUser;
  onLeave: () => void;
  onKicked: (until: number) => void;
}

const REACTION_GAP_MS = 4000;
const TOAST_MS = 3000;

/** Gabungkan pesan berdasarkan id: versi terbaru menang, tidak ada yang dobel. */
function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChatScreen({ self, onLeave, onKicked }: Props) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState<OnlineUser[]>(() => chat.getOnline());
  const [conn, setConn] = useState<ConnectionStatus>('connected');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hidden, setHidden] = useState<string[]>(loadHidden);
  const [blocked, setBlocked] = useState<BlockedUser[]>(loadBlocked);
  const [soundOn, setSoundOn] = useState(() => load('sound', true));
  const [newCount, setNewCount] = useState(0);
  const [mood, setMood] = useState<Mood>('hello');
  const [composerError, setComposerError] = useState<string | null>(null);

  const [onlineOpen, setOnlineOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<ChatMessage | null>(null);
  const [confirm, setConfirm] = useState<{ type: 'kick' | 'delete'; message: ChatMessage } | null>(null);
  const [lightbox, setLightbox] = useState<ChatMessage | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const listRef = useRef<MessageListHandle>(null);
  const atBottom = useRef(true);
  const unread = useRef(0);
  const lastReaction = useRef(0);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConn = useRef<ConnectionStatus>('connected');
  // Nilai terbaru untuk dipakai di dalam pendengar event.
  const live = useRef({ soundOn, blocked, t });
  live.current = { soundOn, blocked, t };

  const isAdmin = chat.isAdmin();
  const blockedIds = useMemo(() => new Set(blocked.map((b) => b.userId)), [blocked]);
  const hiddenIds = useMemo(() => new Set(hidden), [hidden]);
  const visible = useMemo(
    () => messages.filter((m) => !hiddenIds.has(m.id) && !blockedIds.has(m.userId)),
    [messages, hiddenIds, blockedIds],
  );
  // 👑 di daftar online hanya untuk userId yang dikenal sebagai admin (architecture.md 9.3).
  const adminIds = useMemo(() => {
    const ids = new Set(messages.filter((m) => m.isAdmin).map((m) => m.userId));
    if (isAdmin) ids.add(self.userId);
    return ids;
  }, [messages, isAdmin, self.userId]);

  const react = useCallback((next: Mood) => {
    const now = Date.now();
    if (now - lastReaction.current < REACTION_GAP_MS) return;
    lastReaction.current = now;
    setMood(next);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood('hello'), 1400);
  }, []);

  const addToast = useCallback((kind: ToastItem['kind'], user: OnlineUser, text: string) => {
    const id = crypto.randomUUID();
    setToasts((list) => [...list, { id, kind, text, avatarId: user.avatarId }].slice(-3));
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), TOAST_MS);
  }, []);

  const reload = useCallback(async () => {
    const recent = await chat.loadRecent();
    setMessages((cur) => mergeMessages(cur, recent));
  }, []);

  // ---------- Mulai: ambil 50 pesan terakhir & dengarkan event ----------
  useEffect(() => {
    void chat.loadRecent().then((recent) => {
      setMessages(recent);
      requestAnimationFrame(() => listRef.current?.scrollToBottom());
    });

    const offs = [
      chat.on('message_added', (m) => {
        setMessages((cur) => mergeMessages(cur, [m]));
        const mine = m.userId === self.userId;
        if (mine) {
          requestAnimationFrame(() => listRef.current?.scrollToBottom(true));
          return;
        }
        if (live.current.blocked.some((b) => b.userId === m.userId)) return;
        if (!atBottom.current) setNewCount((n) => n + 1);
        if (document.hidden) {
          unread.current += 1;
          setUnreadTitle(unread.current);
        }
        if (live.current.soundOn) playPop();
        react('jump');
      }),
      chat.on('message_deleted', ({ id }) => {
        setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, deleted: true, text: null, imageUrl: null, stickerId: null } : m)));
        setLightbox((lb) => (lb?.id === id ? null : lb));
      }),
      chat.on('online_changed', setOnline),
      chat.on('user_joined', (u) => {
        if (u.userId === self.userId) return;
        addToast('joined', u, live.current.t('toast.joined', { name: u.nickname }));
        react('wave');
      }),
      chat.on('user_left', (u) => {
        if (u.userId === self.userId) return;
        addToast('left', u, live.current.t('toast.left', { name: u.nickname }));
      }),
      chat.on('kicked', ({ until }) => {
        const ms = Date.parse(until);
        save('kickedUntil', ms);
        onKicked(ms);
      }),
      chat.on('connection_changed', (status) => {
        setConn(status);
        // Tersambung lagi: ambil ulang pesan supaya yang terlewat & yang dihapus ikut muncul.
        if (status === 'connected' && prevConn.current !== 'connected') void reload();
        prevConn.current = status;
      }),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  // Judul tab kembali normal saat tab dibuka lagi.
  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) {
        unread.current = 0;
        setUnreadTitle(0);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      setUnreadTitle(0);
    };
  }, []);

  // Internet browser putus/nyambung (penting di HP).
  useEffect(() => {
    const off = () => setConn('offline');
    const on = () => setConn(prevConn.current);
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => {
      window.removeEventListener('offline', off);
      window.removeEventListener('online', on);
    };
  }, []);

  useEffect(() => saveHidden(hidden), [hidden]);
  useEffect(() => saveBlocked(blocked), [blocked]);
  useEffect(() => save('sound', soundOn), [soundOn]);

  // ---------- Kirim ----------
  const failText = (reason: SendFailReason, fileName = '') => t(`err.${reason}` as TKey, { file: fileName });

  const handleResult = (res: SendResult, fileName?: string): boolean => {
    if (res.ok) {
      setComposerError(null);
      return true;
    }
    if (res.reason === 'kicked') {
      const until = load<number>('kickedUntil', 0);
      if (until > Date.now()) onKicked(until);
    }
    setComposerError(failText(res.reason, fileName));
    return false;
  };

  const sendText = async (text: string) => {
    unlockSound();
    return handleResult(await chat.sendText(text));
  };

  const sendSticker = async (id: string) => {
    unlockSound();
    handleResult(await chat.sendSticker(id));
  };

  const pickImage = async (file: File) => {
    const check = await checkImage(file);
    if (!check.ok) {
      setComposerError(failText(check.reason, file.name));
      return;
    }
    setComposerError(null);
    setPreview(file);
  };

  const sendImage = async () => {
    const file = preview;
    setPreview(null);
    if (!file) return;
    try {
      const small = await shrinkImage(file);
      handleResult(await chat.sendImage(small), file.name);
    } catch {
      setComposerError(t('err.generic'));
    }
  };

  // ---------- Menu pesan ----------
  const doHide = (m: ChatMessage) => {
    setHidden((h) => [...h, m.id]);
    setMenuFor(null);
  };
  const doBlock = (m: ChatMessage) => {
    setBlocked((b) => (b.some((x) => x.userId === m.userId) ? b : [...b, { userId: m.userId, nickname: m.nickname, avatarId: m.avatarId }]));
    setMenuFor(null);
  };
  const doConfirm = async () => {
    if (!confirm) return;
    const { type, message } = confirm;
    setConfirm(null);
    try {
      if (type === 'delete') await chat.deleteMessage(message.id);
      else await chat.kickUser(message.userId);
    } catch {
      setComposerError(t('err.generic'));
    }
  };

  const leave = async () => {
    await chat.leave();
    onLeave();
  };

  const onAtBottomChange = (now: boolean) => {
    atBottom.current = now;
    if (now) setNewCount(0);
  };

  const onlineList = (onClose?: () => void) => (
    <OnlineList
      users={online}
      selfId={self.userId}
      adminIds={adminIds}
      blockedCount={blocked.length}
      onClose={onClose}
      onOpenBlocked={() => {
        setOnlineOpen(false);
        setBlockedOpen(true);
      }}
    />
  );

  return (
    <div className="chat">
      <header className="chat__header">
        <Mascot mood={mood} size={40} className="chat__logo" />
        <div className="chat__titles">
          <div className="chat__title-row">
            <h1 className="chat__title">{t('app.name')}</h1>
            {IS_DEMO && (
              <div className="demo">
                <button type="button" className="demo-pill demo-pill--small" aria-expanded={demoOpen} onClick={() => setDemoOpen((o) => !o)}>
                  <span className="only-mobile">{t('demo.short')}</span>
                  <span className="only-desktop">{t('demo.badge')}</span>
                </button>
                {demoOpen && (
                  <div className="demo__menu" role="menu" aria-label={t('demo.menuTitle')}>
                    <p className="demo__note">{t('demo.note')}</p>
                    <button
                      type="button"
                      role="menuitem"
                      className="menu__item"
                      onClick={() => {
                        setDemoOpen(false);
                        chat.demo?.simulateDisconnect();
                      }}
                    >
                      <Icon name="wifiOff" />
                      {t('demo.disconnect')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="menu__item menu__item--danger"
                      onClick={() => {
                        setDemoOpen(false);
                        chat.demo?.simulateKickSelf();
                      }}
                    >
                      <Icon name="logout" />
                      {t('demo.kickSelf')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button type="button" className={`online-btn only-mobile ${onlineOpen ? 'is-on' : ''}`} aria-expanded={onlineOpen} onClick={() => setOnlineOpen((o) => !o)}>
            <Icon name="users" size={16} />
            <span className="online-btn__dot" aria-hidden="true" />
            {t('chat.online', { n: online.length })}
          </button>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={soundOn ? t('chat.soundOn') : t('chat.soundOff')}
          aria-pressed={soundOn}
          onClick={() => {
            unlockSound();
            setSoundOn((s) => !s);
          }}
        >
          <Icon name={soundOn ? 'bell' : 'bellOff'} />
        </button>
        <div className="only-mobile">
          <LanguageMenu />
        </div>
        <div className="only-desktop">
          <LanguageSwitch />
        </div>
        <button type="button" className="leave-btn" onClick={() => void leave()}>
          <Icon name="logout" size={18} />
          {t('chat.leave')}
        </button>
      </header>

      <div className="chat__body">
        <aside className="chat__side only-desktop" aria-label={t('online.title')}>
          {onlineList()}
        </aside>

        <main className="chat__main">
          {conn !== 'connected' && (
            <div className="conn-banner" role="status">
              <Icon name="wifiOff" />
              {conn === 'offline' ? t('conn.offline') : t('conn.reconnecting')}
            </div>
          )}
          <Toasts items={toasts} />
          <MessageList
            ref={listRef}
            messages={visible}
            selfId={self.userId}
            newCount={newCount}
            onAtBottomChange={onAtBottomChange}
            onOpenMenu={(m) => setMenuFor(m)}
            onOpenImage={setLightbox}
            corner={
              <div className="chat__mascot" aria-hidden="true">
                <Mascot mood={mood} size={54} idle={mood === 'hello'} />
              </div>
            }
          />
          <Composer
            disabled={conn !== 'connected'}
            error={composerError}
            onDismissError={() => setComposerError(null)}
            onSendText={sendText}
            onSendSticker={(id) => void sendSticker(id)}
            onPickImage={(f) => void pickImage(f)}
          />
        </main>
      </div>

      {onlineOpen && (
        <div className="online-pop only-mobile">
          <div className="online-pop__scrim" onClick={() => setOnlineOpen(false)} aria-hidden="true" />
          <div className="online-pop__panel" role="dialog" aria-label={t('online.title')}>
            {onlineList(() => setOnlineOpen(false))}
          </div>
        </div>
      )}

      {blockedOpen && (
        <BlockedSheet
          blocked={blocked}
          hiddenCount={hidden.length}
          onUnblock={(id) => setBlocked((b) => b.filter((x) => x.userId !== id))}
          onShowHidden={() => setHidden([])}
          onClose={() => setBlockedOpen(false)}
        />
      )}

      {menuFor && (
        <MessageMenu
          message={menuFor}
          isAdmin={isAdmin}
          onClose={() => setMenuFor(null)}
          onHide={() => doHide(menuFor)}
          onBlock={() => doBlock(menuFor)}
          onDelete={() => {
            setConfirm({ type: 'delete', message: menuFor });
            setMenuFor(null);
          }}
          onKick={() => {
            setConfirm({ type: 'kick', message: menuFor });
            setMenuFor(null);
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'kick' ? t('confirm.kickTitle', { name: confirm.message.nickname }) : t('confirm.deleteTitle')}
          body={confirm.type === 'kick' ? t('confirm.kickBody', { name: confirm.message.nickname }) : t('confirm.deleteBody')}
          confirmLabel={confirm.type === 'kick' ? t('confirm.kickYes') : t('confirm.deleteYes')}
          onConfirm={() => void doConfirm()}
          onCancel={() => setConfirm(null)}
        />
      )}

      {preview && <ImagePreview file={preview} onCancel={() => setPreview(null)} onSend={() => void sendImage()} />}
      {lightbox && <Lightbox message={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
