import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createSeedData } from './lib/seed.js'
import { getData, setData } from './lib/store.js'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)