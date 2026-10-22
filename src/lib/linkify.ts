// Memecah teks menjadi potongan biasa dan link. Teks TIDAK pernah diperlakukan
// sebagai HTML; link hanya dibuat untuk alamat yang diawali http:// atau https://.

export type TextPart = { type: 'text'; value: string } | { type: 'link'; value: string };

const URL_RE = /(https?:\/\/[^\s<>"']+)/gi;

export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0;
    let url = match[0];
    // Tanda baca di ujung kalimat bukan bagian dari link.
    const trail = url.match(/[.,!?;:)\]]+$/);
    if (trail) url = url.slice(0, -trail[0].length);
    if (start > last) parts.push({ type: 'text', value: text.slice(last, start) });
    parts.push({ type: 'link', value: url });
    last = start + url.length;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
  return parts;
}
