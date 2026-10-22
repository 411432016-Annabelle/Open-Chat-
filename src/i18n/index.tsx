// Tiga bahasa: Indonesia, Inggris, Mandarin tradisional.
// Awalnya mengikuti bahasa browser, lalu pilihan pengguna diingat.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import id from './id.json';
import en from './en.json';
import zhTW from './zh-TW.json';
import { load, save } from '../lib/storage';

export type Lang = 'id' | 'en' | 'zh-TW';
export type TKey = keyof typeof id;
type Params = Record<string, string | number>;

const DICTS: Record<Lang, Record<TKey, string>> = { id, en, 'zh-TW': zhTW };

export const LANGS: { code: Lang; short: string; name: string }[] = [
  { code: 'id', short: 'ID', name: 'Bahasa Indonesia' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'zh-TW', short: '中文', name: '繁體中文' },
];

function detectLang(): Lang {
  const saved = load<Lang | null>('lang', null);
  if (saved && saved in DICTS) return saved;
  for (const l of navigator.languages ?? [navigator.language]) {
    const lower = l.toLowerCase();
    if (lower.startsWith('zh')) return 'zh-TW';
    if (lower.startsWith('id') || lower.startsWith('ms')) return 'id';
    if (lower.startsWith('en')) return 'en';
  }
  return 'id';
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, params?: Params) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    save('lang', l);
  }, []);

  const t = useCallback(
    (key: TKey, params?: Params) => {
      let s = DICTS[lang][key] ?? DICTS.id[key] ?? key;
      if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n harus dipakai di dalam I18nProvider');
  return v;
}
