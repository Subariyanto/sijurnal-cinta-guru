import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createSeedData } from './lib/seed.js'
import { getData, setData } from './lib/store.js'
import { createKodeAktivasi, getAllKodeAktivasi } from './lib/aktivasi.js'

const d = getData();
if (!d.pengguna || d.pengguna.length === 0) {
  const seed = createSeedData();
  setData('pengguna', seed.pengguna);
  setData('madrasah', seed.madrasah);
  setData('guru', seed.guru);
  setData('kelas', seed.kelas);
  setData('indikatorPancaCinta', seed.pancaCinta);
  setData('rencanaKBC', seed.rencanaKBC);
  setData('jurnalHarian', seed.jurnalHarian);
  setData('eviden', seed.eviden);
  setData('observasiSiswa', seed.observasiSiswa);
  setData('validasi', seed.validasi);
  setData('murid', seed.murid || []);
  setData('instrumenKarakter', seed.instrumenKarakter || []);
  setData('pembiasaanHarian', seed.pembiasaanHarian || []);
  setData('observasiKarakter', seed.observasiKarakter || []);
  setData('pengaturan', { tahunPelajaran: '2026/2027', semester: 'Ganjil', namaAplikasi: 'SiJurnal Cinta Guru', logoKemenag: '', logoMadrasah: '' });
}

// Seed kode aktivasi demo (1 per role) bila belum ada — supaya Yanto bisa test
// flow pendaftaran tanpa harus generate manual dulu.
if (getAllKodeAktivasi().length === 0) {
  ['guru', 'kepala_madrasah', 'pengawas', 'operator', 'admin'].forEach((role) => {
    createKodeAktivasi({ role, deskripsi: `Kode demo untuk role ${role}`, dibuatOleh: 'system', count: 1 });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)