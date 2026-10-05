# Data dictionary dan kontrak impor

## Format standar 2026

Header harus berada di baris pertama. Tidak ada merged cell pada tabel data. Tab Panduan diabaikan importer. program_year harus angka 2026. ID tidak boleh kosong dan harus stabil. Gunakan satu nama kelompok konsisten untuk group_id yang sama.

### Peserta

`program_year, participant_id, name, main_dealer, group_id, group_name`

participant_id unik per tahun. Data kelompok dibentuk dari group_id/group_name dalam roster. Roster diganti sebagai snapshot saat impor, bukan ditambahkan ke daftar sebelumnya. Data nilai yang merujuk ID yang tidak ada menyebabkan impor ditolak.

### Komponen

`program_year, component_id, label, scope, max_score, weight, enabled`

scope hanya `individual` atau `group`. component_id unik. max_score > 0. weight antara 0 dan 100; isikan angka persen, bukan pecahan. enabled menggunakan true/false. Komponen dengan bobot 0 tidak dihitung. Skor sah antara 0 dan max_score.

### Nilai_Individu dan Nilai_Kelompok

`program_year, entity_id, component_id, value`

entity_id merujuk participant_id untuk individu dan group_id untuk kelompok. Pasangan entity_id+component_id hanya satu record pada kategorinya. Nilai kosong menjadi null, bukan nol. Nilai 0 adalah nilai yang sah. Total dan ranking bukan input.

Jika menggunakan CSV terpisah, impor Peserta, Komponen, Nilai_Individu, kemudian Nilai_Kelompok. Gunakan nama file `Nilai_Kelompok_2026.csv` agar importer CSV mengenali scope kelompok. Format XLSX dengan keempat tab lebih mudah dan divalidasi sekaligus. CSV memakai pemisah koma; desimal angka memakai titik. Lebih aman memakai Excel/Google Sheets untuk mengedit angka menurut locale lalu mengimpor workbook.

## JSON backup

Bukan format input yang perlu diketik pengguna. Gunakan hasil Ekspor backup aplikasi, fixture uji yang disediakan, atau JSON INTERNAL. JSON menyimpan versi schema, year, roster, groups, raw scores, rules dan metadata.

## Aturan impor lokal

File maksimum 20 MB, batas total ZIP terdekompresi 80 MB. Parser mendukung .xlsx standar tanpa password; bukan .xls, .xlsm, ZIP64 atau file terenkripsi. XLSX dibaca sebagai angka tersimpan, bukan mengeksekusi formula. Pengujian dilakukan terhadap ketiga workbook yang diberikan dan template standar.

Selalu tampilkan preview dan konfirmasi sebelum menerapkan snapshot. Pengguna dapat membatalkan. Pengimporan tahun berbeda ditolak. Untuk REKAP 2025, impor roster asli lebih dahulu. Matching identitas legacy memerlukan nama unik dan kelompok yang sesuai; alias dealer yang ditemukan dicatat, tidak diubah diam-diam.

## Target backend

Collection/record key harus memasukkan year/projectId. Server melakukan validasi yang sama dengan client, menerapkan transaksi/version check dan menyimpan audit actor/time/source. Record published snapshot tidak boleh menyertakan raw scores atau komentar pribadi. Skema backend ini adalah spesifikasi tahap produksi; belum tersambung pada prototipe dasar.
