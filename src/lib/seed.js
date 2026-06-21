const { generateId } = require('./store');
// (this is actually used via import, no require — it's a helper)

function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export function createSeedData() {
  // Madrasah
  const madrasah = [
    { id: 'mad1', nama: 'MI Nurul Huda Sukowono', nsmNpsn: '111235090001', jenjang: 'MI', alamat: 'Jl. Pendidikan No. 1, Sukowono', kepalaMadrasah: 'Drs. Ahmad Fauzi, M.Pd', kecamatan: 'Sukowono', pengawas: 'Subariyanto, S.Pd, M.Pd.I' },
    { id: 'mad2', nama: 'MTs Al-Ikhlas Kalisat', nsmNpsn: '121235090002', jenjang: 'MTs', alamat: 'Jl. Santri No. 12, Kalisat', kepalaMadrasah: 'Hj. Siti Aminah, S.Ag, M.Pd.I', kecamatan: 'Kalisat', pengawas: 'Subariyanto, S.Pd, M.Pd.I' },
    { id: 'mad3', nama: 'MA Darul Ulum Sukowono', nsmNpsn: '131235090003', jenjang: 'MA', alamat: 'Jl. Raya Sukowono KM 3', kepalaMadrasah: 'Drs. Khairul Anwar, M.Si', kecamatan: 'Sukowono', pengawas: 'Subariyanto, S.Pd, M.Pd.I' },
  ];

  // Kelas
  const kelas = [
    { id: 'kls1', nama: '5A', jenjang: 'MI', waliKelas: 'Siti Nurhalimah, S.Pd', jmlSiswaL: 14, jmlSiswaP: 16, tahunPelajaran: '2026/2027', madrasahId: 'mad1' },
    { id: 'kls2', nama: '7B', jenjang: 'MTs', waliKelas: 'Muhammad Rizky, S.Pd', jmlSiswaL: 18, jmlSiswaP: 15, tahunPelajaran: '2026/2027', madrasahId: 'mad2' },
    { id: 'kls3', nama: 'X-IPA', jenjang: 'MA', waliKelas: 'Dra. Lailatul Qadri', jmlSiswaL: 10, jmlSiswaP: 14, tahunPelajaran: '2026/2027', madrasahId: 'mad3' },
  ];

  // Guru
  const guru = [
    { id: 'g1', nama: 'Siti Nurhalimah, S.Pd', nip: '198505102019012001', jabatan: 'Guru Kelas', mapel: 'Tematik', madrasahId: 'mad1', madrasahNama: 'MI Nurul Huda Sukowono', noHP: '081234567890', email: 'sitihalimah@madrasah.id', userId: 'guru1' },
    { id: 'g2', nama: 'Muhammad Rizky, S.Pd', nip: '199003152020121002', jabatan: 'Guru IPA', mapel: 'IPA Terpadu', madrasahId: 'mad2', madrasahNama: 'MTs Al-Ikhlas Kalisat', noHP: '081234567891', email: 'rizky@madrasah.id', userId: 'guru2' },
    { id: 'g3', nama: 'Dra. Lailatul Qadri', nip: '198207022010012003', jabatan: 'Guru PAI', mapel: 'PAI dan Budi Pekerti', madrasahId: 'mad3', madrasahNama: 'MA Darul Ulum Sukowono', noHP: '081234567892', email: 'lailatul@madrasah.id', userId: 'guru3' },
  ];

  // Users
  const pengguna = [
    { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', nama: 'Administrator', guruId: null, madrasahId: null },
    { id: 'u2', username: 'guru1', password: 'guru123', role: 'guru', nama: 'Siti Nurhalimah, S.Pd', guruId: 'g1', madrasahId: 'mad1' },
    { id: 'u3', username: 'guru2', password: 'guru123', role: 'guru', nama: 'Muhammad Rizky, S.Pd', guruId: 'g2', madrasahId: 'mad2' },
    { id: 'u4', username: 'kepala', password: 'kepala123', role: 'kepala_madrasah', nama: 'Drs. Ahmad Fauzi, M.Pd', guruId: null, madrasahId: 'mad1' },
    { id: 'u5', username: 'pengawas', password: 'pengawas123', role: 'pengawas', nama: 'Subariyanto, S.Pd, M.Pd.I', guruId: null, madrasahId: null },
    { id: 'u6', username: 'operator', password: 'operator123', role: 'operator', nama: 'Operator Madrasah', guruId: null, madrasahId: 'mad1' },
  ];

  // Panca Cinta Indicators
  const pancaCinta = [
    { id: 'pc1', nama: 'Cinta Allah dan Rasul', indikator: [
      { id: id(), teks: 'Membiasakan doa sebelum dan sesudah belajar' },
      { id: id(), teks: 'Menunjukkan akhlak santun dalam pembelajaran' },
      { id: id(), teks: 'Meneladani perilaku Rasulullah SAW' },
      { id: id(), teks: 'Membiasakan rasa syukur atas nikmat ilmu' },
    ]},
    { id: 'pc2', nama: 'Cinta Ilmu', indikator: [
      { id: id(), teks: 'Siswa aktif bertanya dan berdiskusi' },
      { id: id(), teks: 'Siswa mencari informasi dari berbagai sumber' },
      { id: id(), teks: 'Siswa berani menyampaikan pendapat' },
      { id: id(), teks: 'Siswa menyelesaikan tugas dengan sungguh-sungguh' },
    ]},
    { id: 'pc3', nama: 'Cinta Diri dan Sesama', indikator: [
      { id: id(), teks: 'Siswa menghargai pendapat teman' },
      { id: id(), teks: 'Siswa membantu teman yang kesulitan' },
      { id: id(), teks: 'Siswa tidak mengejek atau membully' },
      { id: id(), teks: 'Siswa bekerja sama dalam kelompok' },
    ]},
    { id: 'pc4', nama: 'Cinta Lingkungan', indikator: [
      { id: id(), teks: 'Siswa menjaga kebersihan kelas' },
      { id: id(), teks: 'Siswa membuang sampah pada tempatnya' },
      { id: id(), teks: 'Siswa hemat air dan listrik' },
      { id: id(), teks: 'Siswa merawat tanaman di lingkungan madrasah' },
    ]},
    { id: 'pc5', nama: 'Cinta Tanah Air', indikator: [
      { id: id(), teks: 'Siswa menghargai simbol negara' },
      { id: id(), teks: 'Siswa mengenal dan bangga budaya Indonesia' },
      { id: id(), teks: 'Siswa menghargai keberagaman' },
      { id: id(), teks: 'Siswa bangga menjadi bagian dari bangsa Indonesia' },
    ]},
  ];

  // Rencana KBC
  const rencanaKBC = [
    { id: 'r1', tanggal: '2026-06-10', guruId: 'g1', guruNama: 'Siti Nurhalimah, S.Pd', madrasahId: 'mad1', madrasahNama: 'MI Nurul Huda Sukowono', kelasId: 'kls1', kelasNama: '5A', mapel: 'Tematik', materiPokok: 'Ekosistem dan Lingkungan', tujuanPembelajaran: 'Siswa memahami hubungan makhluk hidup dengan lingkungan dan menunjukkan sikap peduli', pancaCinta: ['Cinta Lingkungan', 'Cinta Ilmu'], metode: 'Diskusi kelompok dan observasi', media: 'Gambar ekosistem, video alam', kegiatanPembuka: 'Doa, apersepsi tentang lingkungan sekitar', kegiatanInti: 'Diskusi tentang ekosistem, observasi halaman madrasah, presentasi kelompok', kegiatanPenutup: 'Refleksi bersama, doa penutup', rencanaAsesmen: 'Lembar observasi sikap dan laporan kelompok', rencanaEviden: 'Foto kegiatan diskusi dan observasi', catatanTL: 'Mengajak siswa membersihkan area madrasah' },
    { id: 'r2', tanggal: '2026-06-12', guruId: 'g2', guruNama: 'Muhammad Rizky, S.Pd', madrasahId: 'mad2', madrasahNama: 'MTs Al-Ikhlas Kalisat', kelasId: 'kls2', kelasNama: '7B', mapel: 'IPA Terpadu', materiPokok: 'Pencemaran Lingkungan', tujuanPembelajaran: 'Siswa mengidentifikasi jenis pencemaran dan solusinya', pancaCinta: ['Cinta Lingkungan', 'Cinta Ilmu', 'Cinta Diri dan Sesama'], metode: 'Project-based learning', media: 'Video pencemaran, LKPD', kegiatanPembuka: 'Doa, ice breaking tentang kebersihan', kegiatanInti: 'Pemutaran video, diskusi kelompok, membuat poster solusi', kegiatanPenutup: 'Presentasi poster, refleksi', rencanaAsesmen: 'Rubrik poster dan presentasi', rencanaEviden: 'Foto poster dan video presentasi', catatanTL: 'Kampanye anti pencemaran di madrasah' },
  ];

  // Jurnal Harian
  const jurnalHarian = [
    { id: 'j1', rencanaId: 'r1', tanggal: '2026-06-15', jam: '07:30-09:00', guruId: 'g1', guruNama: 'Siti Nurhalimah, S.Pd', madrasahId: 'mad1', madrasahNama: 'MI Nurul Huda Sukowono', kelasId: 'kls1', kelasNama: '5A', mapel: 'Tematik', materi: 'Ekosistem dan Lingkungan', kegiatanPembuka: 'Doa bersama, tanya jawab tentang lingkungan bersih', kegiatanInti: 'Siswa mengamati halaman madrasah, mencatat komponen ekosistem, berdiskusi dalam kelompok', kegiatanPenutup: 'Setiap kelompok presentasi, guru memberi penguatan, doa', pancaCinta: ['Cinta Lingkungan', 'Cinta Ilmu'], narasiKBC: 'Siswa sangat antusias saat mengamati halaman dan berdiskusi tentang pentingnya menjaga lingkungan. Beberapa siswa bertanya detail tentang daur ulang sampah.', responSiswa: 'Siswa aktif bertanya dan berbagi pengalaman tentang lingkungan di rumah', dampakPositif: 'Siswa mulai memungut sampah yang terlihat di halaman tanpa disuruh', kendala: 'Waktu observasi halaman kurang karena cuaca panas', solusi: 'Observasi bagian teduh saja sore kali ini', refleksi: 'Pembelajaran kontekstual dengan lingkungan sekitar sangat efektif', rencanaTL: 'Minggu depan ajak siswa membuat tanaman dalam botol bekas', status: 'Disetujui' },
    { id: 'j2', rencanaId: 'r2', tanggal: '2026-06-16', jam: '09:15-10:45', guruId: 'g2', guruNama: 'Muhammad Rizky, S.Pd', madrasahId: 'mad2', madrasahNama: 'MTs Al-Ikhlas Kalisat', kelasId: 'kls2', kelasNama: '7B', mapel: 'IPA Terpadu', materi: 'Pencemaran Lingkungan', kegiatanPembuka: 'Salam, doa, menonton video pencemaran sungai', kegiatanInti: 'Diskusi penyebab dan dampak pencemaran, membuat poster digital solusi', kegiatanPenutup: 'Refleksi, komitmen menjaga lingkungan madrasah', pancaCinta: ['Cinta Lingkungan', 'Cinta Ilmu', 'Cinta Diri dan Sesama'], narasiKBC: 'Siswa serius memperhatikan video dan tersentuh saat melihat dampak pencemaran. Diskusi berjalan hidup, banyak ide solusi kreatif.', responSiswa: 'Siswa antusias membuat poster dan berkomitmen mengurangi sampah plastik', dampakPositif: 'Kelompok membawa tumbler sendiri hari ini, mengurangi botol plastik', kendala: 'Beberapa siswa pasif dalam diskusi', solusi: 'Rencana beri peran spesifik ke siswa pasif minggu depan', refleksi: 'Project-based learning sangat cocok untuk materi ini', rencanaTL: 'Monitoring penggunaan tumbler dan pengurangan sampah', status: 'Dikirim' },
    { id: 'j3', tanggal: '2026-06-17', jam: '08:00-09:30', guruId: 'g3', guruNama: 'Dra. Lailatul Qadri', madrasahId: 'mad3', madrasahNama: 'MA Darul Ulum Sukowono', kelasId: 'kls3', kelasNama: 'X-IPA', mapel: 'PAI dan Budi Pekerti', materi: 'Iman Kepada Allah SWT', kegiatanPembuka: 'Salam, tadarus Al-Quran, apersepsi', kegiatanInti: 'Diskusi makna iman, kisah teladan, refleksi pribadi', kegiatanPenutup: 'Doa, motivasi menjaga iman', pancaCinta: ['Cinta Allah dan Rasul', 'Cinta Diri dan Sesama'], narasiKBC: 'Pembelajaran iman sangat dalam dan personal. Siswa menceritakan pengalaman spiritual masing-masing.', responSiswa: 'Beberapa siswa terharu saat berbagi cerita', dampakPositif: 'Siswa saling mendoakan dan memberi semangat', kendala: '-', solusi: '-', refleksi: 'Mengintegrasikan iman dalam setiap pelajaran sangat penting untuk karakter', rencanaTL: 'Program shalat dhuha berjamaah', status: 'Draft' },
    { id: 'j4', tanggal: '2026-06-17', jam: '10:00-11:30', guruId: 'g2', guruNama: 'Muhammad Rizky, S.Pd', madrasahId: 'mad2', madrasahNama: 'MTs Al-Ikhlas Kalisat', kelasId: 'kls2', kelasNama: '7B', mapel: 'IPA Terpadu', materi: 'Energi Alternatif', kegiatanPembuka: 'Doa, tanya jawab tentang energi', kegiatanInti: 'Eksperimen panel surya mini, diskusi energi terbarukan', kegiatanPenutup: 'Refleksi, doa', pancaCinta: ['Cinta Lingkungan', 'Cinta Ilmu', 'Cinta Tanah Air'], narasiKBC: 'Eksperimen panel surya sangat menarik. Siswa kagum melihat energi matahari bisa menyalakan lampu LED.', responSiswa: 'Siswa berebut mencoba eksperimen', dampakPositif: 'Siswa paham pentingnya energi bersih untuk masa depan Indonesia', kendala: 'Alat panel surya terbatas', solusi: 'Pinjam dari laboratorium fisika', refleksi: 'Eksperimen langsung sangat efektif', rencanaTL: 'Membuat proyek energi alternatif kelompok', status: 'Dikirim' },
    { id: 'j5', tanggal: '2026-06-18', jam: '07:30-09:00', guruId: 'g1', guruNama: 'Siti Nurhalimah, S.Pd', madrasahId: 'mad1', madrasahNama: 'MI Nurul Huda Sukowono', kelasId: 'kls1', kelasNama: '5A', mapel: 'Tematik', materi: 'Keberagaman Budaya Indonesia', kegiatanPembuka: 'Menyanyikan lagu Indonesia Raya, doa', kegiatanInti: 'Presentasi budaya daerah, membuat kolase baju adat', kegiatanPenutup: 'Pameran kolase, refleksi cinta tanah air', pancaCinta: ['Cinta Tanah Air', 'Cinta Diri dan Sesama'], narasiKBC: 'Siswa bangga menampilkan budaya daerahnya. Mereka saling menghargai perbedaan.', responSiswa: 'Siswa antusias bercerita tentang budaya daerah asal', dampakPositif: 'Siswa lebih menghargai teman dari latar berbeda', kendala: '-', solusi: '-', refleksi: 'Pendidikan keberagaman sangat penting sejak dini', rencanaTL: 'Kunjungan ke rumah adat setempat', status: 'Perlu Revisi' },
  ];

  // Eviden
  const eviden = [
    { id: 'e1', judul: 'Observasi Ekosistem Halaman', jenis: 'Foto kegiatan', tanggal: '2026-06-15', jurnalId: 'j1', deskripsi: 'Siswa kelas 5A mengamati ekosistem di halaman madrasah', fileUrl: null, catatan: 'Siswa sangat antusias' },
    { id: 'e2', judul: 'Poster Anti Pencemaran', jenis: 'Hasil karya siswa', tanggal: '2026-06-16', jurnalId: 'j2', deskripsi: 'Poster digital hasil karya kelompok 7B', fileUrl: null, catatan: 'Kreatif dan informatif' },
    { id: 'e3', judul: 'Diskusi Kelompok Iman', jenis: 'Catatan anekdot', tanggal: '2026-06-17', jurnalId: 'j3', deskripsi: 'Catatan diskusi personal tentang iman', fileUrl: null, catatan: 'Siswa jujur dan reflektif' },
    { id: 'e4', judul: 'Eksperimen Panel Surya Mini', jenis: 'Foto kegiatan', tanggal: '2026-06-17', jurnalId: 'j4', deskripsi: 'Praktik panel surya mini oleh kelas 7B', fileUrl: null, catatan: 'Semua kelompok berhasil' },
  ];

  // Observasi Siswa
  const observasiSiswa = [
    { id: 'o1', tanggal: '2026-06-15', guruId: 'g1', guruNama: 'Siti Nurhalimah, S.Pd', kelasId: 'kls1', kelasNama: '5A', inisial: 'Andi', indikatorPerilaku: 'Peduli lingkungan', pancaCinta: 'Cinta Lingkungan', deskripsi: 'Andi memungut sampah plastik di halaman dan membuang ke tempat sampah', catatanKhusus: 'Dilakukan tanpa disuruh', tindakLanjut: 'Beri apresiasi di depan kelas', kategori: 'Berkembang' },
    { id: 'o2', tanggal: '2026-06-16', guruId: 'g2', guruNama: 'Muhammad Rizky, S.Pd', kelasId: 'kls2', kelasNama: '7B', inisial: 'Rina', indikatorPerilaku: 'Empati', pancaCinta: 'Cinta Diri dan Sesama', deskripsi: 'Rina membantu teman yang kesulitan membuat poster', catatanKhusus: 'Relawan tanpa diminta', tindakLanjut: 'Jadikan contoh di kelas', kategori: 'Membudaya' },
    { id: 'o3', tanggal: '2026-06-18', guruId: 'g1', guruNama: 'Siti Nurhalimah, S.Pd', kelasId: 'kls1', kelasNama: '5A', inisial: 'Putri', indikatorPerilaku: 'Cinta tanah air', pancaCinta: 'Cinta Tanah Air', deskripsi: 'Putri menjelaskan baju adat Jawa dengan bangga', catatanKhusus: 'Percaya diri dan informatif', tindakLanjut: 'Motivasi tampil di acara madrasah', kategori: 'Mulai Tampak' },
  ];

  // Validasi
  const validasi = [
    { id: 'v1', jurnalId: 'j1', validatorNama: 'Drs. Ahmad Fauzi, M.Pd', validatorRole: 'Kepala Madrasah', validatorId: 'u4', tanggal: '2026-06-16', skor: { kesesuaianRencana: 18, pelaksanaanPancaCinta: 23, buktiEviden: 18, dampakSiswa: 14, refleksiGuru: 9, kelengkapan: 9 }, totalSkor: 91, kategori: 'Sangat Baik', catatanApresiasi: 'Pembelajaran sangat kontekstual dan melibatkan siswa aktif', catatanPerbaikan: 'Waktu observasi bisa diatur lebih fleksibel', rekomendasi: 'Lanjutkan dengan project-based learning', status: 'Disetujui' },
    { id: 'v2', jurnalId: 'j4', validatorNama: 'Subariyanto, S.Pd, M.Pd.I', validatorRole: 'Pengawas', validatorId: 'u5', tanggal: '2026-06-18', skor: { kesesuaianRencana: 17, pelaksanaanPancaCinta: 22, buktiEviden: 16, dampakSiswa: 13, refleksiGuru: 8, kelengkapan: 8 }, totalSkor: 84, kategori: 'Baik', catatanApresiasi: 'Inovasi eksperimen panel surya sangat baik', catatanPerbaikan: 'Perbanyak dokumentasi eviden', rekomendasi: 'Integrasikan dengan mata pelajaran lain', status: 'Disetujui' },
  ];

  return { pengguna, madrasah, guru, kelas, pancaCinta, rencanaKBC, jurnalHarian, eviden, observasiSiswa, validasi };
}