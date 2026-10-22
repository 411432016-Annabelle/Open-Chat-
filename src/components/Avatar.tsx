// Avatar kepala karakter — docs/design.md 5.2.
import { avatarById } from '../lib/characters';

export function Avatar({ id, size = 34 }: { id: string; size?: number }) {
  const a = avatarById(id);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="avatar" aria-hidden="true">
      <circle cx="15" cy="52" r="13" fill={a.fur} />
      <circle cx="85" cy="52" r="13" fill={a.fur} />
      <circle cx="15" cy="52" r="7" fill={a.face} />
      <circle cx="85" cy="52" r="7" fill={a.face} />
      <path d="M36 20 Q42 4 50 15 Q58 4 64 20 Z" fill={a.fur} />
      <circle cx="50" cy="54" r="37" fill={a.fur} />
      <circle cx="39" cy="48" r="14" fill={a.face} />
      <circle cx="61" cy="48" r="14" fill={a.face} />
      <ellipse cx="50" cy="63" rx="25" ry="22" fill={a.face} />
      <circle cx="41" cy="52" r="5" fill="#3B2730" />
      <circle cx="59" cy="52" r="5" fill="#3B2730" />
      <circle cx="42.8" cy="50.2" r="1.7" fill="#FFFFFF" />
      <circle cx="60.8" cy="50.2" r="1.7" fill="#FFFFFF" />
      <ellipse cx="32" cy="63" rx="5" ry="3" fill="#F49BB7" opacity="0.65" />
      <ellipse cx="68" cy="63" rx="5" ry="3" fill="#F49BB7" opacity="0.65" />
      <circle cx="50" cy="72" r="7" fill={a.accent} />
      <circle cx="50" cy="72" r="3.2" fill="#FFFFFF" opacity="0.85" />
      {a.tear && <path d="M37 58 Q33 66 37 69 Q41 66 37 58 Z" fill="#8CCBF0" />}
      {a.bow && (
        <g fill={a.bow}>
          <path d="M20 25 L30 31 L20 37 Z" />
          <path d="M40 25 L30 31 L40 37 Z" />
          <circle cx="30" cy="31" r="3.2" />
        </g>
      )}
    </svg>
  );
}
