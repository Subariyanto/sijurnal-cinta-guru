import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import PerencanaanKBC from './pages/PerencanaanKBC';
import JurnalHarian from './pages/JurnalHarian';
import Eviden from './pages/Eviden';
import Observasi from './pages/Observasi';
import Validasi from './pages/Validasi';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';
import DetailJurnal from './pages/DetailJurnal';
import LaporanPengawas from './pages/LaporanPengawas';
import PembiasaanHarian from './pages/PembiasaanHarian';
import ObservasiKarakter from './pages/ObservasiKarakter';
import RekapInstrumen from './pages/RekapInstrumen';
import Panduan from './pages/Panduan';
import JurnalRefleksiMapel from './pages/JurnalRefleksiMapel';
import CekTumbuhCintaAllah from './pages/CekTumbuhCintaAllah';
import CekTumbuhCintaIlmu from './pages/CekTumbuhCintaIlmu';
import CekTumbuhCintaLingkungan from './pages/CekTumbuhCintaLingkungan';
import CekTumbuhCintaDiri from './pages/CekTumbuhCintaDiri';
import CekTumbuhCintaSesama from './pages/CekTumbuhCintaSesama';
import CekTumbuhCintaTanahAir from './pages/CekTumbuhCintaTanahAir';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="master-data" element={<ProtectedRoute roles={['admin', 'operator', 'pengawas']}><MasterData /></ProtectedRoute>} />
        <Route path="perencanaan" element={<PerencanaanKBC />} />
        <Route path="jurnal" element={<JurnalHarian />} />
        <Route path="eviden" element={<Eviden />} />
        <Route path="observasi" element={<Observasi />} />
        <Route path="validasi" element={<ProtectedRoute roles={['kepala_madrasah', 'pengawas', 'admin']}><Validasi /></ProtectedRoute>} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="pengaturan" element={<ProtectedRoute roles={['admin', 'kepala_madrasah', 'operator', 'pengawas']}><Pengaturan /></ProtectedRoute>} />
        <Route path="jurnal/:id" element={<DetailJurnal />} />
        <Route path="laporan-pengawas" element={<ProtectedRoute roles={['pengawas', 'admin']}><LaporanPengawas /></ProtectedRoute>} />
        <Route path="pembiasaan-harian" element={<PembiasaanHarian />} />
        <Route path="jurnal-refleksi-mapel" element={<JurnalRefleksiMapel />} />
        <Route path="observasi-karakter" element={<ObservasiKarakter />} />
        <Route path="cek-tumbuh-cinta-allah" element={<CekTumbuhCintaAllah />} />
        <Route path="cek-tumbuh-cinta-ilmu" element={<CekTumbuhCintaIlmu />} />
        <Route path="cek-tumbuh-cinta-lingkungan" element={<CekTumbuhCintaLingkungan />} />
        <Route path="cek-tumbuh-cinta-diri" element={<CekTumbuhCintaDiri />} />
        <Route path="cek-tumbuh-cinta-sesama" element={<CekTumbuhCintaSesama />} />`r`n        <Route path="cek-tumbuh-cinta-tanah-air" element={<CekTumbuhCintaTanahAir />} />
        <Route path="rekap-instrumen" element={<RekapInstrumen />} />
        <Route path="panduan" element={<Panduan />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}







