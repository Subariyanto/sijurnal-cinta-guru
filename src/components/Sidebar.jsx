import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard, Building2, Users, BookOpen, Heart,
  FileText, Edit3, Camera, Eye, CheckCircle, BarChart3, Settings, X, ClipboardCheck,
  CalendarCheck, Sparkles, Layers, HelpCircle
} from 'lucide-react';

const allMenus = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { to: '/master-data', label: 'Master Data', icon: Building2, roles: ['admin', 'operator'] },
  { to: '/perencanaan', label: 'Perencanaan KBC', icon: FileText, roles: null },
  { to: '/jurnal', label: 'Jurnal Harian Guru', icon: Edit3, roles: null },
  { to: '/pembiasaan-harian', label: 'Jurnal Pembiasaan Harian', icon: CalendarCheck, roles: null },
  { to: '/observasi-karakter', label: 'Observasi Karakter Murid', icon: Sparkles, roles: null },
  { to: '/eviden', label: 'Eviden Digital', icon: Camera, roles: null },
  { to: '/observasi', label: 'Observasi Siswa', icon: Eye, roles: null },
  { to: '/validasi', label: 'Validasi', icon: CheckCircle, roles: ['kepala_madrasah', 'pengawas', 'admin'] },
  { to: '/laporan', label: 'Rekap & Laporan', icon: BarChart3, roles: null },
  { to: '/rekap-instrumen', label: 'Rekap Instrumen KBC', icon: Layers, roles: null },
  { to: '/laporan-pengawas', label: 'Laporan Monev Pengawas', icon: ClipboardCheck, roles: ['pengawas', 'admin'] },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, roles: ['admin', 'kepala_madrasah', 'operator', 'pengawas'] },
  { to: '/panduan', label: 'Panduan Penggunaan', icon: HelpCircle, roles: null },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const filtered = allMenus.filter(m => {
    if (!m.roles) return true;
    return user && m.roles.includes(user.role);
  });

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#102a4d] text-white z-50 transform transition-transform duration-200 overflow-y-auto ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-[#1e3a5f]">
          <div className="flex-1 text-center">
            <h1 className="font-bold text-base">e-Jurnal KBC Madrasah</h1>
            <p className="text-sm text-blue-200 tracking-tight">Kurikulum Berbasis Cinta</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-[#1e3a5f] rounded"><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-3 space-y-0.5">
          {filtered.map(m => (
            <NavLink key={m.to} to={m.to} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-normal transition whitespace-nowrap ${isActive(m.to) ? 'bg-[#eecb59] text-[#102a4d]' : 'hover:bg-[#1e3a5f] text-blue-100'}`}
            >
              <m.icon className="w-4 h-4 flex-shrink-0" />
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-[#1e3a5f] text-[11px] text-blue-200">
          <p className="font-medium">{user?.nama}</p>
          <p className="capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </aside>
    </>
  );
}