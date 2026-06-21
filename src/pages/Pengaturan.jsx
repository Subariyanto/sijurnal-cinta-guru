import React, { useState } from 'react';
import { getData, updateCollection, setData } from '../lib/store';
import { createSeedData } from '../lib/seed';
import { Save, RefreshCw, Download, Upload, Settings, Database, AlertTriangle } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

export default function Pengaturan() {
  const [tick, setTick] = useState(0);
  const data = getData();
  const [settings, setSettings] = useState({
    tahunPelajaran: data.pengaturan?.tahunPelajaran || '2025/2026',
    semester: data.pengaturan?.semester || 'Ganjil',
    namaAplikasi: data.pengaturan?.namaAplikasi || 'SiJurnal Cinta Guru',
    logoKemenag: data.pengaturan?.logoKemenag || '',
    logoMadrasah: data.pengaturan?.logoMadrasah || '',
  });

  const handleSave = () => {
    setData('pengaturan', settings);
    showToast('Pengaturan disimpan','success');
  };

  const handleReset = () => {
    if (!confirm('Reset semua data ke contoh awal? Semua data saat ini akan hilang.')) return;
    const seed = createSeedData();
    Object.entries(seed).forEach(([k, v]) => setData(k, v));
    setSettings({
      tahunPelajaran: seed.pengaturan?.tahunPelajaran || '2025/2026',
      semester: seed.pengaturan?.semester || 'Ganjil',
      namaAplikasi: seed.pengaturan?.namaAplikasi || 'SiJurnal Cinta Guru',
      logoKemenag: seed.pengaturan?.logoKemenag || '',
      logoMadrasah: seed.pengaturan?.logoMadrasah || '',
    });
    setTick(t => t+1);
    showToast('Data contoh berhasil di-reset','success');
  };

  const handleBackup = () => {
    const all = getData();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sijurnal-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast('Backup berhasil diunduh','success');
  };

  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!confirm('Restore akan menimpa data saat ini. Lanjutkan?')) return;
        Object.entries(parsed).forEach(([k, v]) => setData(k, v));
        setTick(t => t+1);
        showToast('Data berhasil di-restore','success');
      } catch (err) {
        showToast('File backup tidak valid','error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = getData();

  return (
    <div className="space-y-6" key={tick}>
      <div><h2 className="text-xl font-bold text-gray-800">Pengaturan</h2><p className="text-sm text-gray-500">Konfigurasi aplikasi, backup, dan reset data</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Settings className="w-5 h-5 text-[#102a4d]"/><h3 className="font-semibold text-gray-800">Pengaturan Dasar</h3></div>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi</label><input value={settings.namaAplikasi} onChange={e=>setSettings({...settings,namaAplikasi:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label><input value={settings.tahunPelajaran} onChange={e=>setSettings({...settings,tahunPelajaran:e.target.value})} placeholder="2025/2026" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester</label><select value={settings.semester} onChange={e=>setSettings({...settings,semester:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo Kemenag (URL)</label><input value={settings.logoKemenag} onChange={e=>setSettings({...settings,logoKemenag:e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo Madrasah (URL)</label><input value={settings.logoMadrasah} onChange={e=>setSettings({...settings,logoMadrasah:e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            <button onClick={handleSave} className="w-full mt-2 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan Pengaturan</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-[#2fa295]"/><h3 className="font-semibold text-gray-800">Backup &amp; Restore</h3></div>
            <p className="text-xs text-gray-500 mb-3">Backup seluruh data ke file JSON, atau restore dari backup sebelumnya.</p>
            <div className="space-y-2">
              <button onClick={handleBackup} className="w-full py-2.5 bg-[#2fa295] text-white rounded-lg text-sm font-medium hover:bg-[#278f84] flex items-center justify-center gap-2"><Download className="w-4 h-4"/>Download Backup</button>
              <label className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4"/>Upload Backup
                <input type="file" accept="application/json" onChange={handleRestore} className="hidden"/>
              </label>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-red-600"/><h3 className="font-semibold text-red-800">Danger Zone</h3></div>
            <p className="text-xs text-red-700 mb-3">Reset akan menghapus semua data dan menggantinya dengan data contoh awal. Tindakan ini tidak dapat dibatalkan.</p>
            <button onClick={handleReset} className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4"/>Reset Data Contoh</button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#102a4d] to-[#1a3a6b] text-white rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-white/70">Aplikasi</p>
            <p className="font-semibold">{settings.namaAplikasi}</p>
            <p className="text-xs text-white/70 mt-1">Versi 1.0.0 • LocalStorage</p>
          </div>
          <div className="h-12 w-px bg-white/20"></div>
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div><p className="text-xs text-white/70">Total Jurnal</p><p className="text-2xl font-bold">{stats.jurnalHarian.length}</p></div>
            <div><p className="text-xs text-white/70">Total Guru</p><p className="text-2xl font-bold">{stats.guru.length}</p></div>
            <div><p className="text-xs text-white/70">Total Madrasah</p><p className="text-2xl font-bold">{stats.madrasah.length}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
