// Maskot Monchhichi (ilustrasi orisinal) — docs/design.md 5.1.
import type { Mood } from '../lib/characters';

interface Props {
  mood?: Mood;
  size?: number;
  fur?: string;
  face?: string;
  accent?: string;
  /** Berkedip dan bergoyang pelan. */
  idle?: boolean;
  className?: string;
  label?: string;
}

export function Mascot({
  mood = 'hello',
  size = 120,
  fur = '#B07A5A',
  face = '#FCE3CF',
  accent = '#F59AB8',
  idle = false,
  className = '',
  label,
}: Props) {
  const happy = mood === 'hello' || mood === 'jump' || mood === 'wave';
  const show = (b: boolean) => (b ? 1 : 0);
  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={Math.round((size * 130) / 120)}
      className={`mascot mascot--${mood} ${idle ? 'mascot--idle' : ''} ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g className="mascot__sparkles" opacity={show(mood === 'jump')}>
        <path d="M12 12 L14.5 19 L21 21.5 L14.5 24 L12 31 L9.5 24 L3 21.5 L9.5 19 Z" fill="#F7C948" />
        <path d="M107 22 L108.8 27 L114 28.8 L108.8 30.6 L107 36 L105.2 30.6 L100 28.8 L105.2 27 Z" fill="#9FD8F5" />
      </g>
      <g className="mascot__body">
        <circle cx="22" cy="54" r="14" fill={fur} />
        <circle cx="98" cy="54" r="14" fill={fur} />
        <circle cx="22" cy="54" r="7.5" fill={face} />
        <circle cx="98" cy="54" r="7.5" fill={face} />
        <ellipse cx="60" cy="108" rx="31" ry="21" fill={fur} />
        <ellipse cx="60" cy="111" rx="18" ry="13" fill={face} />
        <circle cx="33" cy="103" r="9" fill={fur} />
        <circle cx="87" cy="103" r="9" fill={fur} opacity={show(mood !== 'wave')} />
        <g className="mascot__arm" opacity={show(mood === 'wave')}>
          <path d="M86 94 Q98 84 103 72" stroke={fur} strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="104" cy="66" r="9.5" fill={fur} />
        </g>
        <path d="M44 20 Q50 2 60 15 Q70 2 76 20 Z" fill={fur} />
        <circle cx="60" cy="54" r="38" fill={fur} />
        <circle cx="49" cy="48" r="15" fill={face} />
        <circle cx="71" cy="48" r="15" fill={face} />
        <ellipse cx="60" cy="64" rx="27" ry="23" fill={face} />
        <g className="mascot__eyes" opacity={show(mood !== 'cry')}>
          <circle cx="51" cy="53" r="5.5" fill="#3B2730" />
          <circle cx="69" cy="53" r="5.5" fill="#3B2730" />
          <circle cx="53" cy="51" r="1.9" fill="#FFFFFF" />
          <circle cx="71" cy="51" r="1.9" fill="#FFFFFF" />
        </g>
        <g opacity={show(mood === 'cry')}>
          <path d="M45 54 Q51 48 57 54" stroke="#3B2730" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M63 54 Q69 48 75 54" stroke="#3B2730" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        <ellipse cx="40" cy="65" rx="5.5" ry="3.2" fill="#F49BB7" opacity="0.7" />
        <ellipse cx="80" cy="65" rx="5.5" ry="3.2" fill="#F49BB7" opacity="0.7" />
        <g opacity={show(happy)}>
          <circle cx="60" cy="74" r="7.5" fill={accent} />
          <circle cx="60" cy="74" r="3.4" fill="#FFFFFF" opacity="0.85" />
        </g>
        <path d="M53 78 Q60 72 67 78" stroke="#3B2730" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity={show(mood === 'sad')} />
        <ellipse cx="60" cy="76" rx="5" ry="4.2" fill="#3B2730" opacity={show(mood === 'cry')} />
        <path d="M46 59 Q41 68 46 72 Q51 68 46 59 Z" fill="#8CCBF0" opacity={show(mood === 'sad')} />
        <g className="mascot__tears" opacity={show(mood === 'cry')}>
          <path d="M48 58 Q44 72 48 90" stroke="#8CCBF0" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M72 58 Q76 72 72 90" stroke="#8CCBF0" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}
