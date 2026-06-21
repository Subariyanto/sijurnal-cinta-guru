import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Menu, LogOut } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-gray-600 hidden sm:inline">{user?.nama}</span>
        <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"><LogOut className="w-4 h-4" />Keluar</button>
      </div>
    </header>
  );
}