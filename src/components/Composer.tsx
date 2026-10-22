// Kotak tulis: teks, tombol stiker, tombol gambar, tombol kirim.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../i18n';
import { Icon } from './Icon';
import { StickerPicker } from './StickerPicker';

export const MAX_TEXT = 500;
const COUNTER_FROM = 400;

interface Props {
  disabled: boolean;
  error: string | null;
  onDismissError: () => void;
  onSendText: (text: string) => Promise<boolean>;
  onSendSticker: (id: string) => void;
  onPickImage: (file: File) => void;
}

export function Composer({ disabled, error, onDismissError, onSendText, onSendSticker, onPickImage }: Props) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [stickersOpen, setStickersOpen] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const length = Array.from(draft).length;
  const canSend = !disabled && !sending && draft.trim().length > 0 && length <= MAX_TEXT;

  // Tinggi kotak mengikuti isi, maksimal ±5 baris.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    const ok = await onSendText(draft.trim());
    setSending(false);
    if (ok) setDraft(''); // kalau gagal, teks yang sudah diketik tidak hilang
    area.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="composer">
      {error && (
        <div className="composer__error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
          <button type="button" className="icon-btn icon-btn--tiny" aria-label={t('err.close')} onClick={onDismissError}>
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
      {stickersOpen && (
        <StickerPicker
          onClose={() => setStickersOpen(false)}
          onPick={(id) => {
            onSendSticker(id);
            setStickersOpen(false);
          }}
          disabled={disabled}
        />
      )}
      <div className="composer__row">
        <button
          type="button"
          className={`icon-btn ${stickersOpen ? 'is-on' : ''}`}
          aria-label={t('composer.stickers')}
          aria-expanded={stickersOpen}
          onClick={() => setStickersOpen((o) => !o)}
        >
          <Icon name="smile" />
        </button>
        <button type="button" className="icon-btn" aria-label={t('composer.image')} onClick={() => fileInput.current?.click()} disabled={disabled}>
          <Icon name="image" />
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onPickImage(file);
          }}
        />
        <div className="composer__field">
          <textarea
            ref={area}
            rows={1}
            value={draft}
            maxLength={MAX_TEXT + 20}
            aria-label={t('composer.label')}
            placeholder={t('composer.placeholder')}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {length >= COUNTER_FROM && (
            <span className={`composer__count ${length > MAX_TEXT - 20 ? 'is-warn' : ''}`} aria-live="polite">
              {length}/{MAX_TEXT}
            </span>
          )}
        </div>
        <button
          type="button"
          className="send-btn"
          aria-label={sending ? t('composer.sending') : t('composer.send')}
          disabled={!canSend}
          onClick={() => void send()}
        >
          <Icon name={sending ? 'spinner' : 'send'} />
        </button>
      </div>
    </div>
  );
}
