// Layar "Kamu dikeluarkan" — architecture.md 7.3.
import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { Mascot } from '../components/Mascot';

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function KickedScreen({ until, onBack }: { until: number; onBack: () => void }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = until - now;
  return (
    <main className="kicked">
      <div className="kicked__blob kicked__blob--a" aria-hidden="true" />
      <div className="kicked__blob kicked__blob--b" aria-hidden="true" />
      <Mascot mood={left > 0 ? 'cry' : 'hello'} size={180} fur="#A9D8F0" face="#FFF5EE" idle />
      <div className="card kicked__card">
        <h1 className="kicked__title">{t('kicked.title')}</h1>
        {left > 0 ? (
          <>
            <p className="kicked__body">{t('kicked.body')}</p>
            <p className="kicked__time" role="timer" aria-live="off">
              {mmss(left)}
            </p>
          </>
        ) : (
          <p className="kicked__body">{t('kicked.over')}</p>
        )}
        <button type="button" className="btn btn--primary btn--big" onClick={onBack}>
          {t('kicked.back')}
        </button>
      </div>
    </main>
  );
}
