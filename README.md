# SFMDP Learning Leaderboard - panduan awal

Aplikasi untuk uji perhitungan leaderboard AHM SFMDP dan fondasi pengembangan di Google AI Studio.

**Status:** prototipe berfungsi; belum terhubung ke akun Google Sheets, Firebase, atau Cloud Run milik proyek. Jangan menganggap tampilan Presentasi sebagai pembatasan akses.

## Mulai

1. Baca `docs/01_PANDUAN.md`.
2. Untuk Google AI Studio, gunakan prompt bertahap di `docs/03_PROMPTS_AI_STUDIO.md`.
3. Untuk menjalankan source di komputer dengan Node.js 20 atau lebih baru: `npm run dev`, lalu buka `http://localhost:3000`.
4. `npm test` menjalankan 23 pengujian; `npm run build` menghasilkan HTML mandiri dalam folder `dist`.

Tidak ada dependensi npm pada versi dasar ini. Server dasar hanya menyajikan berkas statis, bukan backend autentikasi atau penyimpanan data.

## Pemisahan data

Seluruh nama DAN nilai bawaan dalam source ini **sintetis**. Tidak ada nilai evaluasi peserta asli dalam fixture pengembangan. Uji terhadap data 2025 asli dilakukan terpisah pada aplikasi lokal, menggunakan berkas input pengguna atau JSON INTERNAL. Jangan commit JSON INTERNAL, workbook sumber, rahasia, token, atau data evaluasi ke repository.

`src/core.mjs` adalah mesin hitung deterministik; jangan menggantinya dengan penilaian AI. `src/importer.mjs` membaca format XLSX 2025 yang telah diperiksa serta format standar 2026. `src/app.mjs` dan `styles.css` membentuk antarmuka. Logo asli tersedia di `src/assets` untuk penggunaan proyek yang diizinkan.

## Keterbatasan yang disengaja

Data hanya berada dalam memori sesi browser. Ekspor backup JSON sebelum menutup atau menyegarkan halaman. Tidak ada login, kontrol peran, sinkronisasi lintas perangkat, penjadwal background, atau penerbitan snapshot klien pada versi dasar. Tahap penambahannya dijelaskan secara eksplisit dalam panduan.

Tidak ada panggilan Gemini saat aplikasi menghitung atau menampilkan nilai. Pemakaian AI Studio untuk membangun kode terpisah dari proses perhitungan aplikasi.
