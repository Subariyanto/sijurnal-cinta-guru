// src/lib/aktivasi.js
// Kode aktivasi single-use untuk pendaftaran user baru.
// Disimpan di localStorage via store.js (collection: kodeAktivasi)

import { getData, setData, generateId } from './store';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa I,O,0,1 biar mudah dibaca

function randomSegment(n = 4) {
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

// Format: KBC-XXXX-XXXX (10 char hash)
export function generateKodeAktivasi() {
  return `KBC-${randomSegment(4)}-${randomSegment(4)}`;
}

export function getAllKodeAktivasi() {
  return getData().kodeAktivasi || [];
}

export function saveAllKodeAktivasi(arr) {
  setData('kodeAktivasi', arr);
}

export function findKodeAktivasi(kode) {
  if (!kode) return null;
  const norm = String(kode).trim().toUpperCase();
  return getAllKodeAktivasi().find((k) => k.kode === norm) || null;
}

export function isKodeValid(kode) {
  const k = findKodeAktivasi(kode);
  if (!k) return { ok: false, reason: 'Kode aktivasi tidak ditemukan' };
  if (k.digunakan) return { ok: false, reason: 'Kode aktivasi sudah pernah digunakan' };
  return { ok: true, kode: k };
}

export function createKodeAktivasi({ role, deskripsi = '', dibuatOleh = '-', count = 1 }) {
  const all = getAllKodeAktivasi();
  const existing = new Set(all.map((k) => k.kode));
  const created = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    let kode;
    do { kode = generateKodeAktivasi(); } while (existing.has(kode));
    existing.add(kode);
    created.push({
      id: generateId(),
      kode,
      role,
      deskripsi,
      dibuatOleh,
      dibuatTanggal: now,
      digunakan: false,
      digunakanOleh: null,
      digunakanTanggal: null,
    });
  }
  saveAllKodeAktivasi([...all, ...created]);
  return created;
}

export function consumeKodeAktivasi(kode, { userId, username }) {
  const all = getAllKodeAktivasi();
  const norm = String(kode).trim().toUpperCase();
  const idx = all.findIndex((k) => k.kode === norm);
  if (idx === -1) return false;
  if (all[idx].digunakan) return false;
  all[idx] = {
    ...all[idx],
    digunakan: true,
    digunakanOleh: userId,
    digunakanOlehUsername: username || null,
    digunakanTanggal: Date.now(),
  };
  saveAllKodeAktivasi(all);
  return true;
}

export function deleteKodeAktivasi(id) {
  const all = getAllKodeAktivasi();
  const next = all.filter((k) => k.id !== id);
  saveAllKodeAktivasi(next);
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
