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