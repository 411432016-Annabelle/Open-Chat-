// "Sembunyikan / blokir untuk saya" — hanya di browser ini (architecture.md 2.5).
import { load, save } from './storage';

export interface BlockedUser {
  userId: string;
  nickname: string;
  avatarId: string;
}

export function loadHidden(): string[] {
  return load<string[]>('hidden', []);
}

export function saveHidden(ids: string[]): void {
  // Simpan secukupnya saja supaya laci browser tidak penuh.
  save('hidden', ids.slice(-500));
}

export function loadBlocked(): BlockedUser[] {
  return load<BlockedUser[]>('blocked', []);
}

export function saveBlocked(list: BlockedUser[]): void {
  save('blocked', list);
}
