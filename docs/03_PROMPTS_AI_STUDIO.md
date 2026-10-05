# Prompt bertahap untuk Google AI Studio

Kirim satu prompt, tunggu hasil dan pengujiannya, baru lanjut. Jangan memasukkan data peserta asli, workbook asli atau JSON INTERNAL ke chat AI. Source memakai nilai sintetis; data internal dimuat melalui aplikasi yang sudah mendapat izin dan proteksi.

## PROMPT 01 - Jalankan source yang sudah ada

```text
Bantu saya menjalankan repository ini sebagai aplikasi AHM SFMDP Learning Leaderboard. Ini bukan permintaan membuat mockup dari nol.

Baca README.md, docs/01_PANDUAN.md dan docs/02_AUDIT_2025.md, lalu periksa package.json, server.mjs, src/core.mjs, src/importer.mjs, src/app.mjs dan tests/core.test.mjs.

Jalankan npm test, npm run build, lalu npm run dev pada port environment yang diperlukan preview. Bila runtime meminta port berbeda, adaptasi server tanpa mengubah mesin hitung. Perbaiki hanya integrasi runtime yang diperlukan; jangan menulis ulang seluruh aplikasi, menghapus test, mengganti data dengan angka sembarang baru, atau mengubah aturan legacy.

Pertahankan logo src/assets/freshminds.png dan ahm.png. Gunakan teal #189C96, dark teal #0E756D, gold #FCCC3A, red #E30720 untuk aksen AHM, putih dan abu netral. Jangan menggambar ulang logo atau menggantinya dengan teks placeholder. Antarmuka berbahasa Indonesia dengan istilah program yang sudah digunakan.

Pertahankan pemisahan proyek 2025 dan 2026. Fixture 2025 di source seluruhnya sintetis. Data 2026 harus kosong dengan aturan draft, tidak menyalin peserta atau nilai tahun sebelumnya. Pertahankan individu/kelompok terpisah, null berbeda dari nol, shared rank untuk seri, dan pemeriksaan impor. Jangan gunakan Gemini/LLM untuk menghitung, memberi nilai, mengisi nilai kosong, atau menentukan ranking.

Pada tahap ini jangan menambah Firebase/Sheets dan jangan menampilkan status live palsu. Sebutkan hasil test yang benar-benar dijalankan, error aktual bila ada, dan file yang diubah. Pastikan navigasi, import, detail, filter, ekspor, serta mobile tetap berfungsi.
```

## PROMPT 02 - Database dan autentikasi nyata

```text
Lanjutkan aplikasi yang sudah bekerja; jangan mengganti UI, mesin hitung atau data sintetis. Tambahkan integrasi Firebase resmi: Firebase Authentication dengan Sign in with Google dan Firestore untuk data lintas sesi/perangkat. Tunjukkan kartu setup atau tindakan akun yang benar-benar perlu saya lakukan. Jangan berpura-pura sudah connected jika belum.

Buat pemisahan proyek/year, raw datasets, source metadata, rules versions, import/sync audit log, dan published snapshots. Jangan menyimpan data asli dalam source, file statis atau fixture. Validasi schema, nilai, ID dan scope di server sebelum commit; gunakan transaksi/versi optimistik agar edit bersama tidak saling menimpa.

Terapkan admin dan viewer per proyek dengan default deny. Admin pertama harus ditetapkan melalui console atau mekanisme server terpercaya setelah pemilik mengonfirmasi UID. Jangan jadikan pengguna pertama sebagai admin dan jangan izinkan pengguna memilih perannya sendiri. Jangan hardcode akun/email admin yang belum saya berikan.

Server wajib memverifikasi Firebase ID token dan keanggotaan/peran pada setiap endpoint. Admin SDK melewati Firestore Security Rules, sehingga otorisasi server wajib tetap ada. Buat Security Rules yang melindungi akses langsung Firestore juga. Viewer hanya membaca published snapshot dengan field yang diizinkan; raw scores, komentar, roster admin dan rules draft tidak boleh terkirim ke viewer. Tidak ada data asli yang dapat diunduh sebelum login.

Pertahankan local prototype mode hanya untuk pengembangan sintetis, dengan label jelas. Mode Presentasi bukan autentikasi. Tulis test untuk akses tanpa token, viewer menulis, akses antarproyek dan perubahan role ilegal. Setelah implementasi, buktikan refresh dan browser kedua membaca data persisten. Laporkan apa yang belum bisa diuji tanpa konfigurasi akun.
```

## PROMPT 03 - Google Sheets sebagai sumber, sinkronisasi tanpa retype

```text
Tambahkan Google Sheets melalui Workspace integration resmi AI Studio, hanya setelah Firebase/auth aktif. Minta izin baca saja untuk akun admin yang memiliki sheet, bukan Publish to web. Jika fitur integrasi tidak tersedia pada akun, hentikan setup cloud dengan penjelasan kebutuhan konfigurasi; jangan membuat endpoint publik tanpa autentikasi.

Buat halaman pengaturan khusus admin untuk memilih proyek, Spreadsheet ID yang diizinkan dan nama tab. Untuk standar 2026 baca Peserta, Komponen, Nilai_Individu dan Nilai_Kelompok sesuai CSV templates dan docs/04_DATA_DICTIONARY.md. Gunakan data numerik mentah (UNFORMATTED_VALUE) dan batch ranges. Jangan hardcode URL private ke bundle. Token/kredensial hanya di mekanisme integrasi aman/server.

Satu record nilai unik menurut projectYear + scope + entityId + componentId. Satu participant menurut projectYear + participantId. Sinkronisasi adalah pembaruan snapshot/upsert idempotent, bukan penambahan yang menggandakan records. Validasi seluruh snapshot secara atomik sebelum diterapkan. Tolak tahun, ID, header, nilai, duplikasi atau bobot yang invalid. Perlihatkan preview perubahan dan warn missing/deleted records; jangan menghapus dataset valid ketika API gagal atau sheet tiba-tiba kosong. Penghapusan data yang sah memerlukan konfirmasi admin. Simpan lastSuccessfulSync, error, source identifier dan rulesVersion.

Admin dapat menjalankan Sync sekarang. Setelah sync pertama disetujui, polling 60 detik selama tab admin terbuka, tidak overlap, exponential backoff bila gagal. Ini bukan background scheduler; jangan klaim sinkron otomatis saat semua sesi tertutup. Tampilkan data stale jika gagal. Viewer membaca snapshot yang dipublikasikan dari Firestore dan tidak diberi akses ke Sheets mentah atau OAuth admin.

Untuk profil 2025, pertahankan importer Excel sebagai jalur baseline. Adapter Sheets legacy opsional harus meniru header serta presisi yang telah didokumentasikan, bukan memakai schema 2026. Jangan menebak header Forms atau lembar fasil 2026 yang belum diberikan. Tidak perlu write-back ke Sheets pada tahap ini.

Uji ganti satu nilai, sync dua kali, ID tidak dikenal, nilai kosong, explicit zero, nilai melebihi max, kegagalan izin, respons kosong dan akses viewer. Jangan menggunakan AI untuk menafsirkan/mengisi nilai yang hilang. Jangan menandai Connected sebelum permintaan API nyata berhasil.
```

## PROMPT 04 - Review, publish, dan layar klien

```text
Tambahkan alur penerbitan hasil: Draft -> validasi -> persetujuan aturan -> Publish snapshot. Ini bukan hanya menyembunyikan sidebar.

Admin dapat mengatur komponen/bobot/maksimum untuk 2026 dan menyetujui versi aturan. Semua perubahan aturan atau sumber mengubah draft dan memerlukan publikasi baru, bukan mengubah hasil klien diam-diam. Untuk kategori aktif, jumlah bobot harus 100. Nilai wajib kosong atau invalid tidak boleh menghasilkan ranking final. Simpan UID approver, timestamp server, source version, rules version dan hash/ID snapshot. Periksa izin dan kelengkapan lagi di server saat publish, bukan hanya di browser.

Viewer yang terotorisasi hanya menerima field published snapshot: nama, Main Dealer, kelompok, rank, total, rincian yang diizinkan, versi dan waktu publikasi. Jangan mengirim raw data, komentar fasilitator, draft rules, token atau audit admin ke browser viewer. Publikasi harus atomik. Perubahan data berikutnya mengubah draft, sementara snapshot sebelumnya tetap tampil sampai admin memublikasikan ulang. Labeli dengan as-of timestamp.

Pertahankan logo asli, warna dan tampilan presentasi yang mudah dibaca di proyektor, animasi ringan dan dukungan reduced motion. Tambahkan halaman client read-only, kategori individu/kelompok, filter dan cetak ringkas. Jangan membuat gamification/power-up atau menafsirkan tes sebagai diagnosis peserta. Jangan menampilkan data sintetis sebagai hasil resmi.

Buat test bahwa viewer tidak membaca draft dan tidak dapat publish via API. Minta persetujuan sebelum menambah akun klien asli. Jangan bagikan link Build editor; siapkan deployed app URL berautentikasi setelah tahap berikutnya selesai.
```

## PROMPT 05 - Uji penerimaan dan kesiapan deployment

```text
Lakukan audit akhir aplikasi ini sebelum dipakai internal/klien. Jangan mengklaim lulus test yang tidak dijalankan.

Jalankan semua unit test awal, build, parser/import tests, dan browser flow. Pertahankan profil legacy 2025 dan 2026 terpisah. Tambahkan test berikut: weighted sample 40/50*70 + 4/4*30 = 86; group 3/4*100 = 75 tanpa menambah individu; null berbeda dari 0; ID duplikat/asing dan nilai di luar skala ditolak; bobot tidak 100 memblokir hasil; seri rank 1,1,3; ekspor CSV tidak formula-injection; import data lintas tahun ditolak; double sync idempotent; sync gagal tidak menghapus snapshot; data tetap ada setelah refresh; browser kedua membaca snapshot yang sama.

Uji otorisasi backend/Firestore: tanpa login ditolak, viewer tidak bisa write/publish/baca raw, pengguna proyek lain ditolak, self-admin ditolak. Pastikan tidak ada kunci rahasia/refresh token/data peserta asli dalam source, bundle, URL query atau log. Private source data tidak boleh dikirim ke Gemini.

Uji alur admin review -> publish -> viewer, kemudian perubahan Sheets -> draft berubah -> viewer tetap pada snapshot lama -> republish -> viewer baru berubah. Uji layar desktop dan mobile serta presentasi. Labeli koneksi yang belum dikonfigurasi sebagai Belum terhubung, bukan Live.

Berikan laporan: PASS yang benar-benar dijalankan, FAIL beserta penyebab, dan NOT RUN karena membutuhkan tindakan akun. Setelah semua gerbang terpenuhi, pandu Deploy Cloud Run dari AI Studio, tampilkan proyek/billing yang diperlukan dan minta konfirmasi sebelum tindakan berbiaya. Konfigurasikan domain login bila perlu, lalu tes ulang URL deployment. Jangan membuat data/app source public sebagai jalan pintas. Tampilkan URL aplikasi hanya setelah deployment nyata berhasil.
```

## PROMPT PERBAIKAN - Bila muncul error

```text
Perbaiki error aktual yang terlihat di preview/log ini tanpa menulis ulang seluruh proyek. Jelaskan penyebab yang didukung log, perubahan minimal, lalu jalankan ulang test terkait. Pertahankan src/core.mjs, aturan legacy, snapshot pembanding, logo dan pemisahan tahun. Jangan menghapus validasi atau mengganti data dengan dummy untuk membuat error hilang. Jangan mengklaim koneksi backend berhasil bila belum ada respons sukses nyata.
```
