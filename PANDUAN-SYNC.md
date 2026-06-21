# PANDUAN SYNC: SiJurnal Cinta Guru → Pokjawas

Mode lokal (localStorage) tetap dipakai. Sync ini hanya untuk mengirim salinan data dari setiap madrasah ke **Google Sheet milik Pokjawas** sehingga pengawas bisa memantau dari mana saja tanpa import file JSON manual.

Gratis, pakai Google Apps Script. Setup 1x oleh Pokjawas (±10 menit), setelah itu admin/kepala madrasah tinggal klik "Sync Sekarang".

---

## A. Setup di Sisi Pokjawas (Pak Yanto, sekali saja)

### 1. Buat project Google Apps Script

1. Buka https://script.google.com → klik **New project**
2. Hapus isi `Code.gs` yang default
3. Buka file `apps-script/Code.gs` di project ini, **copy seluruh isinya**, paste ke editor Apps Script
4. Cari baris:
   ```js
   const SHARED_TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA_PAK_YANTO_2026';
   ```
   Ganti dengan token rahasia Pak Yanto (bebas, asal panjang & sulit ditebak). Contoh:
   ```js
   const SHARED_TOKEN = 'pokjawas-jember-kbc-2026-7x9k2m';
   ```
   ⚠️ **Token ini akan dibagikan ke setiap admin madrasah**. Catat baik-baik.

5. Simpan file (`Ctrl + S`), beri nama project misalnya: `SiJurnal Sync Pokjawas`

### 2. Inisialisasi Spreadsheet

1. Di toolbar atas, pilih function `setup` lalu klik **Run** (▶️)
2. Akan muncul dialog otorisasi: pilih akun Google Pak Yanto (yang akan jadi pemilik sheet)
3. Klik **Advanced** → **Go to SiJurnal Sync Pokjawas (unsafe)** → **Allow**
4. Setelah selesai, di bagian bawah editor klik tab **Execution log**, akan muncul:
   ```
   Spreadsheet siap: https://docs.google.com/spreadsheets/d/.....
   ID: 1aB.....
   ```
5. Klik URL tersebut untuk membuka sheet yang baru saja dibuat. Sheet ini yang nanti diisi otomatis dari setiap madrasah. Bookmark.

### 3. Deploy sebagai Web App

1. Klik tombol **Deploy** (kanan atas) → **New deployment**
2. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**
3. Isi:
   - **Description**: `SiJurnal v1`
   - **Execute as**: `Me (subariyantoss05@gmail.com)`
   - **Who has access**: `Anyone` ⚠️ (token rahasia melindungi endpoint)
4. Klik **Deploy** → otorisasi sekali lagi jika diminta
5. Setelah deploy, copy **Web app URL** yang muncul. Bentuknya:
   ```
   https://script.google.com/macros/s/AKfycb..../exec
   ```
6. URL inilah yang akan dipakai di aplikasi. Simpan baik-baik.

### 4. Bagikan Token + URL ke setiap admin madrasah

Format pesan ke admin madrasah:
```
Setup Sync SiJurnal:
- URL Endpoint: https://script.google.com/macros/s/AKfycb..../exec
- Token: pokjawas-jember-kbc-2026-7x9k2m
- ID Madrasah Anda: MI-NURUL-HUDA   (contoh, harus unik per madrasah)
- Nama Madrasah: MI Nurul Huda Sukowono
```

---

## B. Setup di Sisi Madrasah (Admin / Kepala Madrasah)

1. Login sebagai **admin** atau **kepala madrasah** atau **operator**
2. Buka menu **Pengaturan**
3. Scroll ke bagian **Sync ke Server Pokjawas (Google Sheet)**
4. Isi 4 field:
   - URL Endpoint Apps Script (dari Pokjawas)
   - Token Rahasia (dari Pokjawas)
   - ID Madrasah (dari Pokjawas, unik per madrasah, contoh: `MI-NURUL-HUDA`)
   - Nama Madrasah
5. Klik **Simpan Konfigurasi**
6. Klik **Sync Sekarang** → tunggu sampai muncul `✅ Sync berhasil`
7. Cek di sheet Pokjawas: tab `INDEX_MADRASAH` akan terisi 1 baris baru

Selanjutnya, setiap kali ada perubahan data penting (jurnal baru, pembiasaan baru, observasi baru), tinggal klik **Sync Sekarang**.

---

## C. Cara Pengawas Memantau

1. Buka sheet Pokjawas (URL dari langkah A.2.4)
2. Tab `INDEX_MADRASAH` → ringkasan semua madrasah + waktu sync terakhir + jumlah jurnal/pembiasaan/observasi
3. Tab `jurnalHarian`, `pembiasaanHarian`, `observasiKarakter`, dll → data detail dari semua madrasah, terkumpul jadi satu, ada kolom `_madrasahId` & `_madrasahNama` untuk filter
4. Pakai filter Sheet bawaan, pivot table, atau buat dashboard Looker Studio terhubung ke sheet ini

Bonus: di aplikasi, di menu **Pengaturan**, role pengawas/admin bisa klik tombol **Cek Daftar Madrasah Terkoneksi** untuk melihat status sync semua madrasah tanpa keluar dari aplikasi.

---

## D. Re-deploy (kalau ada perubahan kode)

Kalau Pak Yanto edit `Code.gs`:
1. **Deploy** → **Manage deployments**
2. Klik ikon pensil di deployment lama
3. **Version**: `New version`
4. **Deploy**

URL endpoint **tetap sama**, tidak perlu kasih ulang ke admin madrasah.

---

## E. Troubleshooting

**❌ "Token tidak valid"**: token di app tidak sama dengan `SHARED_TOKEN` di Code.gs. Cek huruf besar/kecil & spasi.

**❌ "Failed to fetch"**: 
- URL endpoint salah (harus diakhiri `/exec`)
- Belum di-deploy sebagai Web App (poin A.3)
- Internet madrasah tidak stabil

**❌ "Authorization required"**: deployment belum dibuat dengan akses `Anyone`. Ulangi langkah A.3.

**⚠️ Spreadsheet kosong setelah sync**: cek `Execution log` di Apps Script (View → Executions), lihat error.

**🔒 Keamanan**: token rahasia melindungi endpoint dari penulisan oleh orang luar. Kalau bocor, edit `SHARED_TOKEN` di Code.gs dan re-deploy version baru, lalu kirim token baru ke semua admin madrasah.

---

## F. Data yang Disinkronkan

Yang dikirim setiap kali sync (dari localStorage madrasah ke sheet):
- Master: `madrasah`, `guru`, `kelas`, `murid`
- Jurnal: `jurnalHarian`, `pembiasaanHarian`, `observasiKarakter`, `observasi`
- Pendukung: `eviden`, `validasi`, `perencanaan`

Yang **TIDAK** dikirim: pengaturan lokal, password user, file binary (foto eviden hanya nama file).

Sync mengganti data madrasah tersebut di sheet (overwrite per `_madrasahId`), tidak menumpuk. Jadi sync ulang aman, tidak duplicate.
