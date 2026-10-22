// Layar Masuk — architecture.md 7.1, design.md 6 (baris 1).
import { useState, type FormEvent } from 'react';
import { chat, IS_DEMO, type OnlineUser } from '../chat';
import { useI18n } from '../i18n';
import { AVATARS } from '../lib/characters';
import { NICKNAME_MAX, cleanNickname, isValidNickname, nicknameLength } from '../lib/nickname';
import { unlockSound } from '../lib/sound';
import { load, save } from '../lib/storage';
import { Avatar } from '../components/Avatar';
import { Crown, Icon } from '../components/Icon';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Mascot } from '../components/Mascot';

interface Props {
  onJoined: (self: OnlineUser) => void;
  onKicked: (until: number) => void;
}

export function JoinScreen({ onJoined, onKicked }: Props) {
  const { t } = useI18n();
  const [nick, setNick] = useState(() => load('nickname', ''));
  const [avatarId, setAvatarId] = useState<string | null>(() => load<string | null>('avatarId', null));
  const [touched, setTouched] = useState(false);
  const [takenName, setTakenName] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminActive, setAdminActive] = useState(() => chat.isAdmin());
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);

  const cleaned = cleanNickname(nick);
  const len = nicknameLength(cleaned);
  const nameOk = isValidNickname(cleaned);
  const canEnter = nameOk && avatarId !== null && !submitting;

  let nameError: string | null = null;
  if (takenName) nameError = t('join.errTaken', { name: takenName });
  else if (invalid) nameError = t('join.errInvalid');
  else if (len > NICKNAME_MAX) nameError = t('join.errTooLong');
  else if (touched && len === 0) nameError = t('join.errEmpty');

  const taken = takenName !== null;
  const compact = taken || adminOpen || adminActive;
  const mood = taken ? 'cry' : adminActive ? 'wave' : 'hello';
  const greeting = taken ? t('join.greetingTaken') : adminActive ? t('join.greetingAdmin') : t('join.greeting');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canEnter || !avatarId) return;
    unlockSound();
    const until = load<number>('kickedUntil', 0);
    if (until > Date.now()) {
      onKicked(until);
      return;
    }
    setSubmitting(true);
    save('nickname', cleaned);
    save('avatarId', avatarId);
    const res = await chat.join(cleaned, avatarId);
    setSubmitting(false);
    if (res.ok) onJoined(res.self);
    else if (res.reason === 'name_taken') setTakenName(cleaned);
    else if (res.reason === 'kicked') {
      const ms = Date.parse(res.until);
      save('kickedUntil', ms);
      onKicked(ms);
    } else setInvalid(true);
  };

  const applyAdmin = async () => {
    setAdminBusy(true);
    const res = await chat.adminSignIn(password);
    setAdminBusy(false);
    if (res.ok) {
      setAdminActive(true);
      setAdminOpen(false);
      setPassword('');
      setAdminError(false);
    } else setAdminError(true);
  };

  const cancelAdmin = async () => {
    await chat.adminSignOut();
    setAdminActive(false);
  };

  return (
    <main className="join">
      <div className="join__blob join__blob--a" aria-hidden="true" />
      <div className="join__blob join__blob--b" aria-hidden="true" />
      <div className="join__blob join__blob--c" aria-hidden="true" />

      <div className="join__inner">
        <div className="join__top">
          {IS_DEMO ? <span className="demo-pill">{t('demo.badge')}</span> : <span />}
          <LanguageSwitch />
        </div>

        <div className="join__hero">
          <p className="speech" aria-live="polite">
            {greeting}
          </p>
          <Mascot mood={mood} size={compact ? 104 : 120} idle />
        </div>

        {!compact && (
          <div className="join__title">
            <h1>{t('app.name')}</h1>
            <p>{t('join.subtitle')}</p>
          </div>
        )}
        {compact && <h1 className="visually-hidden">{t('app.name')}</h1>}

        <form className="card join__card" onSubmit={submit} noValidate>
          <div className="field">
            <div className="field__label-row">
              <label htmlFor="nick">{t('join.nickname')}</label>
              <span className="field__count" aria-hidden="true">
                {len}/{NICKNAME_MAX}
              </span>
            </div>
            <input
              id="nick"
              className={`input ${nameError ? 'is-error' : ''}`}
              value={nick}
              placeholder={t('join.nicknamePlaceholder')}
              autoComplete="nickname"
              maxLength={40}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? 'nick-error' : undefined}
              onChange={(e) => {
                setNick(e.target.value);
                setTouched(true);
                setTakenName(null);
                setInvalid(false);
              }}
            />
            {nameError && (
              <p id="nick-error" className="field__error" role="alert">
                <Icon name="alert" size={18} />
                {nameError}
              </p>
            )}
          </div>

          <fieldset className="field avatars">
            <legend>{t('join.avatar')}</legend>
            <div className="avatars__grid" role="radiogroup" aria-label={t('join.avatar')}>
              {AVATARS.map((a) => {
                const on = a.id === avatarId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={a.name}
                    className={`avatars__tile ${on ? 'is-on' : ''}`}
                    onClick={() => setAvatarId(a.id)}
                  >
                    <Avatar id={a.id} size={48} />
                    {on && (
                      <span className="avatars__check" aria-hidden="true">
                        <Icon name="check" size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {avatarId === null && touched && <p className="field__hint">{t('join.avatarHint')}</p>}
          </fieldset>

          {adminOpen && !adminActive && (
            <div className="admin-box">
              <label htmlFor="adminpw" className="admin-box__label">
                <Icon name="lock" size={18} />
                {t('admin.password')}
              </label>
              <div className="admin-box__row">
                <input
                  id="adminpw"
                  type="password"
                  className={`input input--small ${adminError ? 'is-error' : ''}`}
                  value={password}
                  autoComplete="current-password"
                  aria-invalid={adminError ? true : undefined}
                  aria-describedby="admin-help"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAdminError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void applyAdmin();
                    }
                  }}
                />
                <button type="button" className="chip-btn chip-btn--lavender chip-btn--tall" disabled={adminBusy || password === ''} onClick={() => void applyAdmin()}>
                  {adminBusy ? <Icon name="spinner" size={18} /> : t('admin.use')}
                </button>
              </div>
              <p id="admin-help" className={adminError ? 'field__error' : 'field__hint'} role={adminError ? 'alert' : undefined}>
                {adminError ? t('admin.wrong') : IS_DEMO ? t('admin.demoHint') : ''}
              </p>
            </div>
          )}

          {adminActive && (
            <div className="admin-active">
              <Crown size={22} />
              <span>{t('admin.active')}</span>
              <button type="button" className="link-btn" onClick={() => void cancelAdmin()}>
                {t('admin.cancel')}
              </button>
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--big" disabled={!canEnter} aria-busy={submitting}>
            {submitting && <Icon name="spinner" />}
            {submitting ? t('join.checking') : t('join.enter')}
          </button>
        </form>

        {!adminActive && (
          <button type="button" className="link-btn join__admin" aria-expanded={adminOpen} onClick={() => setAdminOpen((o) => !o)}>
            <Icon name="lock" size={18} />
            {t('admin.link')}
          </button>
        )}
      </div>
    </main>
  );
}
