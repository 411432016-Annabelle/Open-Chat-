# CLAUDE.md

Open Chat adalah ruang chat anonim tanpa login bertema Monchhichi & Crybaby (warna pastel, imut), di-hosting di GitHub Pages dan memakai Supabase untuk chat real-time.

## Wajib

- **Sebelum mulai kerja apa pun, baca `docs/architecture.md` dulu.** Semua keputusan (perilaku, layar, format data, key, urutan kerja) ada di sana.
- **Sekarang sedang di Tahap 1**: hanya membangun tampilan dengan `MockChatService` (`VITE_CHAT_MODE=mock`). Belum menyambung ke Supabase.
- **Dilarang commit file key ke git** (`.env`, `.env.local`, `.env.*.local`, atau file apa pun yang berisi secret key / service_role key, kata sandi database, atau kata sandi admin). Hanya `.env.example` tanpa nilai yang boleh di-commit. Cek `git status` sebelum setiap commit.
