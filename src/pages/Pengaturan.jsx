import React, { useState, useEffect } from 'react';
import { getData, updateCollection, setData } from '../lib/store';
import { createSeedData } from '../lib/seed';
import { useAuth } from '../lib/AuthContext';
import { getSyncSettings, saveSyncSettings, syncToServer, listMadrasahFromServer } from '../lib/sync';
import { listKodeAktivasi, createKodeAktivasi, deleteKodeAktivasi, ROLE_LABEL, isKodeServerMode, getAllKodeAktivasiLocal } from '../lib/aktivasi';
import { Save, RefreshCw, Download, Upload, Settings, Database, AlertTriangle, Cloud, CloudUpload, CheckCircle2, ExternalLink, KeyRound, Plus, Copy, Trash2, MessageCircle, Server, HardDrive, ArrowUpCircle } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

export default function Pengaturan() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const data = getData();
  const [settings, setSettings] = useState({
    tahunPelajaran: data.pengaturan?.tahunPelajaran || '2025/2026',
    semester: data.pengaturan?.semester || 'Ganjil',
    namaAplikasi: data.pengaturan?.namaAplikasi || 'e-Jurnal KBC Madrasah',
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
      namaAplikasi: seed.pengaturan?.namaAplikasi || 'e-Jurnal KBC Madrasah',
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
  const isAdmin = user?.role === 'admin';

  // === Kode Aktivasi state ===
  const [kodeList, setKodeList] = useState([]);
  const [kodeRole, setKodeRole] = useState('guru');
  const [kodeDeskripsi, setKodeDeskripsi] = useState('');
  const [kodeJumlah, setKodeJumlah] = useState(1);
  const [kodeFilter, setKodeFilter] = useState('semua');
  const [kodeLoading, setKodeLoading] = useState(false);
  const [kodeServer, setKodeServer] = useState(isKodeServerMode());

  const refreshKode = async () => {
    setKodeLoading(true);
    try {
      const list = await listKodeAktivasi();
      setKodeList(list);
    } catch (e) {
      showToast('Gagal load kode: ' + e.message, 'error');
    } finally {
      setKodeLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) refreshKode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, kodeServer]);

  const handleToggleKodeServer = (enabled) => {
    const next = { ...sync, kodeServer: enabled };
    setSync(next);
    saveSyncSettings(next);
    setKodeServer(isKodeServerMode());
    showToast(enabled ? 'Mode server kode aktivasi aktif' : 'Kembali ke mode local', 'success');
  };

  const handleMigrateLocalKeServer = async () => {
    const localKode = getAllKodeAktivasiLocal();
    if (localKode.length === 0) { showToast('Tidak ada kode local untuk dimigrasi', 'error'); return; }
    if (!confirm(`Push ${localKode.length} kode dari local ke server? Kode yang sudah ada di server akan di-skip otomatis.`)) return;
    setKodeLoading(true);
    try {
      const cfg = sync;
      const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'kode-create', token: cfg.token, items: localKode }),
        redirect: 'follow',
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Gagal migrasi');
      showToast(`${json.created} kode berhasil dimigrasi ke server (sisanya duplikat).`, 'success');
      await refreshKode();
    } catch (e) {
      showToast('Gagal migrasi: ' + e.message, 'error');
    } finally {
      setKodeLoading(false);
    }
  };

  const handleGenerateKode = async () => {
    const n = Math.max(1, Math.min(50, parseInt(kodeJumlah, 10) || 1));
    setKodeLoading(true);
    try {
      const created = await createKodeAktivasi({
        role: kodeRole,
        deskripsi: kodeDeskripsi.trim(),
        dibuatOleh: user?.nama || user?.username || '-',
        count: n,
      });
      showToast(`${created.length} kode aktivasi berhasil dibuat`, 'success');
      setKodeDeskripsi('');
      setKodeJumlah(1);
      await refreshKode();
    } catch (e) {
      showToast('Gagal generate: ' + e.message, 'error');
    } finally {
      setKodeLoading(false);
    }
  };

  const handleCopyKode = (kode) => {
    navigator.clipboard?.writeText(kode);
    showToast(`Kode ${kode} disalin`, 'success');
  };

  const handleShareKode = (item) => {
    const teks = `Assalamualaikum.\n\nBerikut Kode Aktivasi e-Jurnal KBC Madrasah Bapak/Ibu:\n\nKode: ${item.kode}\nPeran: ${ROLE_LABEL(item.role)}\n\nCara daftar:\n1. Buka aplikasi\n2. Klik "Daftar di sini"\n3. Masukkan kode di atas, lengkapi data, lalu klik Daftar.\n\nKode hanya bisa digunakan satu kali.`;
    const url = `https://wa.me/?text=${encodeURIComponent(teks)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteKode = async (item) => {
    if (item.digunakan) { showToast('Kode yang sudah dipakai tidak bisa dihapus', 'error'); return; }
    if (!confirm(`Hapus kode ${item.kode}?`)) return;
    setKodeLoading(true);
    try {
      await deleteKodeAktivasi(item);
      showToast('Kode dihapus', 'success');
      await refreshKode();
    } catch (e) {
      showToast('Gagal hapus: ' + e.message, 'error');
    } finally {
      setKodeLoading(false);
    }
  };

  const filteredKode = kodeList.filter(k => kodeFilter === 'semua' || (kodeFilter === 'tersedia' ? !k.digunakan : k.digunakan)).slice().reverse();
  const stat = {
    total: kodeList.length,
    tersedia: kodeList.filter(k => !k.digunakan).length,
    terpakai: kodeList.filter(k => k.digunakan).length,
  };

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

      {user?.role !== 'pengawas' && (
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
      )}

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-[#eecb59]"/><h3 className="font-semibold text-gray-800">Kode Aktivasi Pendaftaran</h3></div>
            <div className="flex items-center gap-2 text-xs">
              {kodeServer ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold"><Server className="w-3 h-3"/>Mode Server</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-semibold"><HardDrive className="w-3 h-3"/>Mode Local</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">{kodeServer
            ? 'Kode tersimpan di server (Google Sheet via Apps Script). Bisa generate di laptop, dipakai user di HP/laptop lain.'
            : 'Kode tersimpan di browser ini saja. Untuk multi-device, aktifkan mode server di bawah (butuh endpoint sync sudah di-set).'}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => handleToggleKodeServer(!sync.kodeServer)}
              disabled={!sync.endpoint || !sync.token}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${sync.kodeServer ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50`}
              title={!sync.endpoint || !sync.token ? 'Set endpoint+token sync dulu di section Sync di bawah' : ''}
            >
              {sync.kodeServer ? <><Server className="w-3.5 h-3.5"/>Mode Server: ON</> : <><HardDrive className="w-3.5 h-3.5"/>Aktifkan Mode Server</>}
            </button>
            <button onClick={refreshKode} disabled={kodeLoading} className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${kodeLoading ? 'animate-spin' : ''}`}/>Refresh
            </button>
            {sync.kodeServer && getAllKodeAktivasiLocal().length > 0 && (
              <button onClick={handleMigrateLocalKeServer} disabled={kodeLoading} className="px-3 py-2 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-2 disabled:opacity-50" title={`Push ${getAllKodeAktivasiLocal().length} kode dari local ke server`}>
                <ArrowUpCircle className="w-3.5 h-3.5"/>Migrasi {getAllKodeAktivasiLocal().length} kode local → server
              </button>
            )}
            {!sync.endpoint && (
              <span className="text-[11px] text-amber-600">⚠️ Set endpoint sync di bawah dulu untuk pakai mode server.</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold text-gray-800">{stat.total}</p></div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center"><p className="text-xs text-emerald-700">Tersedia</p><p className="text-2xl font-bold text-emerald-700">{stat.tersedia}</p></div>
            <div className="bg-amber-50 rounded-lg p-3 text-center"><p className="text-xs text-amber-700">Terpakai</p><p className="text-2xl font-bold text-amber-700">{stat.terpakai}</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Peran (Role)</label>
              <select value={kodeRole} onChange={e=>setKodeRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#eecb59] outline-none">
                <option value="guru">Guru</option>
                <option value="kepala_madrasah">Kepala Madrasah</option>
                <option value="pengawas">Pengawas</option>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
              <input value={kodeDeskripsi} onChange={e=>setKodeDeskripsi(e.target.value)} placeholder="contoh: Guru MI Nurul Huda Sukowono" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#eecb59] outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah</label>
              <input type="number" min="1" max="50" value={kodeJumlah} onChange={e=>setKodeJumlah(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#eecb59] outline-none"/>
            </div>
          </div>
          <button onClick={handleGenerateKode} disabled={kodeLoading} className="px-4 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center gap-2 mb-4 disabled:opacity-60">{kodeLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}Generate Kode Aktivasi</button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-700">Filter:</span>
            {['semua','tersedia','terpakai'].map(f => (
              <button key={f} onClick={()=>setKodeFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium ${kodeFilter===f ? 'bg-[#102a4d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Kode</th>
                  <th className="text-left px-3 py-2 font-semibold">Role</th>
                  <th className="text-left px-3 py-2 font-semibold">Deskripsi</th>
                  <th className="text-left px-3 py-2 font-semibold">Status</th>
                  <th className="text-left px-3 py-2 font-semibold">Dibuat</th>
                  <th className="text-right px-3 py-2 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kodeLoading && (
                  <tr><td colSpan="6" className="text-center py-6 text-gray-400 italic">Memuat...</td></tr>
                )}
                {!kodeLoading && filteredKode.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-6 text-gray-400 italic">Belum ada kode aktivasi.</td></tr>
                )}
                {!kodeLoading && filteredKode.map(k => (
                  <tr key={k.id || k.kode} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-2 font-mono font-semibold text-[#102a4d]">{k.kode}</td>
                    <td className="px-3 py-2">{ROLE_LABEL(k.role)}</td>
                    <td className="px-3 py-2 text-gray-600">{k.deskripsi || <span className="text-gray-400 italic">-</span>}</td>
                    <td className="px-3 py-2">{k.digunakan ? (<span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">Terpakai oleh {k.digunakanOlehUsername || k.digunakanOleh}</span>) : (<span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">Tersedia</span>)}</td>
                    <td className="px-3 py-2 text-gray-500">{k.dibuatTanggal ? new Date(k.dibuatTanggal).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={()=>handleCopyKode(k.kode)} title="Salin kode" className="p-1.5 text-gray-500 hover:text-[#102a4d] hover:bg-blue-50 rounded"><Copy className="w-3.5 h-3.5"/></button>
                        {!k.digunakan && (<button onClick={()=>handleShareKode(k)} title="Bagikan via WhatsApp" className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"><MessageCircle className="w-3.5 h-3.5"/></button>)}
                        {!k.digunakan && (<button onClick={()=>handleDeleteKode(k)} title="Hapus" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
