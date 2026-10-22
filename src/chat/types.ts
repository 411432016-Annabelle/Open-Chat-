// Format data yang disepakati di docs/architecture.md bagian 5.3 dan 5.4.
// Mock (Tahap 1) dan Supabase (Tahap 2) wajib memakai bentuk yang sama persis.

export type MessageKind = 'text' | 'sticker' | 'image';

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  avatarId: string;
  kind: MessageKind;
  text: string | null;
  stickerId: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  deleted: boolean;
  /** Waktu kirim dari jam server, format ISO (mis. 2026-10-20T08:15:00Z). */
  createdAt: string;
}

export interface OnlineUser {
  userId: string;
  nickname: string;
  avatarId: string;
  isAdmin: boolean;
  onlineAt: string;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

export type JoinResult =
  | { ok: true; self: OnlineUser }
  | { ok: false; reason: 'name_taken' | 'invalid_name' }
  | { ok: false; reason: 'kicked'; until: string };

export type SendFailReason = 'too_long' | 'too_fast' | 'kicked' | 'offline' | 'too_big' | 'not_image';

export type SendResult = { ok: true; message: ChatMessage } | { ok: false; reason: SendFailReason };

export type AdminSignInResult = { ok: true } | { ok: false; reason: 'wrong_password' };

/** Event dari ChatService ke tampilan (bagian 5.2). */
export interface ChatEvents {
  message_added: ChatMessage;
  message_deleted: { id: string };
  online_changed: OnlineUser[];
  user_joined: OnlineUser;
  user_left: OnlineUser;
  kicked: { until: string };
  connection_changed: ConnectionStatus;
}

export type ChatEventName = keyof ChatEvents;
