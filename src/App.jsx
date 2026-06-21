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
        <Route path="master-data" element={<ProtectedRoute roles={['admin', 'operator']}><MasterData /></ProtectedRoute>} />
        <Route path="perencanaan" element={<PerencanaanKBC />} />
        <Route path="jurnal" element={<JurnalHarian />} />
        <Route path="eviden" element={<Eviden />} />
        <Route path="observasi" element={<Observasi />} />
        <Route path="validasi" element={<ProtectedRoute roles={['kepala_madrasah', 'pengawas', 'admin']}><Validasi /></ProtectedRoute>} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="pengaturan" element={<ProtectedRoute roles={['admin']}><Pengaturan /></ProtectedRoute>} />
        <Route path="jurnal/:id" element={<DetailJurnal />} />
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