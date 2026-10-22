// Bunyi "pop" kecil untuk pesan baru, dibuat langsung oleh browser (Web Audio),
// jadi tidak perlu file suara.

let ctx: AudioContext | null = null;

/** Panggil saat pengguna pertama kali menekan sesuatu, supaya browser mengizinkan bunyi. */
export function unlockSound(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* browser tanpa Web Audio: tanpa bunyi */
  }
}

export function playPop(): void {
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(620, now);
  osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}
