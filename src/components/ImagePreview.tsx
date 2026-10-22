import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { formatBytes } from '../lib/image';
import { Overlay } from './Overlay';

export function ImagePreview({ file, onCancel, onSend }: { file: File; onCancel: () => void; onSend: () => void }) {
  const { t, lang } = useI18n();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <Overlay kind="dialog" label={t('image.title')} onClose={onCancel}>
      <h2 className="dialog__title">{t('image.title')}</h2>
      <div className="preview">{url && <img src={url} alt="" />}</div>
      <p className="preview__meta">
        {file.name} · {formatBytes(file.size, lang)}
      </p>
      <div className="btn-pair">
        <button type="button" className="btn btn--soft" onClick={onCancel}>
          {t('image.cancel')}
        </button>
        <button type="button" className="btn btn--primary" onClick={onSend}>
          {t('image.send')}
        </button>
      </div>
    </Overlay>
  );
}
