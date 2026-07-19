// ============================================================
// SiJurnal Cinta Guru - LocalStorage Data Layer
// ============================================================
const APP_KEY = 'sijurnal_cinta_guru_v1';

export const JENJANG = ['RA', 'MI', 'MTs', 'MA'];
export const ROLE_LIST = ['admin', 'guru', 'kepala_madrasah', 'pengawas', 'operator'];
export const NILAI_PANCA_CINTA = [
  'Cinta Allah dan Rasul',
  'Cinta Ilmu',
  'Cinta Diri dan Sesama',
  'Cinta Lingkungan',
  'Cinta Tanah Air',
];
export const STATUS_JURNAL = ['Draft', 'Dikirim', 'Disetujui', 'Perlu Revisi'];
export const JENIS_EVIDEN = [
  'Foto kegiatan', 'Video kegiatan', 'Dokumen RPP/Modul Ajar', 'LKPD',
  'Hasil karya siswa', 'Catatan anekdot', 'Refleksi siswa', 'Berita acara kegiatan',
];
export const KATEGORI_OBSERVASI = ['Belum Tampak', 'Mulai Tampak', 'Berkembang', 'Membudaya'];
export const INDIKATOR_PERILAKU = [
  'Religius dan beradab', 'Cinta ilmu', 'Disiplin', 'Tanggung jawab', 'Empati',
  'Saling menghargai', 'Peduli lingkungan', 'Cinta tanah air', 'Kerja sama', 'Percaya diri',
];
export const BOBOT_VALIDASI = {
  kesesuaianRencana: 20,
  pelaksanaanPancaCinta: 25,
  buktiEviden: 20,
  dampakSiswa: 15,
  refleksiGuru: 10,
  kelengkapan: 10,
};

// Tahapan Pembiasaan Harian Guru Berbasis Cinta
export const TAHAPAN_PEMBIASAAN = [
  { id: 'persiapan', no: 1, nama: 'Persiapan / Preparation', nilaiCinta: ['Cinta Allah', 'Cinta Diri', 'Cinta Lingkungan'], tujuan: 'Menumbuhkan rasa cinta Allah, cinta diri, meluruskan niat belajar karena Allah SWT, dan menciptakan lingkungan belajar yang nyaman.', kegiatan: ['Guru melakukan penyelarasan niat sebelum masuk kelas.','Guru berdoa dan menyadari bahwa mengajar adalah ibadah.','Guru menjaga penampilan rapi, sopan, ramah, dan hangat.','Guru memastikan kelas bersih, nyaman, dan siap digunakan.','Guru menyiapkan media dan perangkat pembelajaran.'] },
  { id: 'penyambutan', no: 2, nama: 'Kedatangan dan Penyambutan / The Warm Welcome', nilaiCinta: ['Cinta Sesama', 'Welas Asih'], tujuan: 'Membangun koneksi emosional sebelum pembelajaran dimulai.', kegiatan: ['Guru berdiri di depan pintu atau area kelas untuk menyambut murid.','Guru menyapa murid dengan senyum dan menyebut nama murid.','Guru memberi pilihan sapaan seperti salam, tos, jabat tangan, lambaian tangan, atau sapaan lain yang nyaman.','Guru melakukan check-in emosi dengan bertanya kabar atau perasaan murid.','Guru memberi perhatian khusus kepada murid yang terlihat murung, lelah, atau kurang semangat.'] },
  { id: 'pembukaan', no: 3, nama: 'Pembukaan Kelas / Heart-to-Heart Opening', nilaiCinta: ['Cinta Allah', 'Cinta Sesama', 'Welas Asih'], tujuan: 'Menyelaraskan energi kelas, menumbuhkan rasa syukur, dan menghadirkan suasana belajar yang tenang.', kegiatan: ['Guru mengajak murid duduk rapi atau membentuk lingkaran pagi/morning circle.','Guru mengajak murid hening sejenak atau tazkiyatun nafs.','Guru mengajak murid membaca doa, istighfar, hamdalah, atau dzikir pendek.','Guru mengajak murid bersyukur atas nikmat Allah.','Guru memberikan afirmasi positif seperti "Aku hebat, aku mampu, dan hari ini aku belajar dengan gembira."','Guru membangun suasana kelas yang setara, aman, dan menyenangkan.'] },
  { id: 'inti', no: 4, nama: 'Inti Pembelajaran / Active Learning', nilaiCinta: ['Cinta Ilmu', 'Cinta Kebenaran', 'Cinta Diri dan Sesama'], tujuan: 'Menghargai proses belajar, keunikan murid, dan menumbuhkan cinta ilmu.', kegiatan: ['Guru menggunakan instruksi yang ramah dan kata-kata positif.','Guru menghindari membentak, mempermalukan, atau menghakimi murid.','Guru memberi kesempatan murid bertanya dan berpendapat.','Guru mendorong murid berpikir kritis, berdiskusi, bereksplorasi, dan melakukan investigasi.','Guru mengaitkan materi pembelajaran dengan kebesaran Allah atau keteladanan Rasulullah secara relevan.','Guru menerapkan diferensiasi sesuai kemampuan awal, minat, atau gaya belajar murid.','Guru mengelola konflik secara tenang dan positif.','Guru mengapresiasi proses, usaha, pertanyaan, dan ide murid.','Guru memberi jeda atau ice breaking jika murid terlihat lelah atau jenuh.'] },
  { id: 'istirahat', no: 5, nama: 'Istirahat Tanpa Plastik / Eco-Break', nilaiCinta: ['Cinta Allah', 'Cinta Diri', 'Cinta Sesama', 'Cinta Lingkungan'], tujuan: 'Menumbuhkan kepedulian terhadap diri, teman, dan lingkungan melalui kebiasaan positif saat istirahat.', kegiatan: ['Guru memastikan murid membawa bekal dan minuman menggunakan wadah ramah lingkungan.','Guru memantau murid selama istirahat.','Guru membiasakan adab makan dan minum.','Guru mengajak murid berdoa sebelum makan dan mengucapkan hamdalah setelah makan.','Guru membiasakan murid saling berbagi dengan tertib.','Guru mengarahkan pengelolaan sisa makanan secara bijak.','Guru memastikan area makan dan kelas kembali bersih setelah istirahat.','Guru mengingatkan murid mengurangi sampah plastik.'] },
  { id: 'penutupan', no: 6, nama: 'Penutupan dan Refleksi / The Loving Closure', nilaiCinta: ['Cinta Allah', 'Cinta Karakter', 'Cinta Sesama'], tujuan: 'Mengakhiri pembelajaran dengan rasa syukur, refleksi, dan penguatan karakter.', kegiatan: ['Guru mengajak murid menyebutkan satu hal yang disyukuri.','Guru mengajak murid menyebutkan satu hal baru yang dipelajari.','Guru memberi kesempatan murid memberi apresiasi kepada teman.','Guru memberi penguatan karakter.','Guru menutup pembelajaran dengan doa.','Guru memberi pesan kebaikan untuk dilakukan di rumah.','Guru mengajak murid menuliskan atau menyampaikan satu perilaku baik yang akan dilakukan.'] },
  { id: 'kepulangan', no: 7, nama: 'Kepulangan / Safety Send-Off', nilaiCinta: ['Cinta Sesama', 'Cinta Lingkungan', 'Syukur'], tujuan: 'Memastikan murid pulang dengan perasaan aman, bahagia, dan dicintai.', kegiatan: ['Guru memberi pesan terakhir sebelum murid pulang.','Guru mengingatkan murid berhati-hati di jalan.','Guru memberi senyum, kontak mata, atau sapaan hangat sebelum murid meninggalkan kelas.','Guru memastikan kelas rapi dan bersih sebelum ditinggalkan.','Guru menutup hari dengan rasa syukur.'] },
];

// Total kegiatan harian = jumlah semua kegiatan di seluruh tahapan
export const TOTAL_KEGIATAN_HARIAN = TAHAPAN_PEMBIASAAN.reduce((sum, t) => sum + t.kegiatan.length, 0);

export const KATEGORI_PEMBIASAAN = [
  { min: 90, max: 100, label: 'Sangat Konsisten', color: 'green' },
  { min: 75, max: 89, label: 'Konsisten', color: 'blue' },
  { min: 60, max: 74, label: 'Mulai Konsisten', color: 'yellow' },
  { min: 0, max: 59, label: 'Perlu Pembiasaan', color: 'red' },
];

export function getKategoriPembiasaan(pct) {
  if (pct >= 90) return 'Sangat Konsisten';
  if (pct >= 75) return 'Konsisten';
  if (pct >= 60) return 'Mulai Konsisten';
  return 'Perlu Pembiasaan';
}

// Instrumen Observasi Karakter Murid (default: Cinta Allah dan Rasul)
export const INSTRUMEN_KARAKTER_DEFAULT = {
  id: 'cinta-allah-rasul',
  judul: 'Implementasi Nilai Karakter Religius melalui Cinta Allah dan Rasul-Nya',
  pancaCinta: 'Cinta Allah dan Rasul',
  aspek: [
    { id: 'A', kode: 'A', nama: 'Mensyukuri Nikmat dan Kebaikan Allah', indikator: [
      { no: 1, teks: 'Mengucapkan hamdalah ketika memperoleh keberhasilan atau kebahagiaan.' },
      { no: 2, teks: 'Mengucapkan terima kasih ketika menerima bantuan atau kebaikan.' },
      { no: 3, teks: 'Menjaga kebersihan diri dan lingkungan sebagai bentuk rasa syukur kepada Allah.' },
      { no: 4, teks: 'Menggunakan fasilitas madrasah dengan baik dan tidak merusaknya.' },
      { no: 5, teks: 'Belajar dengan sungguh-sungguh sebagai bentuk rasa syukur kepada Allah.' },
    ]},
    { id: 'B', kode: 'B', nama: 'Meneladani Akhlak Rasulullah SAW', indikator: [
      { no: 6, teks: 'Mengucapkan salam ketika bertemu guru dan teman.' },
      { no: 7, teks: 'Berkata jujur kepada guru, orang tua, dan teman.' },
      { no: 8, teks: 'Bersikap sopan kepada guru dan teman.' },
      { no: 9, teks: 'Mau meminta maaf ketika melakukan kesalahan.' },
      { no: 10, teks: 'Mau memaafkan kesalahan teman.' },
      { no: 11, teks: 'Menepati janji dan melaksanakan tugas yang diberikan.' },
    ]},
    { id: 'C', kode: 'C', nama: 'Membiasakan Beribadah', indikator: [
      { no: 12, teks: 'Berdoa sebelum dan sesudah belajar.' },
      { no: 13, teks: 'Mengikuti salat berjamaah dengan tertib.' },
      { no: 14, teks: 'Membaca Al-Qur’an sesuai kemampuan.' },
      { no: 15, teks: 'Mengikuti kegiatan keagamaan dengan senang hati.' },
      { no: 16, teks: 'Menjaga ketertiban saat beribadah.' },
    ]},
  ],
};

export const SKOR_KARAKTER_LABEL = { 4: 'Sudah Terbiasa', 3: 'Berkembang Baik', 2: 'Sedang Belajar', 1: 'Mulai Bertumbuh' };

export function getKategoriKarakter(nilai) {
  if (nilai >= 86) return 'Sudah Terbiasa';
  if (nilai >= 71) return 'Berkembang Baik';
  if (nilai >= 56) return 'Sedang Belajar';
  return 'Mulai Bertumbuh';
}

export function getRekomendasiKarakter(kategori) {
  const map = {
    'Sudah Terbiasa': 'Teruslah menjaga kebiasaan baik yang telah tumbuh dalam dirimu. Jadikan rasa syukur, akhlak mulia, dan ketaatan beribadah sebagai teladan bagi teman-temanmu.',
    'Berkembang Baik': 'Kamu sudah menunjukkan perilaku yang baik. Teruslah berlatih agar kebiasaan bersyukur, berbuat baik, dan beribadah dapat dilakukan dengan lebih konsisten setiap hari.',
    'Sedang Belajar': 'Kamu sedang belajar menjadi pribadi yang lebih baik. Biasakan mengucapkan syukur, bersikap jujur, menghormati orang lain, dan melaksanakan ibadah dengan sungguh-sungguh.',
    'Mulai Bertumbuh': 'Ayo mulai membiasakan diri berdoa, mengucapkan salam, bersikap sopan, dan mengikuti ibadah dengan tertib. Setiap langkah kecil yang dilakukan dengan rutin akan membantu kamu menjadi anak yang saleh dan berakhlak mulia.',
  };
  return map[kategori] || '';
}

export const BULAN_NAMA = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function getDaysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getKategoriSkor(n) {
  if (n >= 90) return 'Sangat Baik';
  if (n >= 75) return 'Baik';
  if (n >= 60) return 'Mulai Berkembang';
  return 'Perlu Pendampingan';
}

function loadAll() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveAll(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

export function getData() {
  const d = loadAll();
  return {
    pengguna: d.pengguna || [],
    madrasah: d.madrasah || [],
    guru: d.guru || [],
    kelas: d.kelas || [],
    indikatorPancaCinta: d.indikatorPancaCinta || [],
    rencanaKBC: d.rencanaKBC || [],
    jurnalHarian: d.jurnalHarian || [],
    eviden: d.eviden || [],
    observasiSiswa: d.observasiSiswa || [],
    validasi: d.validasi || [],
    pengaturan: d.pengaturan || {},
    pembiasaanHarian: d.pembiasaanHarian || [],
    jurnalRefleksiMapel: d.jurnalRefleksiMapel || [],
    observasiKarakter: d.observasiKarakter || [],
    cekTumbuhCintaAllah: d.cekTumbuhCintaAllah || [],
    cekTumbuhCintaIlmu: d.cekTumbuhCintaIlmu || [],
    cekTumbuhCintaLingkungan: d.cekTumbuhCintaLingkungan || [],
    instrumenKarakter: d.instrumenKarakter || [],
    murid: d.murid || [],
    kodeAktivasi: d.kodeAktivasi || [],
  };
}

export function setData(key, val) {
  const d = loadAll();
  d[key] = val;
  saveAll(d);
}

export function addItem(key, item) {
  const d = loadAll();
  if (!d[key]) d[key] = [];
  d[key].push(item);
  saveAll(d);
}

export function updateItem(key, id, patch) {
  const d = loadAll();
  if (!d[key]) return;
  d[key] = d[key].map(x => x.id === id ? { ...x, ...patch } : x);
  saveAll(d);
}

export function deleteItem(key, id) {
  const d = loadAll();
  if (!d[key]) return;
  d[key] = d[key].filter(x => x.id !== id);
  saveAll(d);
}

export function updateCollection(key, arr) {
  const d = loadAll();
  d[key] = arr;
  saveAll(d);
}

