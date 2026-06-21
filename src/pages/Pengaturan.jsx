import React, { useState } from 'react';
import { getData, updateCollection, setData } from '../lib/store';
import { createSeedData } from '../lib/seed';
import { useAuth } from '../lib/AuthContext';
import { getSyncSettings, saveSyncSettings, syncToServer, listMadrasahFromServer } from '../lib/sync';
import { Save, RefreshCw, Download, Upload, Settings, Database, AlertTriangle, Cloud, CloudUpload, CheckCircle2, ExternalLink } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

export default function Pengaturan() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const data = getData();
  const [settings, setSettings] = useState({
    tahunPelajaran: data.pengaturan?.tahunPelajaran || '2025/2026',
    semester: data.pengaturan?.semester || 'Ganjil',
    namaAplikasi: data.pengaturan?.namaAplikasi || 'SiJurnal Cinta Guru',
    logoKemenag: data.pengaturan?.logoKemenag || '',
    logoMadrasah: data.pengaturan?.logoMadrasah || '',
  });
  const [sync, setSync] = useState(getSyncSettings());
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [serverList, setServerList] = useState(null);

  const handleSaveSync = () => {
    saveSyncSettings(sync);
    showToast('Pengaturan sync disimpan','success');
  };

  const handleSyncNow = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      saveSyncSettings(sync);
      const res = await syncToServer({
        madrasahId: sync.madrasahId,
        madrasahNama: sync.madrasahNama,
        senderNama: user?.nama || '-',
        senderRole: user?.role || '-',
      });
      setSyncMsg('✅ Sync berhasil: ' + (res.timestamp || ''));
      setSync(getSyncSettings());
      showToast('Data berhasil dikirim ke Pokjawas','success');
    } catch (e) {
      setSyncMsg('❌ ' + e.message);
      showToast('Gagal sync: ' + e.message,'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleListServer = async () => {
    try {
      saveSyncSettings(sync);
      const list = await listMadrasahFromServer();
      setServerList(list);
      showToast(`Ditemukan ${list.length} madrasah di server`,'success');
    } catch (e) {
      showToast('Gagal: ' + e.message,'error');
    }
  };

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-1"><Cloud className="w-5 h-5 text-[#2fa295]"/><h3 className="font-semibold text-gray-800">Sync ke Server Pokjawas (Google Sheet)</h3></div>
        <p className="text-xs text-gray-500 mb-4">Kirim data madrasah ini ke endpoint Google Apps Script milik Pokjawas, sehingga pengawas bisa memantau perkembangan tanpa import file. Lihat <code className="bg-gray-100 px-1.5 py-0.5 rounded">PANDUAN-SYNC.md</code> untuk setup.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Endpoint Apps Script</label>
            <input value={sync.endpoint} onChange={e=>setSync({...sync, endpoint: e.target.value})} placeholder="https://script.google.com/macros/s/AKfyc.../exec" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#2fa295] outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token Rahasia</label>
            <input type="password" value={sync.token} onChange={e=>setSync({...sync, token: e.target.value})} placeholder="shared token" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#2fa295] outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Madrasah (unik)</label>
            <input value={sync.madrasahId} onChange={e=>setSync({...sync, madrasahId: e.target.value})} placeholder="contoh: MI-NURUL-HUDA" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2fa295] outline-none"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Madrasah (untuk tampilan di dashboard pengawas)</label>
            <input value={sync.madrasahNama} onChange={e=>setSync({...sync, madrasahNama: e.target.value})} placeholder="contoh: MI Nurul Huda Sukowono" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2fa295] outline-none"/>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={handleSaveSync} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2"><Save className="w-4 h-4"/>Simpan Konfigurasi</button>
          <button onClick={handleSyncNow} disabled={syncing || !sync.endpoint} className="px-4 py-2.5 bg-[#2fa295] text-white rounded-lg text-sm font-medium hover:bg-[#278f84] disabled:opacity-50 flex items-center gap-2">{syncing ? <RefreshCw className="w-4 h-4 animate-spin"/> : <CloudUpload className="w-4 h-4"/>}Sync Sekarang</button>
          {(user?.role === 'pengawas' || user?.role === 'admin') && (
            <button onClick={handleListServer} disabled={!sync.endpoint} className="px-4 py-2.5 border border-[#2fa295] text-[#2fa295] rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-2"><ExternalLink className="w-4 h-4"/>Cek Daftar Madrasah Terkoneksi</button>
          )}
        </div>
        {sync.lastSyncAt && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-green-500"/> Sync terakhir: {new Date(sync.lastSyncAt).toLocaleString('id-ID')} ({sync.lastSyncStatus})
          </div>
        )}
        {syncMsg && <div className="mt-2 text-xs">{syncMsg}</div>}
        {serverList && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-emerald-800 mb-2">Daftar Madrasah Terkoneksi ({serverList.length})</p>
            <table className="w-full text-xs">
              <thead><tr className="text-left text-emerald-700"><th className="py-1">Nama</th><th className="py-1">Pengirim</th><th className="py-1">Terakhir Sync</th><th className="py-1 text-right">Jurnal/Pembiasaan/Karakter</th></tr></thead>
              <tbody>{serverList.map((m,i)=>(<tr key={i} className="border-t border-emerald-200/40"><td className="py-1">{m['Nama Madrasah']}</td><td className="py-1">{m['Pengirim']}</td><td className="py-1">{m['Terakhir Sync']}</td><td className="py-1 text-right font-mono">{m['Total Jurnal']}/{m['Total Pembiasaan']}/{m['Total Observasi']}</td></tr>))}</tbody>
            </table>
          </div>
        )}
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
