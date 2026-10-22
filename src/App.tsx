// Memilih layar mana yang tampil: Masuk, Ruang Chat, atau Dikeluarkan.
import { useState } from 'react';
import type { OnlineUser } from './chat';
import { load } from './lib/storage';
import { ChatScreen } from './screens/ChatScreen';
import { JoinScreen } from './screens/JoinScreen';
import { KickedScreen } from './screens/KickedScreen';

type Screen = { name: 'join' } | { name: 'chat'; self: OnlineUser } | { name: 'kicked'; until: number };

function initialScreen(): Screen {
  const until = load<number>('kickedUntil', 0);
  return until > Date.now() ? { name: 'kicked', until } : { name: 'join' };
}

export function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const toJoin = () => setScreen({ name: 'join' });
  const toKicked = (until: number) => setScreen({ name: 'kicked', until });

  if (screen.name === 'chat') return <ChatScreen self={screen.self} onLeave={toJoin} onKicked={toKicked} />;
  if (screen.name === 'kicked') return <KickedScreen until={screen.until} onBack={toJoin} />;
  return <JoinScreen onJoined={(self) => setScreen({ name: 'chat', self })} onKicked={toKicked} />;
}
