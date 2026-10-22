// Judul tab "(N) Open Chat" saat tab tidak aktif — architecture.md 7.2.

const BASE = 'Open Chat';

export function setUnreadTitle(count: number): void {
  document.title = count > 0 ? `(${count}) ${BASE}` : BASE;
}
