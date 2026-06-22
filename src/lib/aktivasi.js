// src/lib/aktivasi.js
// Kode aktivasi single-use untuk pendaftaran user baru.
// Mode: LOCAL (default) atau SERVER (kalau endpoint sync di-set dan kodeServerMode=true).
// Server mode pakai Google Apps Script endpoint yang sama dgn sync data.

import { getData, setData, generateId } from './store';
import { getSyncSettings } from './sync';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa I,O,0,1 biar mudah dibaca

function randomSegment(n = 4) {
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

// Format: KBC-XXXX-XXXX
export function generateKodeAktivasi() {
  return `KBC-${randomSegment(4)}-${randomSegment(4)}`;
}

// ============================================================
// SERVER MODE detection
// ============================================================
function getServerCfg() {
  // Pakai getSyncSettings supaya dapet DEFAULT_ENDPOINT + DEFAULT_TOKEN + kodeServer:true
  // (penting untuk device baru / user pendaftar yang belum punya pengaturan.sync di localStorage)
  const sync = getSyncSettings();
  const enabled = !!(sync.endpoint && sync.token && sync.kodeServer);
  return { enabled, endpoint: sync.endpoint, token: sync.token };
}

export function isKodeServerMode() {
  return getServerCfg().enabled;
}

async function postJSON(action, payload = {}) {
  const cfg = getServerCfg();
  if (!cfg.enabled) throw new Error('Mode server kode aktivasi belum aktif');
  const body = { action, token: cfg.token, ...payload };
  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });
  return res.json();
}

async function getJSON(action, params = {}) {
  const cfg = getServerCfg();
  if (!cfg.enabled) throw new Error('Mode server kode aktivasi belum aktif');
  const usp = new URLSearchParams({ action, token: cfg.token, ...params });
  const res = await fetch(`${cfg.endpoint}?${usp.toString()}`, { redirect: 'follow' });
  return res.json();
}

// ============================================================
// LOCAL helpers
// ============================================================
export function getAllKodeAktivasiLocal() {
  return getData().kodeAktivasi || [];
}

function saveAllKodeAktivasiLocal(arr) {
  setData('kodeAktivasi', arr);
}

// ============================================================
// PUBLIC API - hybrid (server-first, fallback ke local)
// ============================================================

// Sync: ambil daftar kode dari server ke local cache (read-only mirror)
export async function listKodeAktivasi() {
  if (isKodeServerMode()) {
    const json = await getJSON('kode-list');
    if (!json.ok) throw new Error(json.error || 'Gagal ambil daftar kode dari server');
    return json.kode || [];
  }
  return getAllKodeAktivasiLocal();
}

// Validasi kode (server-first)
export async function isKodeValid(kode) {
  const norm = String(kode || '').trim().toUpperCase();
  if (!norm) return { ok: false, reason: 'Kode wajib diisi' };
  if (isKodeServerMode()) {
    try {
      const json = await postJSON('kode-validate', { kode: norm });
      if (!json.ok) return { ok: false, reason: json.reason || 'Kode tidak valid' };
      return { ok: true, kode: json.kode };
    } catch (e) {
      return { ok: false, reason: 'Gagal hubungi server: ' + e.message };
    }
  }
  // Local mode
  const found = getAllKodeAktivasiLocal().find(k => k.kode === norm);
  if (!found) return { ok: false, reason: 'Kode aktivasi tidak ditemukan' };
  if (found.digunakan) return { ok: false, reason: 'Kode aktivasi sudah pernah digunakan' };
  return { ok: true, kode: found };
}

// Buat kode aktivasi (admin only). count default 1.
// Di server mode: generate id+kode di client, lalu push ke server.
// Local: simpan ke localStorage.
export async function createKodeAktivasi({ role, deskripsi = '', dibuatOleh = '-', count = 1 }) {
  const n = Math.max(1, Math.min(50, parseInt(count, 10) || 1));
  const now = Date.now();
  const items = [];
  const existing = new Set(
    (isKodeServerMode() ? (await listKodeAktivasi()) : getAllKodeAktivasiLocal()).map(k => k.kode)
  );
  for (let i = 0; i < n; i++) {
    let kode;
    do { kode = generateKodeAktivasi(); } while (existing.has(kode));
    existing.add(kode);
    items.push({
      id: generateId(),
      kode,
      role,
      deskripsi,
      dibuatOleh,
      dibuatTanggal: now,
      digunakan: false,
      digunakanOleh: '',
      digunakanOlehUsername: '',
      digunakanTanggal: '',
    });
  }
  if (isKodeServerMode()) {
    const json = await postJSON('kode-create', { items });
    if (!json.ok) throw new Error(json.error || 'Gagal create di server');
    return items;
  }
  saveAllKodeAktivasiLocal([...getAllKodeAktivasiLocal(), ...items]);
  return items;
}

// Pakai kode (registrasi user). Server-first dengan lock.
export async function consumeKodeAktivasi(kode, { userId, username }) {
  const norm = String(kode || '').trim().toUpperCase();
  if (isKodeServerMode()) {
    const json = await postJSON('kode-claim', { kode: norm, userId, username });
    if (!json.ok) return { ok: false, reason: json.reason || 'Gagal claim kode' };
    return { ok: true, kode: json.kode };
  }
  const all = getAllKodeAktivasiLocal();
  const idx = all.findIndex(k => k.kode === norm);
  if (idx === -1) return { ok: false, reason: 'Kode tidak ditemukan' };
  if (all[idx].digunakan) return { ok: false, reason: 'Kode sudah dipakai' };
  all[idx] = {
    ...all[idx],
    digunakan: true,
    digunakanOleh: userId,
    digunakanOlehUsername: username || '',
    digunakanTanggal: Date.now(),
  };
  saveAllKodeAktivasiLocal(all);
  return { ok: true, kode: all[idx] };
}

export async function deleteKodeAktivasi(item) {
  if (isKodeServerMode()) {
    const json = await postJSON('kode-delete', { id: item.id });
    if (!json.ok) throw new Error(json.error || 'Gagal hapus di server');
    return true;
  }
  const all = getAllKodeAktivasiLocal();
  saveAllKodeAktivasiLocal(all.filter(k => k.id !== item.id));
  return true;
}

export function ROLE_LABEL(role) {
  const map = {
    guru: 'Guru',
    kepala_madrasah: 'Kepala Madrasah',
    pengawas: 'Pengawas',
    operator: 'Operator',
    admin: 'Admin',
  };
  return map[role] || role;
}
