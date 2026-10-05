# Laporan pengujian paket

Tanggal: 5 Oktober 2026.

## Sudah diuji pada lingkungan lokal

- 23 unit tests pada data referensi 2025: seluruhnya lulus. Meliputi jumlah record, 35 total, seluruh nilai harian, ranking, kosong/nol, duplikasi, ID, rentang, CSV dan pemisahan skor individu/kelompok.
- 23 unit tests pada source fixture sintetis: seluruhnya lulus. Fixture source sengaja berbeda dari data evaluasi asli.
- Standalone HTML berhasil dibangun dan dijalankan dalam Chromium headless. Halaman Ringkasan, Leaderboard, Impor dan Aturan dibuka tanpa page error.
- Ketiga workbook asli diimpor melalui input file aplikasi secara berurutan. Preview tampil dan hasil akhir 35/35 sesuai pembanding. Setelah impor REKAP dan fasil, tidak ada perubahan total terhadap baseline pada kebijakan presisi yang didokumentasikan.
- Tampilan desktop dan mobile dirender dan diperiksa secara visual. Kedua logo tampil dari aset asli.

## Pengujian tambahan yang lulus

- Impor template XLSX standar 2026 kosong melalui aplikasi.
- Impor fixture UAT 2026: individu 86, kelompok 75, peserta dengan komponen kosong tidak diranking.
- Ekspor CSV menghasilkan berkas unduhan, detail peserta membuka/menutup, dan Presentasi dapat diaktifkan.
- Source sintetis dibangun ulang, halaman audit tampil, dan tidak ada JavaScript page error pada alur tersebut.

## Batas hasil uji

Pengujian membuktikan fungsi lokal dan reproduksi angka arsip, bukan bahwa rumus bisnis lama sudah benar. Parser hanya diuji terhadap format yang diberikan dan kontrak standar, bukan semua kemungkinan berkas Excel.

Integrasi Google Sheets, Firebase Auth, Security Rules, sinkronisasi multiuser dan deployment Cloud Run **belum diuji pada akun pengguna** dan belum dinyatakan siap produksi. Dokumen prompt menjelaskan implementasi dan gerbang penerimaannya.

Jangan mengubah label status menjadi Live atau Final sampai integrasi nyata dan persetujuan internal selesai.
