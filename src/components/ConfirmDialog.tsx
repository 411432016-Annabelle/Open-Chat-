import { useI18n } from '../i18n';
import { Mascot } from './Mascot';
import { Overlay } from './Overlay';

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Konfirmasi "Yakin?" di dalam halaman (bukan pop-up bawaan browser). */
export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }: Props) {
  const { t } = useI18n();
  return (
    <Overlay kind="dialog" role="alertdialog" label={title} onClose={onCancel}>
      <div className="confirm">
        <Mascot mood="sad" size={84} />
        <h2 className="dialog__title">{title}</h2>
        <p className="confirm__body">{body}</p>
        <div className="btn-pair">
          <button type="button" className="btn btn--soft" onClick={onCancel}>
            {t('confirm.cancel')}
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
