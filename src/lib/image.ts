// Pemeriksaan dan pengecilan gambar sebelum dikirim — architecture.md 6.2 & 9.1.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIDE = 1600;

export type ImageCheck = { ok: true } | { ok: false; reason: 'not_image' | 'too_big' };

/** Hanya JPEG/PNG/GIF/WebP maks. 5 MB, dan isinya benar-benar bisa dibuka sebagai gambar. SVG ditolak. */
export async function checkImage(file: File): Promise<ImageCheck> {
  if (!ALLOWED.includes(file.type)) return { ok: false, reason: 'not_image' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, reason: 'too_big' };
  try {
    const bmp = await createImageBitmap(file);
    bmp.close();
    return { ok: true };
  } catch {
    return { ok: false, reason: 'not_image' };
  }
}

/** Perkecil sisi terpanjang ke 1600 px. GIF tidak diubah supaya animasinya tetap jalan. */
export async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 400 * 1024) {
    bmp.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  return blob ?? file;
}

export function formatBytes(bytes: number, locale: string): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toLocaleString(locale, { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString(locale)} KB`;
}
