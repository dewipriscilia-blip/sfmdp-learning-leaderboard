# Panduan pemasangan - AHM SFMDP Learning Leaderboard

Disiapkan 5 Oktober 2026. Untuk DP/Dewi dan tim proyek. Panduan ini memisahkan fitur yang sudah berjalan dari integrasi yang masih perlu dipasang pada akun milik proyek.

## 1. Apa yang sudah tersedia

**Versi lokal:** dashboard, leaderboard individu/kelompok, pencarian/filter, rincian skor, perbandingan arsip, impor tiga format Excel 2025, impor format standar 2026, validasi, ekspor CSV/backup JSON, dan tampilan presentasi. Logo Freshminds dan AHM adalah aset yang ditemukan dalam workbook, bukan hasil menggambar ulang.

**Belum tersedia:** penyimpanan bersama, login admin/viewer, Google Sheets live sync, penerbitan hasil kepada klien, dan deployment pada akun Anda. Ikuti tahap 4-8 untuk menambahkan kemampuan ini. Tombol Presentasi pada versi lokal hanya mengubah tampilan.

Fokus aplikasi ini adalah leaderboard hasil pembelajaran individu dan kelompok. Ini belum merupakan scoreboard pos Amazing Race Day 1. Jangan menggabungkan kelompok outbound dengan pasangan pre-learning tanpa mapping yang disetujui.

## 2. Coba versi lokal terlebih dahulu

1. Ekstrak paket INTERNAL ke folder di komputer.
2. Buka `SFMDP_Leaderboard_Demo.html` dengan Chrome atau Edge yang mutakhir. Aplikasi ini mandiri dan tidak membutuhkan API key.
3. Pilih proyek `2025 - Uji dengan data tahun sebelumnya`. Nama/dealer disamarkan, tetapi angka dalam HTML INTERNAL berasal dari sumber 2025.
4. Buka Ringkasan. Baseline yang diharapkan adalah 30 peserta, 5 kelompok, dan 35/35 total sesuai pembanding.
5. Untuk melihat identitas asli, pilih Data & impor, lalu unggah `SFMDP_Data_Uji_2025_INTERNAL.json`. Periksa preview dan klik Terapkan impor.
6. Alternatif pengujian file asli: impor `Leaderboard SFMDP .xlsx`, lalu `Rekap Penilaian Evaluasi Pembelajaran.xlsx`, kemudian `03 - [Day 2 & Day 3] Lembar Penilaian Fasil.xlsx`. Konfirmasikan setiap preview. Urutan ini menetapkan roster dahulu, kemudian nilai sumber.
7. Buka Leaderboard, ganti tab Individu/Kelompok, dan klik nama untuk rincian. Filter tidak mengubah peringkat global.
8. Coba Ekspor CSV dan Presentasi. Untuk kembali dari presentasi, gunakan tombol keluar yang tersedia.
9. Ekspor backup JSON sebelum reload/menutup tab. Perubahan sesi lokal tidak tersimpan otomatis.

Impor tidak membaca folder komputer secara otomatis. Jika sumber Excel diperbarui, impor ulang sumber terkait. Ini menghilangkan pengetikan ulang nilai dan penghitungan ranking, tetapi belum merupakan sinkronisasi langsung.

Bila file HTML diblokir oleh kebijakan laptop atau tidak berjalan lewat preview unduhan, buka source dengan `npm run dev` pada komputer yang diizinkan, atau lanjutkan ke AI Studio. Jangan mematikan kebijakan keamanan perangkat.

## 3. Siapkan source untuk Google AI Studio

Gunakan `SFMDP_AI_Studio_Source.zip`, bukan paket INTERNAL. Source ini memuat fixture dengan nama dan nilai sintetis agar evaluasi peserta tidak dimasukkan ke prompt atau kode.

1. Ekstrak ZIP.
2. Buka GitHub dan buat repository baru, misalnya `sfmdp-learning-leaderboard`. Pilih **Private**. Gunakan akun/organisasi yang disetujui tim.
3. Pilih Add file > Upload files. Pada repository baru, tautan upload an existing file mungkin berada di area Quick setup.
4. Unggah isi folder hasil ekstrak, bukan ZIP-nya. Pastikan `package.json`, `server.mjs`, `build.mjs`, `README.md`, serta folder `src`, `tests`, `templates`, `docs` berada langsung di root repository. Jangan hanya mengunggah satu folder pembungkus tambahan.
5. Commit changes. Jangan unggah workbook atau JSON INTERNAL.
6. Buka Google AI Studio, pilih Build. Dalam kotak prompt, klik Add files (+), lalu Import from GitHub. Hubungkan hanya repository yang dibutuhkan saat diminta.
7. Pilih repository tersebut, kemudian kirim **PROMPT 01** dari `03_PROMPTS_AI_STUDIO.md`.
8. Tunggu preview dan minta agent memastikan `npm test` serta `npm run build` berhasil. Jangan lanjut jika layar kosong atau perhitungan berubah.

Pada source pengembangan, angka awal sengaja berbeda dari hasil asli karena sintetis. Sesudah data asli diimpor lewat aplikasi internal yang telah diizinkan, hasil harus cocok dengan baseline 2025. Jangan meminta AI menebak atau mengembalikan nama asli dari fixture.

Dokumentasi resmi menyebut Import from GitHub pada menu Add files. Beberapa bagian FAQ dokumentasi tidak sepenuhnya konsisten dengan fitur baru. Jika opsi tidak muncul pada akun, jangan mengubah repository menjadi public; catat layar/menu yang tersedia untuk menyesuaikan jalur pemasangan.

## 4. Tambahkan penyimpanan dan login yang nyata

Tujuan: nilai tidak hilang saat refresh dan anggota tim dapat melihat data yang sama.

1. Kirim **PROMPT 02**. Ini meminta Firebase Authentication dan Firestore, bukan sekadar layar login.
2. Saat muncul kartu konfigurasi Firebase, pilih proyek yang disetujui pemilik akun. Jangan membuat proyek berbayar tanpa persetujuan.
3. Aktifkan Sign in with Google melalui alur setup. Agent harus menyebutkan pengaturan yang benar-benar belum selesai.
4. Login sebagai admin yang disetujui. Minta agent menunjukkan UID akun dan lokasi pengaturan peran. Tetapkan admin pertama melalui Firebase Console atau prosedur backend terpercaya; jangan menerima pola 'pengguna pertama otomatis admin'.
5. Semua pengguna lain harus ditolak sampai diberi akses. Tambahkan satu akun uji sebagai viewer.
6. Uji bahwa data tetap tersedia setelah refresh dan terlihat dari browser/perangkat kedua.
7. Uji bahwa viewer tidak bisa membaca data mentah atau mengubah nilai, termasuk melalui request API langsung. Menyembunyikan tombol bukan pengamanan.

Uji tahap ini memakai data sintetis. Berikan akses hanya kepada pihak yang memang diizinkan. Koneksi ke akun, persetujuan, billing dan keamanan tidak dapat diselesaikan hanya dengan mengunggah ZIP.

## 5. Siapkan Google Sheets sebagai satu sumber data 2026

Gunakan file `SFMDP_2026_Template_Data.xlsx` yang disediakan.

1. Di Google Sheets, buat spreadsheet baru. Pilih File > Import dan unggah template; gunakan Create new spreadsheet atau Insert new sheets sesuai kebutuhan.
2. Beri nama `SFMDP 2026 - Master Data Leaderboard`. Pertahankan nama tab dan header.
3. Tab **Peserta** berisi `program_year, participant_id, name, main_dealer, group_id, group_name`.
4. Tab **Komponen** berisi `program_year, component_id, label, scope, max_score, weight, enabled`.
5. Tab **Nilai_Individu** dan **Nilai_Kelompok** berisi `program_year, entity_id, component_id, value`.
6. Isi roster 2026 yang sudah disepakati. Jangan menyalin otomatis 30 peserta/5 kelompok 2025 atau menganggap 14 pasangan pre-learning sama dengan kelompok kegiatan.
7. Tentukan ID stabil. Untuk data individu, entity_id harus sama dengan participant_id; untuk data kelompok, sama dengan group_id.
8. Kolom weight adalah persen, misalnya `30`, bukan `0.30`. Total bobot aktif positif adalah 100 untuk individu dan 100 untuk kelompok. Nilai 0 pada bobot berarti komponen belum dihitung.
9. Nilai mentah harus antara 0 dan max_score. Sel kosong berarti belum dinilai; angka 0 berarti memang mendapatkan nol.
10. Biarkan General access tetap Restricted. Jangan Publish to web dan jangan Anyone with the link untuk data mentah.

Contoh format satu nilai, bukan data proyek: `2026,P001,post_day2,80`. Aplikasi menghitung skor akhir; tidak ada kolom wajib untuk mengetik total atau ranking secara manual.

Daftar komponen dalam template adalah usulan struktur, semuanya berbobot 0. Pre-learning, refreshment, bonus, dan Day 3 internal AHM tidak otomatis dihitung. Keputusan scope, bobot, maksimum, missing score, tie-break dan pengesahan hasil harus ditetapkan tim.

## 6. Hubungkan Sheets dan kurangi input berulang

1. Kirim **PROMPT 03**. Bila diperlukan, buka panel Integrations di sisi kanan AI Studio dan aktifkan Google Sheets.
2. Sambungkan dengan akun admin yang memiliki akses ke spreadsheet. Minta akses baca saja untuk sumber nilai.
3. Masukkan Spreadsheet ID/URL melalui halaman pengaturan admin yang dibuat oleh agent, bukan ke kode yang dibagikan publik.
4. Jalankan sinkronisasi pertama. Preview harus menunjukkan peserta/komponen/baris baru, perubahan nilai, data hilang, dan kesalahan. Data invalid tidak boleh menghapus dataset terakhir yang valid.
5. Periksa satu nilai yang Anda ketahui. Setelah cocok, aktifkan polling setiap 60 detik **selama halaman admin terbuka**. Tampilkan waktu sinkronisasi berhasil, error, dan label stale jika gagal.
6. Ubah satu nilai uji di Sheets. Pastikan nilai mentah, total, dan ranking draft ikut diperbarui tanpa diketik ulang di aplikasi.
7. Lakukan sinkronisasi yang sama dua kali. Jumlah peserta dan jumlah record tidak boleh bertambah.
8. Uji cabut akses Sheets. Aplikasi harus menampilkan kegagalan, mempertahankan snapshot valid sebelumnya, dan tidak menampilkan 'tersinkron' palsu.

Akun viewer klien tidak perlu mengakses Sheets mentah. Admin menyinkronkan Sheets ke database, kemudian klien membaca hasil yang telah disetujui. Polling tidak berarti proses terus berjalan ketika semua halaman ditutup. Penjadwal background memerlukan konfigurasi tambahan dan bukan bagian versi awal.

Untuk Forms/lembar fasil 2026 yang sudah memiliki format berbeda, buat adapter ke empat tabel ini setelah header aslinya tersedia. **Jangan mengetik dua kali**: pilih satu sumber resmi untuk tiap komponen, lalu mapping/transformasi ke tabel normal. Format 2026 tersebut belum diberikan, sehingga adapter Forms spesifik belum dibuat dan tidak boleh ditebak oleh AI.

## 7. Bedakan dashboard internal dan hasil klien

1. Kirim **PROMPT 04** untuk alur Validasi > Persetujuan aturan > Publish snapshot > Tampilan viewer.
2. Admin boleh melihat nilai draft dan log. Viewer hanya melihat snapshot hasil yang disetujui.
3. Saat nilai sumber berubah setelah publikasi, draft berubah tetapi snapshot klien tetap sama sampai diterbitkan kembali. Tampilkan versi dan waktu publikasinya.
4. Tombol Presentasi berfungsi untuk proyektor; hak akses tetap harus diperiksa backend.
5. Jangan mengirim link editor/Build Share AI Studio kepada klien. Gunakan URL aplikasi yang dideploy dengan login dan peran viewer.
6. Isi yang diterbitkan dibatasi pada nama/dealer/kelompok, peringkat, total, dan rincian yang diizinkan. Jangan sertakan komentar kualitatif fasilitator, jawaban pribadi, token atau identitas teknis internal.

## 8. Uji penerimaan dan deploy

Kirim **PROMPT 05**. Minimal, semua kondisi berikut harus lulus:

- 2025: tiga sumber asli menghasilkan 30 individu, 5 kelompok, 35/35 total sesuai arsip setelah impor berurutan.
- Tahun 2026 tetap kosong sebelum data 2026 diimpor; data lintas tahun ditolak.
- Contoh uji sintetis (tersedia di templates/UAT_2026_SYNTHETIC.json): test 40/50 dengan bobot 70 dan observasi 4/4 dengan bobot 30 menghasilkan 86. Skor kelompok 3/4 dengan bobot 100 menghasilkan 75, tidak menambah skor individu.
- Kosong tidak sama dengan 0. Total bobot bukan 100 membuat aturan tidak valid. Nilai di luar skala dan ID duplikat ditolak.
- Skor seri menggunakan peringkat bersama 1, 1, 3. Presisi ranking 6 desimal; tampilan 2 desimal. Ketentuan ini perlu disetujui untuk 2026.
- Sinkronisasi dua kali tidak menggandakan data; kegagalan tidak menghapus data valid; sumber angka dapat ditelusuri.
- Login, logout, refresh, browser kedua, viewer dan request API tanpa izin diuji.
- Viewer tidak dapat membaca draft/komentar mentah, mengubah nilai, mengubah bobot, atau menerbitkan hasil.
- Source, network response dan file statis tidak berisi data asli sebelum login, token, private key, atau kredensial.
- Snapshot klien stabil sampai admin memublikasikan versi berikutnya.

Setelah lolos, gunakan Deploy dari Build mode dan ikuti opsi Cloud Run pada akun. Periksa opsi proyek/billing yang benar-benar ditampilkan; hosting dan database dapat menimbulkan biaya. Jangan menyalakan fitur berbayar tanpa persetujuan tim. Pastikan URL deployment menjadi domain yang diizinkan untuk login bila diminta konfigurasi.

Tes ulang pada URL deployment, bukan hanya preview. Minta seorang rekan menguji akun viewer. Baru kemudian bagikan URL aplikasi ke klien yang diizinkan.

## Privasi dan batasan

Source AI Studio menggunakan nilai sintetis. HTML/JSON INTERNAL memuat nilai evaluasi asli walaupun nama pada tampilan awal HTML disamarkan. Simpan secara terbatas. Jangan upload paket INTERNAL ke GitHub atau prompt AI Studio. Ketentuan Google membedakan penanganan data layanan gratis dan berbayar; gunakan akun dan pemrosesan yang telah disetujui organisasi, bukan asumsi bahwa semua akun Workspace otomatis memenuhi syarat.

Tidak ada koneksi, deployment, persetujuan biaya atau akses klien yang telah dilakukan oleh pembuat paket ini. Pengujian yang sudah dilakukan adalah mesin hitung, parser, tampilan browser dan impor lokal. Integrasi cloud harus diverifikasi saat dipasang.

## Sumber resmi untuk antarmuka dan integrasi

Diperiksa 5 Oktober 2026. Nama menu dapat berbeda menurut bahasa atau ketersediaan fitur akun.

- Google AI Studio Build: https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- Full-stack, Firebase, dan Workspace APIs: https://ai.google.dev/gemini-api/docs/aistudio-fullstack
- Firebase integration: https://firebase.google.com/docs/ai-assistance/ai-studio-integration
- Deployment: https://ai.google.dev/gemini-api/docs/aistudio-deploying
- Ketentuan penggunaan data: https://ai.google.dev/gemini-api/terms
- GitHub upload: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Import Excel: https://support.google.com/docs/answer/9331167

Temuan isi penilaian bukan berasal dari web; sumbernya adalah tiga workbook yang diberikan pengguna dan pemeriksaan sel/formulanya, sebagaimana dirinci dalam `02_AUDIT_2025.md`.
