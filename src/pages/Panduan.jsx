import React from 'react';
import { BookOpen, LayoutDashboard, Building2, FileText, Edit3, CalendarCheck, Sparkles, Camera, Eye, CheckCircle, BarChart3, Layers, ClipboardCheck, Settings, KeyRound, Users, GraduationCap, Cloud, Heart, Save, Upload } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#102a4d] text-white flex items-center justify-center"><Icon className="w-5 h-5"/></div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-sm text-gray-700 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

function Step({ n, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#eecb59] text-[#102a4d] text-xs font-bold flex items-center justify-center">{n}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Role({ children }) {
  return <span className="inline-block px-2 py-0.5 bg-[#2fa295]/10 text-[#2fa295] rounded text-xs font-semibold mr-1">{children}</span>;
}

export default function Panduan() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-gradient-to-r from-[#102a4d] to-[#2fa295] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2"><BookOpen className="w-7 h-7"/><h2 className="text-2xl font-bold">Panduan Penggunaan Aplikasi</h2></div>
        <p className="text-sm text-blue-100">e-Jurnal KBC Madrasah — Sistem Jurnal Digital Implementasi Kurikulum Berbasis Cinta. Panduan ini disesuaikan dengan peran (role) Anda.</p>
      </div>

      <Section icon={KeyRound} title="1. Memulai (Login & Pendaftaran)">
        <ol className="space-y-2">
          <Step n={1}>Buka aplikasi melalui link yang dibagikan operator/admin madrasah.</Step>
          <Step n={2}>Untuk akun baru: klik <b>Daftar di sini</b> di halaman login, lalu masukkan <b>Kode Aktivasi</b> (format <code className="bg-gray-100 px-1 rounded">KBC-XXXX-XXXX</code>) yang diberikan admin.</Step>
          <Step n={3}>Lengkapi nama, username, dan password. Role akun ditentukan otomatis dari kode aktivasi.</Step>
          <Step n={4}>Untuk lisensi FULL atau pembelian kode, hubungi admin via tombol <b>Beli Lisensi FULL</b>.</Step>
        </ol>
      </Section>

      <Section icon={LayoutDashboard} title="2. Dashboard">
        <p>Halaman utama setelah login. Menampilkan ringkasan: jumlah jurnal, status validasi, grafik aktivitas Panca Cinta, dan aksi cepat. <Role>Pengawas</Role> mendapat dashboard khusus rekap madrasah binaan.</p>
      </Section>

      <Section icon={Building2} title="3. Master Data">
        <p><Role>Admin</Role><Role>Operator</Role> Kelola data dasar aplikasi:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li><b>Data Madrasah</b> — daftar madrasah binaan (nama, NSM/NPSN, jenjang, kepala, kecamatan, pengawas).</li>
          <li><b>Data Guru</b> — daftar guru per madrasah (NIP, mapel, jabatan).</li>
          <li><b>Data Kelas</b> — kelas dan rombel per madrasah.</li>
          <li><b>Data Murid</b> — daftar siswa per kelas.</li>
          <li><b>Indikator Panca Cinta</b> — 5 nilai utama dengan indikator masing-masing (editable).</li>
        </ul>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
          <p className="font-semibold text-amber-800 mb-1 flex items-center gap-2"><Upload className="w-4 h-4"/>Template / Import / Export CSV</p>
          <p className="text-amber-900 text-xs">Tab <b>Madrasah / Guru / Murid</b> memiliki 3 tombol di sebelah kotak pencarian:</p>
          <ul className="list-disc ml-5 text-xs text-amber-900 mt-1 space-y-0.5">
            <li><b>Template</b> — download CSV kosong + 1 baris contoh sebagai panduan format kolom.</li>
            <li><b>Import</b> — upload CSV (UTF-8). Untuk Guru/Murid, pastikan Data Madrasah & Kelas sudah diisi karena cocokan dilakukan berdasarkan <i>nama</i>.</li>
            <li><b>Export</b> — download semua data ke CSV dengan nama berformat tanggal.</li>
          </ul>
        </div>
      </Section>

      <Section icon={FileText} title="4. Perencanaan KBC">
        <p><Role>Guru</Role><Role>Kepala</Role><Role>Admin</Role> Susun rencana implementasi nilai Panca Cinta sebelum jurnal harian. Bisa disalin sebagai template untuk hari berikutnya.</p>
      </Section>

      <Section icon={Edit3} title="5. Jurnal Harian Guru">
        <p><Role>Guru</Role> Catat aktivitas pembelajaran harian terkait Panca Cinta. Alur status: <b>Draft → Dikirim → Disetujui / Perlu Revisi</b>.</p>
        <ol className="space-y-2 mt-2">
          <Step n={1}>Klik <b>Tambah Jurnal</b>, isi tanggal, kelas, mapel, nilai Panca Cinta, dan deskripsi kegiatan.</Step>
          <Step n={2}>Lampirkan refleksi guru (apa yang sudah baik, apa yang perlu diperbaiki).</Step>
          <Step n={3}>Klik <b>Kirim</b> agar masuk antrian validasi Kepala Madrasah/Pengawas.</Step>
        </ol>
      </Section>

      <Section icon={CalendarCheck} title="6. Jurnal Pembiasaan Harian">
        <p><Role>Guru</Role> Checklist 7 tahapan pembiasaan (Persiapan → Penyambutan → Pembukaan → Inti → Istirahat → Penutupan → Kepulangan). Total 45 kegiatan dengan checklist per tanggal 1-31. Persentase keterlaksanaan dihitung otomatis dengan kategori: Sangat Konsisten (≥90%), Konsisten (≥75%), Mulai Konsisten (≥60%), Perlu Pembiasaan (&lt;60%).</p>
      </Section>

      <Section icon={Sparkles} title="7. Observasi Karakter Murid">
        <p><Role>Guru</Role> Observasi instrumen <i>Cinta Allah dan Rasul</i> dengan 16 indikator (3 aspek A/B/C). Skor 1-4: Mulai Bertumbuh / Sedang Belajar / Berkembang Baik / Sudah Terbiasa. Nilai akhir dan rekomendasi dihitung otomatis. Riwayat per murid ditampilkan dalam grafik garis.</p>
      </Section>

      <Section icon={Camera} title="8. Eviden Digital">
        <p><Role>Semua role</Role> Upload foto/dokumen pendukung kegiatan KBC. Tampilan tabel atau galeri. Eviden bisa dikaitkan ke jurnal harian, perencanaan, atau pembiasaan.</p>
      </Section>

      <Section icon={Eye} title="9. Observasi Dampak Siswa">
        <p><Role>Guru</Role><Role>Kepala</Role> Catat dampak penerapan KBC pada perilaku siswa untuk validasi internal.</p>
      </Section>

      <Section icon={CheckCircle} title="10. Validasi Jurnal">
        <p><Role>Kepala</Role><Role>Pengawas</Role><Role>Admin</Role> Nilai jurnal yang dikirim guru menggunakan rubrik 6 komponen (total 100):</p>
        <ul className="list-disc ml-5 text-xs space-y-0.5">
          <li>Kesesuaian Rencana — 20</li>
          <li>Pelaksanaan Panca Cinta — 25</li>
          <li>Bukti / Eviden — 20</li>
          <li>Dampak Siswa — 15</li>
          <li>Refleksi Guru — 10</li>
          <li>Kelengkapan — 10</li>
        </ul>
        <p className="text-xs">Kategori skor: ≥90 Sangat Baik · ≥75 Baik · ≥60 Mulai Berkembang · &lt;60 Perlu Pendampingan.</p>
      </Section>

      <Section icon={BarChart3} title="11. Rekap & Laporan">
        <p>Hasil rekap data dalam 6 jenis laporan, bisa di-export PDF/Excel: rekap jurnal, kinerja guru, validasi, perencanaan, observasi, dan ringkasan KBC.</p>
      </Section>

      <Section icon={Layers} title="12. Rekap Instrumen KBC">
        <p>Halaman gabungan 8 tab: jurnal pembelajaran, pembiasaan, karakter, panca cinta, eviden, validasi kepala, validasi pengawas, dan laporan semester printable. Mendukung filter periode dan export CSV per tab.</p>
      </Section>

      <Section icon={ClipboardCheck} title="13. Laporan Monev Pengawas">
        <p><Role>Pengawas</Role><Role>Admin</Role> Laporan printable A4 dengan KOP Kemenag Jember dan tanda tangan otomatis. 8 section sesuai instrumen monev. Filter periode otomatis menarik data jurnal & validasi yang relevan.</p>
      </Section>

      <Section icon={Settings} title="14. Pengaturan">
        <p>Profil aplikasi (nama, tahun pelajaran, semester, logo), backup/restore JSON, dan Reset Data Contoh.</p>
        <ul className="list-disc ml-5 space-y-1 mt-2">
          <li><b>Sync ke Server Pokjawas</b> <span className="text-xs text-gray-500">(admin/kepala/operator)</span> — kirim data madrasah ke Google Sheet milik Pokjawas Kabupaten supaya pengawas bisa memantau tanpa import file.</li>
          <li><b>Kode Aktivasi Pendaftaran</b> <span className="text-xs text-gray-500">(admin)</span> — generate, salin, dan hapus kode pendaftaran. Mode <i>Server</i> menyimpan kode di Google Sheet supaya bisa dipakai dari device manapun. Mode <i>Local</i> hanya berlaku di browser saat ini.</li>
          <li><b>Backup & Restore</b> — download semua data ke file JSON sebagai cadangan; bisa di-restore lewat tombol Upload.</li>
        </ul>
      </Section>

      <Section icon={Cloud} title="15. Tips & Troubleshooting">
        <ul className="list-disc ml-5 space-y-1">
          <li>Kalau setelah login data terlihat kosong di device lain, pastikan admin sudah <b>aktifkan Mode Server</b> di Pengaturan dan endpoint+token sudah benar.</li>
          <li>Lakukan <b>Backup</b> rutin dari menu Pengaturan, terutama sebelum upgrade atau reset data.</li>
          <li>File CSV Excel di Indonesia sebaiknya disave sebagai <b>CSV UTF-8</b> agar tidak rusak karakternya.</li>
          <li>Bila lupa password admin, gunakan akun admin lain untuk reset; atau restore dari backup terakhir.</li>
        </ul>
      </Section>

      <div className="text-center text-xs text-gray-500 pt-2">
        © Pokjawas Madrasah Kabupaten Jember · e-Jurnal KBC Madrasah
      </div>
    </div>
  );
}
