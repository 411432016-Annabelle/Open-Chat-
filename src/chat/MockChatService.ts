// Tahap 1: chat tiruan yang berjalan seluruhnya di dalam browser.
// Meniru perilaku server (aturan nama, batas kirim, kick, admin) dan
// menyediakan "bot" yang masuk, keluar, dan mengirim pesan supaya
// semua tampilan bisa dicoba. Lihat docs/architecture.md bagian 4.1.

import { Emitter, type ChatService, type DemoControls } from './ChatService';
import type {
  AdminSignInResult,
  ChatEventName,
  ChatEvents,
  ChatMessage,
  ConnectionStatus,
  JoinResult,
  OnlineUser,
  SendResult,
} from './types';
import { cleanNickname, isValidNickname, nicknameKey } from '../lib/nickname';
import { STICKERS, isKnownAvatar } from '../lib/characters';
import { load, save } from '../lib/storage';

const DEMO_ADMIN_PASSWORD = 'demo';
const RECENT_LIMIT = 50;
const MAX_TEXT = 500;
const RATE_COUNT = 5;
const RATE_WINDOW_MS = 5_000;
const KICK_MS = 30 * 60 * 1000;

interface Bot {
  userId: string;
  nickname: string;
  avatarId: string;
  isAdmin: boolean;
}

const BOTS_ONLINE: Bot[] = [
  { userId: 'bot-belle', nickname: 'Belle', avatarId: 'lulu', isAdmin: true },
  { userId: 'bot-coco', nickname: 'Coco', avatarId: 'coco', isAdmin: false },
  { userId: 'bot-mochi', nickname: 'Mochi', avatarId: 'mochi', isAdmin: false },
  { userId: 'bot-kiko', nickname: 'Kiko', avatarId: 'kiko', isAdmin: false },
  { userId: 'bot-nana', nickname: 'Nana', avatarId: 'nana', isAdmin: false },
  { userId: 'bot-pipi', nickname: 'Pipi', avatarId: 'pipi', isAdmin: false },
];

const BOTS_OFFLINE: Bot[] = [
  { userId: 'bot-bubu', nickname: 'Bubu', avatarId: 'bubu', isAdmin: false },
  { userId: 'bot-rara', nickname: 'Rara', avatarId: 'mochi', isAdmin: false },
  { userId: 'bot-dodo', nickname: 'Dodo', avatarId: 'coco', isAdmin: false },
];

const LINES = [
  'Ada yang udah coba boba yang baru buka dekat kampus?',
  'Aku baru beli boneka Monchhichi yang pakai baju stroberi!',
  'Hari ini hujan terus ya, enaknya rebahan sambil ngemil',
  'Ada rekomendasi lagu buat belajar malam?',
  'Siapa yang besok ada kuis? Aku belum belajar sama sekali',
  'Crybaby yang air matanya biru itu lucu banget sih',
  'Selamat pagi semuanya!',
  'Barusan lihat kucing tidur di atas motor, gemas',
  'Kalian lebih suka teh susu atau kopi susu?',
  'Wah iya setuju banget',
  'Hahaha bisa aja',
  'Aku lagi nunggu bus, bosan banget',
  'Ada yang mau main game bareng nanti malam?',
  'Makan siang apa hari ini?',
  'Semangat buat yang lagi ngerjain tugas!',
  'Menu kafe barunya ada di sini: https://contoh.id/menu',
  'Aku suka banget warna pastel di sini',
  'Nanti sore ada yang ke perpustakaan?',
  'Tadi aku salah naik bus, malah sampai terminal',
  'Lagi dengar lagu lama, jadi nostalgia',
  'Siapa yang punya koleksi boneka paling banyak?',
  'Besok libur nggak sih?',
  'Ada yang tahu toko alat tulis yang lucu-lucu?',
  'Aku baru bangun hehe',
];

function bobaImageUrl(bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="480" height="400"><rect width="120" height="100" fill="${bg}"/><rect x="0" y="82" width="120" height="18" fill="#BFE7D3"/><path d="M66 6 L58 34" stroke="#EE8FB0" stroke-width="6" stroke-linecap="round"/><rect x="34" y="28" width="52" height="10" rx="5" fill="#fff"/><path d="M38 38 L82 38 L76 90 L44 90 Z" fill="#C9B6EE"/><g fill="#6B4A58"><circle cx="50" cy="80" r="4.5"/><circle cx="60" cy="83" r="4.5"/><circle cx="70" cy="79" r="4.5"/><circle cx="55" cy="72" r="4.5"/><circle cx="66" cy="70" r="4.5"/></g><circle cx="52" cy="56" r="2.6" fill="#3B2730"/><circle cx="68" cy="56" r="2.6" fill="#3B2730"/><path d="M56 62 Q60 66 64 62" stroke="#3B2730" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const newId = () => crypto.randomUUID();

export class MockChatService implements ChatService {
  private emitter = new Emitter();
  private messages: ChatMessage[] = [];
  private online: OnlineUser[] = [];
  private offlineBots: Bot[] = [...BOTS_OFFLINE];
  private kickedBots = new Set<string>();
  private self: OnlineUser | null = null;
  private admin = false;
  private status: ConnectionStatus = 'connected';
  private botTimer: ReturnType<typeof setTimeout> | null = null;
  private sentTimes: number[] = [];
  private readonly userId: string;
  private lastLine = '';

  readonly demo: DemoControls = {
    simulateDisconnect: () => this.simulateDisconnect(),
    simulateKickSelf: () => this.simulateKickSelf(),
  };

  constructor() {
    // Identitas tersembunyi per browser (di Tahap 2 diganti identitas anonim Supabase).
    let id = load<string | null>('mock.userId', null);
    if (!id) {
      id = newId();
      save('mock.userId', id);
    }
    this.userId = id;
    const startedAt = new Date().toISOString();
    this.online = BOTS_ONLINE.map((b) => ({ ...b, onlineAt: startedAt }));
    this.messages = this.makeHistory();
  }

  // ---------- Masuk / keluar ----------

  async join(rawNickname: string, avatarId: string): Promise<JoinResult> {
    await delay(500);
    const nickname = cleanNickname(rawNickname);
    if (!isValidNickname(nickname) || !isKnownAvatar(avatarId)) return { ok: false, reason: 'invalid_name' };
    const kickedUntil = load<number>('mock.kickedUntil', 0);
    if (kickedUntil > Date.now()) return { ok: false, reason: 'kicked', until: new Date(kickedUntil).toISOString() };
    const key = nicknameKey(nickname);
    if (this.online.some((u) => u.userId !== this.userId && nicknameKey(u.nickname) === key)) {
      return { ok: false, reason: 'name_taken' };
    }
    this.self = {
      userId: this.userId,
      nickname,
      avatarId,
      isAdmin: this.admin,
      onlineAt: new Date().toISOString(),
    };
    this.online = [...this.online.filter((u) => u.userId !== this.userId), this.self];
    this.status = 'connected';
    this.emitter.emit('online_changed', this.getOnline());
    this.scheduleBot();
    return { ok: true, self: this.self };
  }

  async leave(): Promise<void> {
    this.stopBots();
    this.online = this.online.filter((u) => u.userId !== this.userId);
    this.self = null;
    this.emitter.emit('online_changed', this.getOnline());
  }

  async loadRecent(): Promise<ChatMessage[]> {
    await delay(200);
    return this.messages.slice(-RECENT_LIMIT).map((m) => ({ ...m }));
  }

  // ---------- Kirim ----------

  async sendText(text: string): Promise<SendResult> {
    if (Array.from(text).length > MAX_TEXT) return { ok: false, reason: 'too_long' };
    return this.send({ kind: 'text', text, stickerId: null, imageUrl: null });
  }

  async sendSticker(stickerId: string): Promise<SendResult> {
    if (!STICKERS.some((s) => s.id === stickerId)) return { ok: false, reason: 'not_image' };
    return this.send({ kind: 'sticker', text: null, stickerId, imageUrl: null });
  }

  async sendImage(file: Blob): Promise<SendResult> {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return { ok: false, reason: 'not_image' };
    if (file.size > 5 * 1024 * 1024) return { ok: false, reason: 'too_big' };
    await delay(400); // pura-pura mengunggah
    return this.send({ kind: 'image', text: null, stickerId: null, imageUrl: URL.createObjectURL(file) });
  }

  private async send(body: Pick<ChatMessage, 'kind' | 'text' | 'stickerId' | 'imageUrl'>): Promise<SendResult> {
    await delay(150);
    if (!this.self || this.status !== 'connected') return { ok: false, reason: 'offline' };
    if (load<number>('mock.kickedUntil', 0) > Date.now()) return { ok: false, reason: 'kicked' };
    const now = Date.now();
    this.sentTimes = this.sentTimes.filter((t) => now - t < RATE_WINDOW_MS);
    if (this.sentTimes.length >= RATE_COUNT) return { ok: false, reason: 'too_fast' };
    this.sentTimes.push(now);
    const message: ChatMessage = {
      id: newId(),
      userId: this.self.userId,
      nickname: this.self.nickname,
      avatarId: this.self.avatarId,
      isAdmin: this.admin, // di Tahap 2 diisi server, bukan browser
      deleted: false,
      createdAt: new Date().toISOString(),
      ...body,
    };
    this.push(message);
    return { ok: true, message };
  }

  // ---------- Admin ----------

  async adminSignIn(password: string): Promise<AdminSignInResult> {
    await delay(400);
    if (password !== DEMO_ADMIN_PASSWORD) return { ok: false, reason: 'wrong_password' };
    this.admin = true;
    return { ok: true };
  }

  async adminSignOut(): Promise<void> {
    this.admin = false;
  }

  isAdmin(): boolean {
    return this.admin;
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.admin) throw new Error('Hanya admin yang boleh menghapus pesan.');
    const m = this.messages.find((x) => x.id === messageId);
    if (!m) return;
    Object.assign(m, { deleted: true, text: null, imageUrl: null, stickerId: null });
    if (this.status === 'connected') this.emitter.emit('message_deleted', { id: messageId });
  }

  async kickUser(userId: string): Promise<void> {
    if (!this.admin) throw new Error('Hanya admin yang boleh meng-kick.');
    const user = this.online.find((u) => u.userId === userId);
    this.kickedBots.add(userId);
    if (!user) return;
    this.online = this.online.filter((u) => u.userId !== userId);
    this.emitter.emit('user_left', user);
    this.emitter.emit('online_changed', this.getOnline());
  }

  // ---------- Event & keadaan ----------

  on<E extends ChatEventName>(event: E, handler: (payload: ChatEvents[E]) => void): () => void {
    return this.emitter.on(event, handler);
  }

  getSelf(): OnlineUser | null {
    return this.self;
  }

  getOnline(): OnlineUser[] {
    return this.online.map((u) => ({ ...u }));
  }

  // ---------- Simulasi (khusus demo) ----------

  private simulateDisconnect(): void {
    if (!this.self || this.status !== 'connected') return;
    this.status = 'reconnecting';
    this.emitter.emit('connection_changed', 'reconnecting');
    // Selama terputus, bot tetap "mengobrol" — pesannya baru terlihat setelah tersambung lagi.
    setTimeout(() => this.botSay(), 2000);
    setTimeout(() => this.botSay(), 3500);
    setTimeout(() => {
      if (!this.self) return;
      this.status = 'connected';
      this.emitter.emit('connection_changed', 'connected');
      this.emitter.emit('online_changed', this.getOnline());
    }, 6000);
  }

  private simulateKickSelf(): void {
    if (!this.self) return;
    const until = Date.now() + KICK_MS;
    save('mock.kickedUntil', until);
    const me = this.self;
    void this.leave();
    this.emitter.emit('kicked', { until: new Date(until).toISOString() });
    this.emitter.emit('user_left', me);
  }

  // ---------- Bot ----------

  private scheduleBot(): void {
    this.stopBots();
    this.botTimer = setTimeout(() => {
      this.botStep();
      if (this.self) this.scheduleBot();
    }, 5000 + Math.random() * 6000);
  }

  private stopBots(): void {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.botTimer = null;
  }

  private botStep(): void {
    if (Math.random() < 0.72) {
      this.botSay();
      return;
    }
    const bots = this.online.filter((u) => u.userId !== this.userId);
    const canJoin = this.offlineBots.filter((b) => !this.kickedBots.has(b.userId));
    if (canJoin.length > 0 && (Math.random() < 0.5 || bots.length <= 3)) {
      const bot = pick(canJoin);
      this.offlineBots = this.offlineBots.filter((b) => b.userId !== bot.userId);
      // Nama bot yang sama dengan nama pengguna tidak ikut masuk.
      if (this.self && nicknameKey(bot.nickname) === nicknameKey(this.self.nickname)) return;
      const user: OnlineUser = { ...bot, onlineAt: new Date().toISOString() };
      this.online = [...this.online, user];
      if (this.status === 'connected') {
        this.emitter.emit('user_joined', user);
        this.emitter.emit('online_changed', this.getOnline());
      }
    } else if (bots.length > 3) {
      const leaving = pick(bots.filter((b) => !b.isAdmin));
      this.online = this.online.filter((u) => u.userId !== leaving.userId);
      this.offlineBots.push({ ...leaving });
      if (this.status === 'connected') {
        this.emitter.emit('user_left', leaving);
        this.emitter.emit('online_changed', this.getOnline());
      }
    }
  }

  private botSay(): void {
    const bots = this.online.filter((u) => u.userId !== this.userId);
    if (bots.length === 0) return;
    const bot = pick(bots);
    const roll = Math.random();
    let body: Pick<ChatMessage, 'kind' | 'text' | 'stickerId' | 'imageUrl'>;
    if (roll < 0.15) body = { kind: 'sticker', text: null, stickerId: pick(STICKERS).id, imageUrl: null };
    else if (roll < 0.2) body = { kind: 'image', text: null, stickerId: null, imageUrl: bobaImageUrl(pick(['#D6EEFB', '#FBDCE6', '#E9E0FB'])) };
    else {
      let line = pick(LINES);
      if (line === this.lastLine) line = pick(LINES);
      this.lastLine = line;
      body = { kind: 'text', text: line, stickerId: null, imageUrl: null };
    }
    this.push({
      id: newId(),
      userId: bot.userId,
      nickname: bot.nickname,
      avatarId: bot.avatarId,
      isAdmin: bot.isAdmin,
      deleted: false,
      createdAt: new Date().toISOString(),
      ...body,
    });
  }

  private push(message: ChatMessage): void {
    this.messages.push(message);
    if (this.messages.length > 300) this.messages = this.messages.slice(-300);
    if (this.status === 'connected') this.emitter.emit('message_added', { ...message });
  }

  // ---------- Riwayat contoh ----------

  private makeHistory(): ChatMessage[] {
    const people = [...BOTS_ONLINE, ...BOTS_OFFLINE];
    const list: ChatMessage[] = [];
    const now = Date.now();
    for (let i = 0; i < RECENT_LIMIT; i++) {
      const who = people[(i * 7) % people.length];
      const createdAt = new Date(now - (RECENT_LIMIT - i) * 90_000).toISOString();
      const base = {
        id: newId(),
        userId: who.userId,
        nickname: who.nickname,
        avatarId: who.avatarId,
        isAdmin: who.isAdmin,
        deleted: false,
        createdAt,
        text: null as string | null,
        stickerId: null as string | null,
        imageUrl: null as string | null,
      };
      if (i === 0) {
        list.push({ ...base, ...this.adminLook(), kind: 'text', text: 'Selamat datang di Open Chat! Jaga obrolan tetap imut, ya.' });
      } else if (i % 11 === 5) {
        list.push({ ...base, kind: 'sticker', stickerId: STICKERS[i % STICKERS.length].id });
      } else if (i === 23 || i === 41) {
        list.push({ ...base, kind: 'image', imageUrl: bobaImageUrl(i === 23 ? '#D6EEFB' : '#FBDCE6') });
      } else if (i === 31) {
        list.push({ ...base, kind: 'text', deleted: true });
      } else {
        list.push({ ...base, kind: 'text', text: LINES[i % LINES.length] });
      }
    }
    return list;
  }

  private adminLook() {
    const belle = BOTS_ONLINE[0];
    return { userId: belle.userId, nickname: belle.nickname, avatarId: belle.avatarId, isAdmin: true };
  }
}
