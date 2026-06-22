import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getData, addItem, generateId } from '../lib/store';
import { LogIn, Eye, EyeOff, UserPlus, ShoppingCart, ArrowLeft, ShieldCheck } from 'lucide-react';

const WA_YANTO = '6282330647698'; // Subariyanto - Pokjawas Jember
const WA_MESSAGE = encodeURIComponent(
  'Assalamualaikum Pak. Saya tertarik untuk membeli lisensi FULL e-Jurnal KBC Madrasah. Mohon informasinya.'
);

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // register state
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regRole, setRegRole] = useState('guru');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const u = login(username.trim(), password);
    if (!u) setError('Username atau password salah');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    const nama = regNama.trim();
    const uname = regUsername.trim().toLowerCase();
    if (!nama || !uname || !regPassword) {
      setError('Nama, username, dan password wajib diisi');
      return;
    }
    if (uname.length < 3) {
      setError('Username minimal 3 karakter');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (regPassword !== regPassword2) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    const data = getData();
    if (data.pengguna.some((p) => p.username.toLowerCase() === uname)) {
      setError('Username sudah dipakai. Silakan pilih yang lain.');
      return;
    }
    const newUser = {
      id: generateId(),
      username: uname,
      password: regPassword,
      role: regRole,
      nama,
      guruId: null,
      madrasahId: null,
    };
    addItem('pengguna', newUser);
    showToast('Pendaftaran berhasil. Silakan login.', 'success');
    // pre-fill login form
    setUsername(uname);
    setPassword('');
    setRegNama(''); setRegUsername(''); setRegPassword(''); setRegPassword2(''); setRegRole('guru');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#102a4d] to-[#0f2640] flex items-center justify-center p-4">
      <Toast msg={toast.msg} type={toast.type} />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#eecb59] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-[#102a4d]" />
          </div>
          <h1 className="text-2xl font-bold text-white">e-Jurnal KBC Madrasah</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Jurnal Digital Implementasi KBC di Madrasah</p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800">Masuk</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"
                required
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none pr-10"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400" aria-label="Tampilkan password">
                {showPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="w-full py-3 bg-[#102a4d] text-white rounded-lg font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />Masuk
            </button>

            <div className="border-t pt-4 space-y-3">
              <div className="text-center text-sm text-gray-600">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-[#102a4d] font-semibold hover:underline"
                >
                  Daftar di sini
                </button>
              </div>
              <a
                href={`https://wa.me/${WA_YANTO}?text=${WA_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#eecb59] text-[#102a4d] rounded-lg font-semibold hover:bg-[#e6bf3d] flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Beli Lisensi FULL
              </a>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Lisensi FULL membuka semua fitur tanpa batas waktu.
              </p>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-gray-500 hover:text-gray-700" aria-label="Kembali">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Daftar Akun Baru
              </h2>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={regNama}
                onChange={(e) => { setRegNama(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"
                placeholder="contoh: Siti Nurhalimah, S.Pd"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => { setRegUsername(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"
                placeholder="minimal 3 karakter, tanpa spasi"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peran (Role)</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none bg-white"
              >
                <option value="guru">Guru</option>
                <option value="kepala_madrasah">Kepala Madrasah</option>
                <option value="pengawas">Pengawas</option>
                <option value="operator">Operator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => { setRegPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"
                placeholder="minimal 6 karakter"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={regPassword2}
                onChange={(e) => { setRegPassword2(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"
                placeholder="ulangi password"
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[#102a4d] text-white rounded-lg font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Daftar
            </button>
            <div className="bg-blue-50 text-blue-700 text-[11px] p-3 rounded-lg flex gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Akun disimpan di perangkat ini (localStorage). Untuk akses lintas perangkat dan fitur penuh, silakan beli Lisensi FULL.</span>
            </div>
            <div className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[#102a4d] font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
