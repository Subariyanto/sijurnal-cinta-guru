import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard, Building2, FileText, Edit3, Camera, Eye, CheckCircle,
  BarChart3, Settings, LogOut, ClipboardCheck, CalendarCheck, Sparkles,
  Layers, HelpCircle, Menu, X, Heart, ChevronDown, BookOpen, SlidersHorizontal
} from 'lucide-react';

const groups = [
  {
    label: 'Pembelajaran', icon: BookOpen,
    items: [
      { to: '/perencanaan', label: 'Perencanaan KBC', icon: FileText },
      { to: '/jurnal', label: 'Jurnal Harian Guru', icon: Edit3 },
      { to: '/eviden', label: 'Eviden Digital', icon: Camera },
    ],
  },
  {
    label: 'Pembiasaan & Instrumen', icon: Layers,
    items: [
      { to: '/pembiasaan-harian', label: 'Jurnal Pembiasaan Harian', icon: CalendarCheck },
      { to: '/observasi-karakter', label: 'Observasi Karakter Murid', icon: Sparkles },
      { to: '/observasi', label: 'Observasi Siswa', icon: Eye },
      { to: '/rekap-instrumen', label: 'Rekap Instrumen KBC', icon: Layers },
    ],
  },
  {
    label: 'Monitoring & Laporan', icon: BarChart3,
    items: [
      { to: '/validasi', label: 'Validasi', icon: CheckCircle, roles: ['kepala_madrasah', 'pengawas', 'admin'] },
      { to: '/laporan', label: 'Rekap & Laporan', icon: BarChart3 },
      { to: '/laporan-pengawas', label: 'Laporan Monev Pengawas', icon: ClipboardCheck, roles: ['pengawas', 'admin'] },
    ],
  },
  {
    label: 'Administrasi', icon: SlidersHorizontal,
    items: [
      { to: '/master-data', label: 'Master Data', icon: Building2, roles: ['admin', 'operator', 'pengawas'] },
      { to: '/pengaturan', label: 'Pengaturan', icon: Settings, roles: ['admin', 'kepala_madrasah', 'operator', 'pengawas'] },
      { to: '/panduan', label: 'Panduan Penggunaan', icon: HelpCircle },
    ],
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const navRef = useRef(null);
  const visibleGroups = groups.map(g => ({ ...g, items: g.items.filter(i => !i.roles || i.roles.includes(user?.role)) })).filter(g => g.items.length);
  const active = path => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    const close = e => { if (navRef.current && !navRef.current.contains(e.target)) setOpenGroup(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const closeMenus = () => { setOpenGroup(null); setMobileOpen(false); };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm" ref={navRef}>
      <div className="bg-[#102a4d] text-white">
        <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eecb59] text-pink-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-sm sm:text-base">e-Jurnal Refleksi Harian Guru</h1>
            <p className="flex items-center gap-2 text-[11px] sm:text-xs text-blue-200">
              <span>Berbasis Panca Cinta</span><span className="w-8 border-t border-blue-200" /><span>Guru</span>
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="text-right leading-tight"><p className="text-sm font-medium">{user?.nama}</p><p className="text-[11px] text-blue-200 capitalize">{user?.role?.replace('_', ' ')}</p></div>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 text-sm hover:bg-white/10 rounded-lg"><LogOut className="w-4 h-4" /> Keluar</button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-auto md:hidden p-2 hover:bg-white/10 rounded-lg" aria-label="Buka menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <nav className={`${mobileOpen ? 'block' : 'hidden'} md:block bg-white border-b border-gray-200`}>
        <div className="max-w-[1600px] mx-auto md:flex md:items-center px-3 md:px-5 py-2 md:py-0 max-h-[calc(100vh-64px)] overflow-y-auto md:overflow-visible">
          <NavLink to="/" onClick={closeMenus} className={`flex items-center gap-2 px-3 py-2.5 md:py-3.5 text-[13px] font-medium border-l-4 md:border-l-0 md:border-b-3 ${active('/') ? 'border-[#e0b72f] text-[#102a4d] bg-amber-50 md:bg-transparent' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-4 h-4" /> Beranda
          </NavLink>

          {visibleGroups.map(group => {
            const groupActive = group.items.some(i => active(i.to));
            const expanded = openGroup === group.label;
            return (
              <div key={group.label} className="relative">
                <button onClick={() => setOpenGroup(expanded ? null : group.label)} className={`w-full flex items-center gap-2 px-3 py-2.5 md:py-3.5 text-[13px] font-medium border-l-4 md:border-l-0 md:border-b-3 ${groupActive ? 'border-[#e0b72f] text-[#102a4d] bg-amber-50 md:bg-transparent' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                  <group.icon className="w-4 h-4" /><span className="whitespace-nowrap">{group.label}</span><ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="md:absolute md:top-full md:left-0 md:min-w-64 md:bg-white md:border md:border-gray-200 md:rounded-b-xl md:shadow-xl md:p-2 md:z-50 pl-5 md:pl-2">
                    {group.items.map(item => (
                      <NavLink key={item.to} to={item.to} onClick={closeMenus} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] whitespace-nowrap ${active(item.to) ? 'bg-amber-50 text-[#102a4d] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-[#102a4d]'}`}>
                        <item.icon className="w-4 h-4" />{item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="md:hidden border-t mt-2 pt-2 px-3 pb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">{user?.nama}</span><button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 px-3 py-2"><LogOut className="w-4 h-4" /> Keluar</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
