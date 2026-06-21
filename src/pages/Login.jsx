import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const u = login(username, password);
    if (!u) setError('Username atau password salah');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#102a4d] to-[#0f2640] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#eecb59] rounded-2xl flex items-center justify-center mx-auto mb-4"><LogIn className="w-8 h-8 text-[#102a4d]" /></div>
          <h1 className="text-2xl font-bold text-white">e-Jurnal KBC Madrasah</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Jurnal Digital Implementasi KBC di Madrasah</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Masuk</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" required /></div>
          <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" required /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400"><EyeOff className="w-4 h-4" /></button></div>
          <button type="submit" className="w-full py-3 bg-[#102a4d] text-white rounded-lg font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><LogIn className="w-4 h-4" />Masuk</button>
          <div className="border-t pt-4"><p className="text-xs font-medium text-gray-500 mb-2">Akun Demo:</p><div className="grid grid-cols-2 gap-2 text-xs text-gray-600">{[
            ['admin / admin123', '(Admin)'], ['guru1 / guru123', '(Guru)'], ['kepala / kepala123', '(Kepala)'], ['pengawas / pengawas123', '(Pengawas)']
          ].map(([cred, role]) => <button key={cred} type="button" onClick={() => { setUsername(cred.split(' / ')[0]); setPassword(cred.split(' / ')[1]); }} className="text-left p-2 bg-gray-50 rounded hover:bg-gray-100"><span className="font-mono text-[10px]">{cred}</span><br/><span className="text-gray-400">{role}</span></button>)}</div></div>
        </form>
      </div>
    </div>
  );
}