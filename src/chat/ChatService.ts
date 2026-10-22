// "Colokan" ChatService — lihat docs/architecture.md bagian 4.0 dan 5.
// Semua layar HANYA berbicara lewat kontrak ini, tidak pernah langsung ke Supabase.
// Tahap 1: MockChatService. Tahap 2: SupabaseChatService (file baru, kontrak sama).

import type {
  AdminSignInResult,
  ChatEventName,
  ChatEvents,
  ChatMessage,
  JoinResult,
  OnlineUser,
  SendResult,
} from './types';

export interface ChatService {
  /** Masuk ruang chat. Ditolak dengan alasan name_taken / kicked / invalid_name. */
  join(nickname: string, avatarId: string): Promise<JoinResult>;
  /** Keluar ruang chat. */
  leave(): Promise<void>;
  /** 50 pesan terakhir, urut dari yang paling lama. */
  loadRecent(): Promise<ChatMessage[]>;

  sendText(text: string): Promise<SendResult>;
  sendSticker(stickerId: string): Promise<SendResult>;
  /** File sudah diperiksa dan diperkecil oleh tampilan sebelum dikirim. */
  sendImage(file: Blob): Promise<SendResult>;

  adminSignIn(password: string): Promise<AdminSignInResult>;
  adminSignOut(): Promise<void>;
  isAdmin(): boolean;
  /** Khusus admin. */
  deleteMessage(messageId: string): Promise<void>;
  /** Khusus admin. Orang itu dikeluarkan selama 30 menit. */
  kickUser(userId: string): Promise<void>;

  /** Dengarkan event. Mengembalikan fungsi untuk berhenti mendengarkan. */
  on<E extends ChatEventName>(event: E, handler: (payload: ChatEvents[E]) => void): () => void;

  /** Diri sendiri setelah join, atau null. */
  getSelf(): OnlineUser | null;
  getOnline(): OnlineUser[];

  /** Hanya ada di mode demo: tombol simulasi untuk mencoba tampilan. */
  readonly demo?: DemoControls;
}

export interface DemoControls {
  simulateDisconnect(): void;
  simulateKickSelf(): void;
}

/** Pembantu kecil untuk mengelola daftar pendengar event. */
export class Emitter {
  private handlers = new Map<ChatEventName, Set<(p: never) => void>>();

  on<E extends ChatEventName>(event: E, handler: (payload: ChatEvents[E]) => void): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as (p: never) => void);
    return () => set!.delete(handler as (p: never) => void);
  }

  emit<E extends ChatEventName>(event: E, payload: ChatEvents[E]): void {
    this.handlers.get(event)?.forEach((h) => (h as (p: ChatEvents[E]) => void)(payload));
  }
}
