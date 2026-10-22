// Data 8 avatar dan 8 stiker — docs/design.md bagian 5.
// Karakter orisinal yang terinspirasi gaya Monchhichi & Crybaby.

export type Mood = 'hello' | 'jump' | 'wave' | 'cry' | 'sad';

export interface AvatarLook {
  id: string;
  name: string;
  fur: string;
  face: string;
  accent: string;
  bow?: string;
  tear?: boolean;
}

export const AVATARS: AvatarLook[] = [
  { id: 'momo', name: 'Momo', fur: '#B07A5A', face: '#FCE3CF', accent: '#F59AB8' },
  { id: 'mochi', name: 'Mochi', fur: '#E2B193', face: '#FFF0E2', accent: '#9FD8F5', bow: '#F59AB8' },
  { id: 'kiko', name: 'Kiko', fur: '#F2B6C8', face: '#FFF0F4', accent: '#A8E2C9' },
  { id: 'lulu', name: 'Lulu', fur: '#C9B6EE', face: '#FFF3F8', accent: '#F59AB8', bow: '#FFFFFF' },
  { id: 'nana', name: 'Nana', fur: '#A9D8F0', face: '#FFF5EE', accent: '#F59AB8', tear: true },
  { id: 'pipi', name: 'Pipi', fur: '#BFE7D3', face: '#FFF8EE', accent: '#F2C46D' },
  { id: 'coco', name: 'Coco', fur: '#8C6249', face: '#F8DCC6', accent: '#A8E2C9', bow: '#F2C46D' },
  { id: 'bubu', name: 'Bubu', fur: '#F3D592', face: '#FFF6E6', accent: '#C9B6EE', tear: true },
];

const FALLBACK_AVATAR: AvatarLook = { id: 'unknown', name: '?', fur: '#D9C4B0', face: '#FFF3E8', accent: '#E9D3DC' };

/** Avatar yang tidak dikenal ditampilkan sebagai gambar pengganti (bagian 9.1). */
export function avatarById(id: string): AvatarLook {
  return AVATARS.find((a) => a.id === id) ?? FALLBACK_AVATAR;
}

export function isKnownAvatar(id: string): boolean {
  return AVATARS.some((a) => a.id === id);
}

export interface Sticker {
  id: string;
  /** Kunci teks di kamus bahasa. */
  labelKey: string;
  mood: Mood;
  look: string;
}

export const STICKERS: Sticker[] = [
  { id: 'hai', labelKey: 'sticker.hai', mood: 'hello', look: 'momo' },
  { id: 'dadah', labelKey: 'sticker.dadah', mood: 'wave', look: 'mochi' },
  { id: 'yay', labelKey: 'sticker.yay', mood: 'jump', look: 'kiko' },
  { id: 'huhu', labelKey: 'sticker.huhu', mood: 'cry', look: 'nana' },
  { id: 'sedih', labelKey: 'sticker.sedih', mood: 'sad', look: 'bubu' },
  { id: 'halo', labelKey: 'sticker.halo', mood: 'hello', look: 'lulu' },
  { id: 'asik', labelKey: 'sticker.asik', mood: 'jump', look: 'pipi' },
  { id: 'daaah', labelKey: 'sticker.daaah', mood: 'wave', look: 'coco' },
];

export function stickerById(id: string | null): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}
