# Desain — Open Chat (Monchhichi & Crybaby)

> Ringkasan hasil desain layar, untuk dipakai saat membangun frontend (Tahap 1).
> Isi perilaku tetap mengikuti `docs/architecture.md` bagian 7. Dokumen ini
> menambahkan **tampilannya**: warna, huruf, bentuk, komponen, dan isi tiap layar.

**Link desain (kanvas di claude.ai):**
https://claude.ai/artifact/XQBBE6uT4W6JEfjbSNd9pF
*(Privat. Hanya pemilik yang bisa membukanya, kecuali dibagikan lewat menu Share.)*

---

## 1. Gaya umum

- **Kesan:** imut, lembut, pastel, dan "empuk". Hampir semua sudut membulat besar.
  Bayangan dibuat sebagai garis padat pastel di bawah elemen (misalnya
  `0 4px 0 #F6CFDC`), bukan bayangan buram. Ini memberi kesan seperti stiker atau
  mainan.
- **Mobile-first:** semua layar dirancang di ukuran HP **390 × 844**. Versi
  komputer memakai tata letak yang sama, ditambah panel online di samping.
- **Hiasan latar:** beberapa lingkaran pastel polos (biru, lavender, mint) di
  pojok layar Masuk dan layar Dikeluarkan. Tidak memakai gradasi warna.
- **Ikon:** ikon garis sederhana (gaya *lucide*, tebal garis 2.2, ujung membulat).
  Tidak memakai emoji di tampilan. 👑 ditampilkan sebagai ikon mahkota kuning.

## 2. Warna

| Nama | Kode | Dipakai untuk |
|---|---|---|
| Latar utama | `#FFF3F6` | Latar halaman (pink sangat muda) |
| Latar lembut | `#FFF7FA` / `#FFF9FB` | Kolom input, kotak tulis, area pesan di komputer |
| Permukaan | `#FFFFFF` | Kartu, header, kotak tulis, gelembung orang lain |
| Garis | `#F3D9E2` | Border input, gelembung, kotak avatar |
| Bayangan pink | `#F6CFDC` | Bayangan padat di bawah kartu/header |
| Teks utama | `#4A2F3A` | Semua teks utama (coklat-plum tua) |
| Teks kedua | `#6B4A58` / `#7A5866` | Keterangan, nama pengirim, jam |
| Pink utama (tombol) | `#EE8FB0` + teks `#3E2230` + bayangan `#D46F93` | Tombol Masuk, Kirim, Kembali |
| Pink muda | `#FBDCE6` / `#FFE3EC` | Tombol Keluar, pemilih bahasa, avatar terpilih |
| Pink pilihan | `#E5799E` | Bingkai avatar terpilih + tanda centang |
| Gelembung sendiri | `#FFD6E3` (border `#FFC4D6`) | Pesan milik sendiri |
| Gelembung admin | `#FFF6DC` (border `#F4DC9A`) | Pesan dari admin |
| Mint | `#D3F1E3` / `#E6F7EF` + teks `#1F5B40`, titik `#3FAE7C` | Tombol "N online", toast masuk, "Buka blokir" |
| Biru Crybaby | `#D6EEFB` / `#EEF7FD` + teks `#2F5E7A` | Latar gambar, layar Dikeluarkan |
| Lavender | `#E9E0FB` / `#F6F1FE` / `#CDBAF3` | Bagian admin, pesan disembunyikan |
| Kuning mahkota | isi `#F2C14E`, garis `#9A6B0E`, latar `#FFF4D6` | Ikon 👑 dan tanda "Masuk sebagai admin" |
| Peringatan | latar `#FFF1D6`, teks `#5E420A` | Banner koneksi terputus |
| Error | teks `#A3294F` / `#8E2347`, latar `#FFE8EE` / `#FFF0F3`, border `#D4547F` | Nama ditolak, sandi salah, gambar ditolak |
| Bahaya (tombol) | `#B8406A` + teks putih + bayangan `#8A2A4D` | Tombol "Ya, kick" |
| Tombol "pesan baru" | `#4A2F3A` + teks putih | Tombol "⬇ N pesan baru" |
| Latar gelap (scrim) | `rgba(74,47,58,0.35)` s/d `rgba(58,36,46,0.55)` | Di belakang panel/dialog |
| Latar lightbox | `rgba(36,22,30,0.94)` | Gambar layar penuh |

Kontras teks sudah dipilih supaya mudah dibaca (minimal 4.5:1).

## 3. Huruf

- **Judul dan tombol besar:** **Baloo 2** (tebal 700–800). Bentuknya bulat dan imut.
- **Teks biasa:** **Nunito** (tebal 600–800).
- Keduanya dari Google Fonts.
- Ukuran yang dipakai:

  | Elemen | Ukuran |
  |---|---|
  | Judul layar Masuk | 34px |
  | Judul dialog/panel | 20–28px |
  | Tombol utama | 20px Baloo |
  | Teks pesan | 15px |
  | Nama dan jam | 12–13px |
  | Label kecil | 11–12px |

## 4. Bentuk & ukuran

| Elemen | Ukuran / sudut |
|---|---|
| Kartu, panel, dialog | sudut 26–32px |
| Bottom sheet (menu dari bawah) | sudut atas 30px, ada "pegangan" kecil di atas |
| Header ruang chat | tinggi 84px, sudut bawah 26px |
| Kotak tulis | sudut atas 26px |
| Tombol utama | tinggi 52–56px, sudut 18–20px |
| Tombol ikon | 44 × 44px, sudut 16px (semua area sentuh minimal 44px) |
| Input | tinggi 52px (nama) / 44px (sandi), sudut 16–18px, border 2px |
| Gelembung pesan | sudut 20px, dengan satu sudut 6px di sisi "ekor" (kiri-bawah untuk orang lain, kanan-bawah untuk sendiri), lebar maks. 240px di HP dan 460px di komputer |
| Pil (online, toast, pesan baru) | sudut penuh (999px) |

## 5. Komponen karakter

Semua gambar karakter adalah **ilustrasi orisinal yang terinspirasi** gaya
Monchhichi & Crybaby, dibuat sebagai SVG, bukan gambar resmi.

### 5.1 Maskot (`Mascot`)
Monyet bulat berbadan kecil: kepala bulu, wajah berbentuk hati, mata besar
berkilau, pipi merah muda, dot (empeng) di mulut, tangan bulat.

| Ekspresi (`mood`) | Tampilan | Dipakai di |
|---|---|---|
| `hello` | Mata terbuka + dot | Layar Masuk (normal), logo di header |
| `wave` | Tangan kanan melambai | Masuk sebagai admin, stiker "Dadah" |
| `jump` | Sedikit naik + kilauan bintang | Maskot kecil saat ada pesan baru |
| `cry` | Mata terpejam, dua aliran air mata biru, mulut terbuka | Nama ditolak, layar Dikeluarkan |
| `sad` | Satu tetes air mata, mulut cemberut | Chat kosong, konfirmasi kick |

Pengaturan maskot: ukuran, warna bulu, warna wajah, dan warna dot.

### 5.2 Avatar (`Avatar`)
Kepala karakter saja (tanpa badan). 8 pilihan:

| Nama | Bulu | Wajah | Dot | Pita | Air mata |
|---|---|---|---|---|---|
| Momo | `#B07A5A` | `#FCE3CF` | `#F59AB8` | — | — |
| Mochi | `#E2B193` | `#FFF0E2` | `#9FD8F5` | `#F59AB8` | — |
| Kiko | `#F2B6C8` | `#FFF0F4` | `#A8E2C9` | — | — |
| Lulu | `#C9B6EE` | `#FFF3F8` | `#F59AB8` | `#FFFFFF` | — |
| Nana | `#A9D8F0` | `#FFF5EE` | `#F59AB8` | — | ✔ (Crybaby) |
| Pipi | `#BFE7D3` | `#FFF8EE` | `#F2C46D` | — | — |
| Coco | `#8C6249` | `#F8DCC6` | `#A8E2C9` | `#F2C46D` | — |
| Bubu | `#F3D592` | `#FFF6E6` | `#C9B6EE` | — | ✔ (Crybaby) |

Ukuran avatar yang dipakai:

| Tempat | Ukuran |
|---|---|
| Pilihan avatar di layar Masuk | 48px |
| Di samping pesan | 34px (HP) / 38px (komputer) |
| Daftar online | 38px |
| Toast | 30px |

### 5.3 Stiker
8 stiker, berupa maskot dengan ekspresi dan warna bulu avatar yang berbeda:

| Label | Ekspresi | Warna bulu |
|---|---|---|
| Hai! | hello | Momo |
| Dadah | wave | Mochi |
| Yay! | jump | Kiko |
| Huhu | cry | Nana |
| Sedih | sad | Bubu |
| Halo | hello | Lulu |
| Asik! | jump | Pipi |
| Daaah | wave | Coco |

Di dalam chat, stiker tampil 86px (HP) atau 96px (komputer) tanpa gelembung.

## 6. Daftar layar (artboard di kanvas)

### Baris 1 — Layar Masuk & Dikeluarkan

| Artboard | Isi |
|---|---|
| **Masuk** | Label "Mode demo" (pil bergaris putus-putus), pemilih bahasa ID/EN/中文 (kanan atas), gelembung sapaan "Hai! Siapa namamu?" + maskot `hello`, judul "Open Chat" + subjudul, kartu putih berisi kolom **Nama panggilan** dengan penghitung `4/20`, **Pilih avatar** (grid 4 × 2, yang terpilih diberi bingkai pink + centang), tombol **Masuk**. Di bawah kartu ada tautan kecil **Admin** dengan ikon gembok. |
| **Masuk — nama ditolak & sandi salah** | Maskot `cry` + gelembung "Yah… nama itu sudah dipakai". Kolom nama berbingkai merah + pesan "Nama “Momo” sedang dipakai. Coba nama lain, ya!". Bagian **Kata sandi admin** (latar lavender) dengan tombol "Pakai" + pesan "Kata sandi salah.". Tombol Masuk **nonaktif** (pucat). Judul dan tautan Admin disembunyikan supaya muat. |
| **Masuk — admin & memeriksa** | Maskot `wave` + "Halo, Admin! Pilih nama dulu ya". Tanda kuning "👑 Masuk sebagai admin" + tombol "Batal". Tombol Masuk berisi ikon putar + "Memeriksa nama…". |
| **Kamu dikeluarkan** | Latar biru Crybaby. Maskot `cry` besar (bulu biru), kartu putih "Kamu dikeluarkan", teks penjelasan, hitung mundur besar `29:41`, tombol **Kembali**. |
| Komponen: Maskot / Avatar | Pratinjau dua komponen karakter. |

### Baris 2 — Ruang Chat (HP)

Semua artboard di baris ini adalah **satu layar yang sama** (`ChatHP`) dalam
keadaan berbeda (`state`).

| Artboard (`state`) | Isi |
|---|---|
| **Ruang chat (HP)** (`normal`) | **Header:** maskot kecil, "Open Chat" + pil "Demo", tombol hijau "👥 8 online", tombol bunyi (lonceng), tombol bahasa "ID", tombol **Keluar**. **Aliran pesan:** pesan orang lain di kiri (avatar + nama + jam + tombol ⋯), pesan sendiri di kanan (jam saja). Contoh yang ada: pesan teks, pesan admin dengan 👑 dan gelembung kuning, stiker, "Pesan ini dihapus oleh admin" (bingkai putus-putus, miring), thumbnail gambar, dan link. **Toast** di kanan atas ("Pipi masuk" bingkai mint, "Rara keluar" bingkai pink). Tombol gelap **"⬇ 2 pesan baru"** di tengah bawah dan maskot kecil `jump` di kanan bawah. **Kotak tulis:** tombol stiker, tombol gambar, kolom "Ketik pesan…", tombol kirim pink. |
| **HP — daftar online** (`online`) | Latar digelapkan. Panel putih di bawah header: "Sedang online (8)", tombol tutup, daftar avatar + nama + 👑 / "(kamu)", lalu tombol "Orang yang diblokir (2)". |
| **HP — pemilih stiker** (`stiker`) | Kotak tulis meninggi dan berisi panel "Stiker" dengan grid 4 × 2. Tombol stiker diberi warna aktif. |
| **HP — pratinjau gambar** (`gambar`) | Dialog "Kirim gambar ini?" berisi pratinjau besar, nama file + ukuran ("boba-taro.jpg · 2,1 MB"), dan tombol **Batal** / **Kirim**. |
| **HP — lightbox** (`lightbox`) | Latar hampir hitam. Di atas ada avatar + "Nana · 20.45" dan tombol tutup bulat. Gambar besar di tengah, dan di bawahnya petunjuk "Ketuk di luar gambar atau tekan Esc untuk menutup". |
| **HP — menu pesan (admin)** (`menu`) | Bottom sheet berisi cuplikan pesan yang dipilih, lalu **Sembunyikan pesan ini** dan **Blokir Coco**, dengan catatan "Hanya disembunyikan di layarmu sendiri.". Setelah pemisah "👑 Khusus admin" ada **Hapus untuk semua** dan **Kick Coco** (teks merah), lalu tombol **Tutup**. |
| **HP — konfirmasi kick** (`konfirmasi`) | Dialog di tengah: maskot `sad`, "Yakin kick Coco?", penjelasan 30 menit, tombol **Batal** / **Ya, kick** (merah tua). |
| **HP — orang yang diblokir** (`blokir`) | Bottom sheet "Orang yang diblokir" + penjelasan. Setiap orang punya tombol **Buka blokir** (mint). Ada baris "3 pesan disembunyikan" + tombol **Tampilkan lagi**. |
| **HP — kosong, offline & error** (`kosong`) | **Banner kuning** "Koneksi terputus, mencoba menyambung lagi…". Tengah layar: maskot `sad`, "Belum ada yang ngobrol…", "Sapa duluan, yuk!". Di atas kotak tulis ada **pesan error gambar** ("“lucu.svg” tidak bisa dikirim. Pakai JPG, PNG, GIF, atau WebP, maksimal 5 MB."). Kotak tulis berisi teks panjang + penghitung merah `487/500`, dan tombol kirim **nonaktif**. Tombol online menunjukkan "1 online". |

### Baris 3 — Ruang Chat (komputer)

| Artboard | Isi |
|---|---|
| **Ruang chat (komputer)** | Lebar maks. 1240px. **Header** lebar: maskot, judul, "Mode demo", lonceng, pemilih bahasa ID/EN/中文 lengkap, Keluar. **Panel kiri** (±280px) berisi daftar online + tombol "Orang yang diblokir (2)". **Area chat** di kanan: gelembung lebih lebar, toast di pojok kanan atas, tombol "2 pesan baru", maskot `jump`, dan kotak tulis dengan petunjuk "Ketik pesan… (Enter untuk kirim, Shift+Enter untuk baris baru)". Kalau jendela dipersempit, panel online turun ke atas area chat. |

### Catatan di kanvas (hal yang tidak tergambar)
- Judul tab berubah menjadi "(3) Open Chat" saat tab tidak aktif, dan kembali normal saat dibuka.
- Bunyi "pop" kecil saat ada pesan baru (bukan pesan sendiri). Tombol lonceng mematikannya.
- Animasi maskot: berkedip atau bergoyang pelan, melompat saat ada pesan baru, melambai saat ada yang masuk. Paling sering sekali per beberapa detik.
- Toast hilang sendiri setelah ±3 detik, maksimal 3 ditumpuk.

## 7. Keputusan desain yang menambah atau memperjelas `architecture.md`

1. **Pengaturan "Orang yang diblokir"** dibuka dari tombol di bawah **daftar online** (HP dan komputer), supaya header tidak terlalu penuh.
2. **Tombol bahasa di header HP** hanya menampilkan kode bahasa ("ID"), dan pilihannya muncul saat diketuk. Di layar Masuk dan versi komputer, ketiga pilihan tampil berjejer.
3. **Pesan sendiri** tidak menampilkan avatar dan nama, cukup jam. **Pesan admin** memakai gelembung kuning muda selain lencana 👑.
4. **Tombol ⋯ (menu pesan)** hanya ada di pesan orang lain.
5. **Konfirmasi "Yakin?"** digambar untuk kick. Hapus untuk semua memakai dialog yang sama, dengan teks "Yakin hapus pesan ini untuk semua orang?".
6. **Saat nama ditolak atau bagian admin terbuka**, judul "Open Chat" dan subjudul disembunyikan dan maskot diperkecil, supaya semuanya tetap muat di HP tanpa perlu menggulir.
7. **Gambar contoh** di desain adalah ilustrasi boba. Di aplikasi asli, gambarnya adalah foto kiriman pengguna yang dipotong rapi (`object-fit: cover`) di thumbnail.

## 8. Catatan untuk membangun frontend

- Warna di bagian 2 dijadikan **variabel warna** di `src/theme.css`, supaya bisa diganti dari satu tempat.
- `Mascot` dan `Avatar` dibuat sebagai komponen React yang menerima pengaturan seperti di bagian 5. Data 8 avatar dan 8 stiker disimpan sebagai daftar tetap (`avatarId`/`stickerId` = nama huruf kecil, misalnya `momo`, `nana`).
- Semua tombol berupa `<button>` sungguhan. Tombol yang hanya berisi ikon diberi `aria-label`, dan avatar/maskot hiasan diberi `aria-hidden`.
- Semua tulisan di desain ditulis dalam bahasa Indonesia. Tulisan ini menjadi isi awal kamus `id.json`, lalu diterjemahkan ke `en.json` dan `zh-TW.json`.
