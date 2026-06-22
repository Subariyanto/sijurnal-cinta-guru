// src/lib/sync.js - Sync ke Google Apps Script (Pokjawas Server)
import { getData, setData } from './store';

const SETTINGS_KEY = 'pengaturan';

// Default endpoint + token — di-bundle ke build supaya semua device (user yg daftar di HP/laptop
// lain) otomatis pakai server tanpa setup manual. Admin tetap bisa override di Pengaturan.
const DEFAULT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxVEtQwasvIfZLCgq1qz77H-ERIEt-RCq__mcDfNiSdghNM405K-UbqXr20nizEin8ziA/exec';
const DEFAULT_TOKEN = 'pokjawas-jember-ripyplc3rgxznowd';

export function getSyncSettings() {
  const data = getData();
  const saved = data.pengaturan?.sync;
  if (saved && saved.endpoint) {
    // Backfill kodeServer:true bila admin lama belum punya flag (sebelum kita default-on)
    return { ...saved, kodeServer: saved.kodeServer ?? true };
  }
  // Fallback ke default sehingga server mode aktif tanpa setup manual di device baru
  return {
    endpoint: DEFAULT_ENDPOINT,
    token: DEFAULT_TOKEN,
    madrasahId: saved?.madrasahId || '',
    madrasahNama: saved?.madrasahNama || '',
    autoSync: saved?.autoSync || false,
    lastSyncAt: saved?.lastSyncAt || null,
    lastSyncStatus: saved?.lastSyncStatus || null,
    kodeServer: true,
  };
}

export function saveSyncSettings(sync) {
  const data = getData();
  const next = { ...(data.pengaturan || {}), sync };
  setData(SETTINGS_KEY, next);
  return next;
}

// Push data ke Apps Script endpoint
export async function syncToServer({ madrasahId, madrasahNama, senderNama, senderRole } = {}) {
  const cfg = getSyncSettings();
  if (!cfg.endpoint || !cfg.token) {
    throw new Error('Endpoint atau token belum di-set di Pengaturan > Sync');
  }
  const data = getData();
  const payload = {
    action: 'sync',
    token: cfg.token,
    madrasahId: madrasahId || cfg.madrasahId || 'default',
    madrasahNama: madrasahNama || cfg.madrasahNama || 'Madrasah',
    senderNama: senderNama || '-',
    senderRole: senderRole || '-',
    data: {
      madrasah: data.madrasah || [],
      guru: data.guru || [],
      kelas: data.kelas || [],
      murid: data.murid || [],
      jurnalHarian: data.jurnalHarian || [],
      pembiasaanHarian: data.pembiasaanHarian || [],
      observasiKarakter: data.observasiKarakter || [],
      observasi: data.observasi || [],
      eviden: data.eviden || [],
      validasi: data.validasi || [],
      perencanaan: data.perencanaan || [],
    }
  };

  // Apps Script tidak terima preflight CORS untuk JSON, pakai text/plain
  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Gagal sync');

  // Simpan timestamp
  saveSyncSettings({
    ...cfg,
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: 'ok',
  });
  return json;
}

// Pull dari endpoint (untuk pengawas viewer)
export async function fetchFromServer({ madrasahId, all = true } = {}) {
  const cfg = getSyncSettings();
  if (!cfg.endpoint || !cfg.token) {
    throw new Error('Endpoint atau token belum di-set');
  }
  const params = new URLSearchParams({
    token: cfg.token,
    action: 'fetch',
    all: all ? '1' : '0',
  });
  if (madrasahId) params.set('madrasahId', madrasahId);
  const url = `${cfg.endpoint}?${params}`;
  const res = await fetch(url, { redirect: 'follow' });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Gagal fetch');
  return json.data;
}

// List madrasah yang sudah pernah sync
export async function listMadrasahFromServer() {
  const cfg = getSyncSettings();
  if (!cfg.endpoint || !cfg.token) {
    throw new Error('Endpoint atau token belum di-set');
  }
  const params = new URLSearchParams({
    token: cfg.token,
    action: 'list',
  });
  const res = await fetch(`${cfg.endpoint}?${params}`, { redirect: 'follow' });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Gagal fetch list');
  return json.madrasah || [];
}
