# TKA ICG — Belajar TKA SMA 2026 untuk Kelas 12

Situs belajar mandiri Tes Kemampuan Akademik (TKA) SMA/MA 2026: materi interaktif, bank soal, dan try out yang mengikuti struktur ujian resmi per hari. Dibuat dan dikelola siswa MAN Insan Cendekia Gorontalo.

> Bukan situs resmi Kemendikdasmen, Pusmendik, maupun sekolah. Untuk jadwal dan aturan resmi, ikuti Pusmendik dan pengumuman sekolah.

## Isi situs

| Bagian | Isi |
|---|---|
| **Beranda** | Kartu kesiapan TKA (hitung mundur per gelombang, 4 hari ujian, kesiapan tiap hari), fokus berikutnya, rencana belajar harian menuju ujian, pencarian materi lintas mapel |
| **Try Out** | Simulasi Hari 1–4 sesuai jumlah soal & durasi resmi, latihan kilat 10 soal, paket penuh per mapel, timer yang tetap berjalan walau halaman ditutup, navigasi nomor + ragu-ragu, nilai per topik, pembahasan lengkap, riwayat |
| **Info TKA** | Jadwal penting, struktur ujian per hari, tiga bentuk soal, kompetensi yang diukur, daftar 18 mapel pilihan, tips hari-H |
| **Mapel wajib** | Bahasa Indonesia (literasi), Bahasa Inggris (reading), Matematika |
| **Mapel pilihan** | Matematika Tingkat Lanjut, Fisika, Kimia, Biologi, Ekonomi |

Jumlah konten: 8 mapel, 313 subbab materi, lebih dari 1.500 soal (600 soal Matematika, 822 soal kuis & HOTS mapel pilihan, 89 soal literasi bahasa berbasis teks).

Fitur lain: 7 tema warna, posisi navigasi atas/bawah/samping, ukuran teks, ekspor/impor progres (pindah HP tanpa akun), dapat dipasang sebagai aplikasi (PWA), dan dapat dipakai offline setelah materi disimpan.

## Struktur folder

```
index.html              Portal (beranda, info TKA, navigasi, pemuat aplikasi)
assets/portal.css|js    Tampilan & logika portal
assets/catalog.js       Daftar mapel/bab/subbab untuk pencarian (dihasilkan otomatis)
assets/icons/           Ikon situs & aplikasi
apps/<mapel>.html       Aplikasi materi per mapel (dimuat di dalam portal)
apps/bindo.html, bing.html + literasi.css/js   Modul Bahasa Indonesia & Bahasa Inggris
apps/tryout.html + tryout.css/js               Mesin Try Out
data/bindo.js, bing.js  Materi + bank soal literasi (bisa diedit)
data/bank-*.js          Bank soal try out per mapel (dihasilkan dari apps/*.html)
sw.js, manifest.webmanifest   Mode offline & pemasangan aplikasi
tools/                  Skrip perawatan (lihat di bawah)
```

## Menjalankan di komputer sendiri

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Buka lewat server (bukan klik ganda file) agar progres antar-mapel terbaca oleh beranda.

## Menerbitkan dengan GitHub Pages

1. Unggah seluruh isi folder ini ke akar (root) repository.
2. Buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Source: Deploy from a branch**, branch **main**, folder **/ (root)**, lalu **Save**.
4. Tunggu 1–2 menit. Situs tampil di `https://<username>.github.io/<nama-repo>/`.

Setiap kali isi situs diubah, naikkan nilai `VERSION` di `sw.js` agar pengguna mendapat versi terbaru.

## Mengubah atau menambah soal

**Bahasa Indonesia & Bahasa Inggris** — edit `data/bindo.js` atau `data/bing.js`. Isinya objek JSON:

- `chapters[].S[]` — subbab materi (`t` judul, `konsep`, `langkah`, `contoh`, `jebakan`; boleh berisi HTML sederhana).
- `stimuli[]` — teks bacaan (`id`, `title`, `type`, `text`).
- `items[]` — soal. Bentuk yang didukung:
  - `"kind": "pg"` — `options` (5 pilihan) dan `key: [indeks]`.
  - `"kind": "multi"` — PG kompleks, `key` berisi semua indeks yang benar.
  - `"kind": "bs"` — kategori, `options` berisi pernyataan, `labels` (mis. `["Fakta","Opini"]`), `key` berisi indeks label untuk tiap pernyataan.
  - `stim` menghubungkan soal ke teks; `comp` diisi salah satu dari tiga level kompetensi.

Setelah mengubah bab/subbab bahasa, jalankan `python3 tools/build_catalog.py` agar pencarian di beranda ikut diperbarui.

**Mapel lain** — soal tersimpan di dalam `apps/<mapel>.html`. Setelah mengubahnya, jalankan:

```bash
pip install playwright && playwright install chromium
python3 tools/patch_apps.py       # pastikan perbaikan tetap terpasang
python3 tools/extract_banks.py    # perbarui data/bank-*.js untuk Try Out
```

## Catatan penilaian Try Out

Nilai = jumlah soal benar ÷ jumlah soal × 100. Soal pilihan ganda kompleks dan soal kategori dianggap benar hanya jika seluruh isiannya tepat. Pembobotan TKA resmi dapat berbeda.

## Sumber

- Jadwal TKA SMA 2026: rilis Kemendikdasmen sebagaimana diberitakan Medcom.id, Warta Ekonomi, dan Brain Academy (Juli–Oktober 2026).
- Kisi-kisi dan contoh soal: Pusmendik Kemendikdasmen — https://pusmendik.kemendikdasmen.go.id/tka/
- Seluruh teks bacaan dan soal literasi ditulis khusus untuk latihan. Data survei di dalam soal adalah ilustrasi.

## Riwayat versi

- **3.0 (Oktober 2026)** — situs multi-halaman siap GitHub Pages; beranda baru dengan kartu kesiapan & rencana belajar; Info TKA; modul Bahasa Indonesia & Bahasa Inggris; mesin Try Out format per hari; mode offline/PWA; ekspor-impor progres; perbaikan posisi kunci jawaban yang menumpuk di opsi B dan perbaikan tampilan kata tebal pada materi.
- **2.0** — portal satu file berisi 6 aplikasi mapel.
