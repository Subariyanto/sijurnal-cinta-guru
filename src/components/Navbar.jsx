import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard, Building2, FileText, Edit3, Camera, Eye,
  CheckCircle, BarChart3, Settings, LogOut, ClipboardCheck,
  CalendarCheck, Sparkles, Layers, HelpCircle, Menu, X, Heart
} from 'lucide-react';

const allMenus = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard, roles: null },
  { to: '/master-data', label: 'Master Data', icon: Building2, roles: ['admin', 'operator', 'pengawas'] },
  { to: '/perencanaan', label: 'Perencanaan KBC', icon: FileText, roles: null },
  { to: '/jurnal', label: 'Jurnal Guru', icon: Edit3, roles: null },
  { to: '/pembiasaan-harian', label: 'Pembiasaan', icon: CalendarCheck, roles: null },
  { to: '/observasi-karakter', label: 'Karakter Murid', icon: Sparkles, roles: null },
  { to: '/eviden', label: 'Eviden', icon: Camera, roles: null },
  { to: '/observasi', label: 'Observasi', icon: Eye, roles: null },
  { to: '/validasi', label: 'Validasi', icon: CheckCircle, roles: ['kepala_madrasah', 'pengawas', 'admin'] },
  { to: '/laporan', label: 'Laporan', icon: BarChart3, roles: null },
  { to: '/rekap-instrumen', label: 'Instrumen KBC', icon: Layers, roles: null },
  { to: '/laporan-pengawas', label: 'Monev', icon: ClipboardCheck, roles: ['pengawas', 'admin'] },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, roles: ['admin', 'kepala_madrasah', 'operator', 'pengawas'] },
  { to: '/panduan', label: 'Panduan', icon: HelpCircle, roles: null },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menus = allMenus.filter(m => !m.roles || (user && m.roles.includes(user.role)));
  const active = path => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-[#102a4d] text-white">
        <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eecb59] text-pink-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-sm sm:text-base">e-Jurnal Refleksi Harian Guru</h1>
            <p className="flex items-center gap-2 text-[11px] sm:text-xs text-blue-200">
              <span>Berbasis Panca Cinta</span>
              <span className="w-8 border-t border-blue-200" aria-hidden="true" />
              <span>Guru</span>
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">{user?.nama}</p>
              <p className="text-[11px] text-blue-200 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition" title="Keluar">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
          <button onClick={() => setOpen(!open)} className="ml-auto md:hidden p-2 hover:bg-white/10 rounded-lg" aria-label="Buka menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <nav className={`${open ? 'block' : 'hidden'} md:block bg-white border-b border-gray-200`}>
        <div className="max-w-[1600px] mx-auto md:flex md:items-center md:overflow-x-auto px-3 md:px-5 py-2 md:py-0 max-h-[calc(100vh-64px)] overflow-y-auto">
          {menus.map(m => (
            <NavLink key={m.to} to={m.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 md:py-3.5 text-[13px] font-medium whitespace-nowrap border-l-4 md:border-l-0 md:border-b-3 transition ${active(m.to) ? 'border-[#e0b72f] text-[#102a4d] bg-amber-50 md:bg-transparent' : 'border-transparent text-gray-600 hover:text-[#102a4d] hover:bg-gray-50'}`}>
              <m.icon className="w-4 h-4 flex-shrink-0" />
              <span>{m.label}</span>
            </NavLink>
          ))}
          <div className="md:hidden border-t mt-2 pt-2 px-3 pb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">{user?.nama}</span>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 px-3 py-2"><LogOut className="w-4 h-4" /> Keluar</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
