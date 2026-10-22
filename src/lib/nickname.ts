// Aturan nama panggilan — docs/architecture.md bagian 5.5.

export const NICKNAME_MAX = 20;

const INVISIBLE = /[­͏؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ]/g;

/** Rapikan nama: buang karakter tak terlihat dan spasi di awal/akhir. */
export function cleanNickname(raw: string): string {
  return raw.normalize('NFKC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
}

/** Panjang dalam "huruf yang terlihat" (emoji dihitung satu). */
export function nicknameLength(name: string): number {
  return Array.from(name).length;
}

export function isValidNickname(name: string): boolean {
  const len = nicknameLength(name);
  return len >= 1 && len <= NICKNAME_MAX;
}

/** Kunci pembanding nama kembar: "Momo" = "MOMO" = "momo". */
export function nicknameKey(name: string): string {
  return cleanNickname(name).toLocaleLowerCase();
}
