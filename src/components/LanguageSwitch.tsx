import { useEffect, useRef, useState } from 'react';
import { LANGS, useI18n } from '../i18n';

/** Tiga pilihan berjejer (layar Masuk & komputer). */
export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          className={`lang-switch__btn ${lang === l.code ? 'is-on' : ''}`}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          onClick={() => setLang(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/** Tombol kecil "ID" di header HP; pilihan muncul saat diketuk. */
export function LanguageMenu() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="lang-menu" ref={ref}>
      <button
        type="button"
        className="icon-btn icon-btn--text"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('lang.current', { lang: current.name })}
        onClick={() => setOpen((o) => !o)}
      >
        {current.short}
      </button>
      {open && (
        <div className="lang-menu__list">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              className={`lang-menu__item ${lang === l.code ? 'is-on' : ''}`}
              aria-pressed={lang === l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
