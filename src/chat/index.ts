// Memilih "isi colokan" ChatService berdasarkan VITE_CHAT_MODE (architecture.md 4.0).
// Tahap 2: tambahkan SupabaseChatService.ts lalu ganti cabang 'supabase' di bawah.

import type { ChatService } from './ChatService';
import { MockChatService } from './MockChatService';

export type ChatMode = 'mock' | 'supabase';

export const CHAT_MODE: ChatMode = import.meta.env.VITE_CHAT_MODE === 'supabase' ? 'supabase' : 'mock';

export const IS_DEMO = CHAT_MODE === 'mock';

function createChatService(): ChatService {
  if (CHAT_MODE === 'supabase') {
    throw new Error('SupabaseChatService belum dibuat — ini dikerjakan di Tahap 2. Pakai VITE_CHAT_MODE=mock.');
  }
  return new MockChatService();
}

export const chat: ChatService = createChatService();

export type { ChatService } from './ChatService';
export * from './types';
