/**
 * SiJurnal Cinta Guru - Sync Endpoint (Google Apps Script)
 * 
 * Endpoint Web App untuk menerima data sync dari aplikasi SiJurnal Cinta Guru
 * dan menulis ke Google Sheet sebagai dashboard pengawas.
 * 
 * Cara deploy:
 * 1. Buka https://script.google.com -> New Project
 * 2. Paste kode ini, ganti SHARED_TOKEN dengan token rahasia Pak Yanto
 * 3. Klik tombol Deploy -> New deployment
 * 4. Type: Web app
 *    Execute as: Me (subariyantoss05@gmail.com)
 *    Who has access: Anyone
 * 5. Copy URL deployment -> paste ke aplikasi (menu Pengaturan -> Sync)
 * 
 * Sheet akan otomatis dibuat saat sync pertama kali.
 */

// ====== KONFIGURASI ======
const SHARED_TOKEN = 'pokjawas-jember-ripyplc3rgxznowd'; // ⚠️ Token sync (must match aplikasi). Setelah edit, redeploy version baru.
const SHEET_NAME_INDEX = 'INDEX_MADRASAH';
const SHEET_NAME_RAW = 'DATA_RAW';

// Daftar koleksi yang disinkronkan
const COLLECTIONS = [
  'madrasah', 'guru', 'kelas', 'murid',
  'jurnalHarian', 'pembiasaanHarian', 'observasiKarakter', 'observasi',
  'eviden', 'validasi', 'perencanaan'
];

const SHEET_NAME_KODE = 'KODE_AKTIVASI';
const KODE_HEADERS = ['id', 'kode', 'role', 'deskripsi', 'dibuatOleh', 'dibuatTanggal', 'digunakan', 'digunakanOleh', 'digunakanOlehUsername', 'digunakanTanggal'];

// ====== HANDLER ======
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // Auth check
    if (!body.token || body.token !== SHARED_TOKEN) {
      return _json({ ok: false, error: 'Token tidak valid' });
    }

    const action = body.action || 'sync';
    if (action === 'sync') return _handleSync(body);
    if (action === 'fetch') return _handleFetch(body);
    if (action === 'list') return _handleList();
    if (action === 'kode-list') return _kodeList();
    if (action === 'kode-create') return _kodeCreate(body);
    if (action === 'kode-claim') return _kodeClaim(body);
    if (action === 'kode-delete') return _kodeDelete(body);
    if (action === 'kode-validate') return _kodeValidate(body);

    return _json({ ok: false, error: 'Action tidak dikenal: ' + action });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  // Untuk health check & fetch dari pengawas
  const params = e.parameter || {};
  if (params.token !== SHARED_TOKEN) {
    return _json({ ok: false, error: 'Token tidak valid' });
  }
  if (params.action === 'fetch') {
    return _handleFetch({ madrasahId: params.madrasahId, all: params.all === '1' });
  }
  if (params.action === 'list') return _handleList();
  if (params.action === 'kode-list') return _kodeList();
  if (params.action === 'kode-validate') return _kodeValidate({ kode: params.kode });
  return _json({ ok: true, message: 'SiJurnal Cinta Guru Sync Endpoint aktif' });
}

// ====== SYNC ======
function _handleSync(body) {
  const ss = _getSpreadsheet();
  const now = new Date();
  const madrasahId = body.madrasahId || 'default';
  const madrasahNama = body.madrasahNama || '-';
  const senderRole = body.senderRole || '-';
  const senderNama = body.senderNama || '-';
  const data = body.data || {};

  // Tulis ke index
  let idx = ss.getSheetByName(SHEET_NAME_INDEX);
  if (!idx) {
    idx = ss.insertSheet(SHEET_NAME_INDEX);
    idx.appendRow(['Madrasah ID', 'Nama Madrasah', 'Pengirim', 'Role', 'Terakhir Sync', 'Total Jurnal', 'Total Pembiasaan', 'Total Observasi', 'Total Murid', 'Total Guru']);
    idx.getRange('A1:J1').setBackground('#102a4d').setFontColor('#ffffff').setFontWeight('bold');
  }

  // Update atau insert row index
  const idxData = idx.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < idxData.length; i++) {
    if (idxData[i][0] === madrasahId) { rowIdx = i + 1; break; }
  }
  const rowVal = [
    madrasahId, madrasahNama, senderNama, senderRole,
    Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss'),
    (data.jurnalHarian || []).length,
    (data.pembiasaanHarian || []).length,
    (data.observasiKarakter || []).length,
    (data.murid || []).length,
    (data.guru || []).length
  ];
  if (rowIdx > 0) idx.getRange(rowIdx, 1, 1, rowVal.length).setValues([rowVal]);
  else idx.appendRow(rowVal);

  // Tulis raw data per koleksi (sheet per koleksi, baris per item, prefix madrasahId)
  COLLECTIONS.forEach(col => {
    const items = data[col];
    if (!Array.isArray(items)) return;
    let sheet = ss.getSheetByName(col);
    if (!sheet) {
      sheet = ss.insertSheet(col);
      // Header otomatis dari kunci item pertama jika ada
      const headers = ['_madrasahId', '_madrasahNama', '_syncedAt', ...(items[0] ? Object.keys(items[0]) : [])];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#2fa295').setFontColor('#ffffff').setFontWeight('bold');
    }

    // Hapus baris lama madrasah ini
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    const rowsToDelete = [];
    for (let i = sheetData.length - 1; i >= 1; i--) {
      if (sheetData[i][0] === madrasahId) rowsToDelete.push(i + 1);
    }
    rowsToDelete.forEach(r => sheet.deleteRow(r));

    // Append baris baru
    if (items.length > 0) {
      const rows = items.map(item => {
        return headers.map(h => {
          if (h === '_madrasahId') return madrasahId;
          if (h === '_madrasahNama') return madrasahNama;
          if (h === '_syncedAt') return Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
          const v = item[h];
          if (v === null || v === undefined) return '';
          if (typeof v === 'object') return JSON.stringify(v);
          return v;
        });
      });
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    }
  });

  // Log raw payload (opsional, untuk debugging)
  let raw = ss.getSheetByName(SHEET_NAME_RAW);
  if (!raw) {
    raw = ss.insertSheet(SHEET_NAME_RAW);
    raw.appendRow(['Timestamp', 'Madrasah ID', 'Pengirim', 'Size (KB)']);
    raw.getRange('A1:D1').setBackground('#eecb59').setFontColor('#102a4d').setFontWeight('bold');
  }
  raw.appendRow([
    Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss'),
    madrasahId, senderNama,
    Math.round(JSON.stringify(body).length / 1024 * 100) / 100
  ]);

  return _json({ ok: true, message: 'Sync berhasil', timestamp: now.toISOString() });
}

// ====== FETCH (untuk pengawas viewer) ======
function _handleFetch(params) {
  const ss = _getSpreadsheet();
  const result = {};
  COLLECTIONS.forEach(col => {
    const sheet = ss.getSheetByName(col);
    if (!sheet) { result[col] = []; return; }
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) { result[col] = []; return; }
    const headers = rows[0];
    const items = rows.slice(1)
      .filter(r => !params.madrasahId || params.all || r[0] === params.madrasahId)
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i]; });
        return obj;
      });
    result[col] = items;
  });
  return _json({ ok: true, data: result, fetchedAt: new Date().toISOString() });
}

function _handleList() {
  const ss = _getSpreadsheet();
  const idx = ss.getSheetByName(SHEET_NAME_INDEX);
  if (!idx) return _json({ ok: true, madrasah: [] });
  const rows = idx.getDataRange().getValues();
  if (rows.length < 2) return _json({ ok: true, madrasah: [] });
  const headers = rows[0];
  const list = rows.slice(1).map(r => {
    const o = {};
    headers.forEach((h, i) => { o[h] = r[i]; });
    return o;
  });
  return _json({ ok: true, madrasah: list });
}

// ====== UTIL ======
function _getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* ignore, buat baru */ }
  }
  const ss = SpreadsheetApp.create('SiJurnal Cinta Guru - Data Pokjawas');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====== TEST (jalankan manual untuk inisialisasi) ======
function setup() {
  const ss = _getSpreadsheet();
  Logger.log('Spreadsheet siap: ' + ss.getUrl());
  Logger.log('ID: ' + ss.getId());
}

function getSpreadsheetUrl() {
  const ss = _getSpreadsheet();
  return ss.getUrl();
}

// ====== KODE AKTIVASI (multi-device) ======
function _kodeSheet() {
  const ss = _getSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME_KODE);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME_KODE);
    sh.appendRow(KODE_HEADERS);
    sh.getRange(1, 1, 1, KODE_HEADERS.length).setBackground('#eecb59').setFontColor('#102a4d').setFontWeight('bold');
  }
  return sh;
}

function _kodeRows() {
  const sh = _kodeSheet();
  const rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  const headers = rng[0];
  return rng.slice(1).map((r, idx) => {
    const o = { _row: idx + 2 };
    headers.forEach((h, i) => { o[h] = r[i]; });
    return o;
  });
}

function _kodeList() {
  const items = _kodeRows().map(o => {
    delete o._row;
    o.digunakan = o.digunakan === true || o.digunakan === 'TRUE' || o.digunakan === 'true' || o.digunakan === 1;
    return o;
  });
  return _json({ ok: true, kode: items });
}

function _kodeCreate(body) {
  const items = Array.isArray(body.items) ? body.items : (body.item ? [body.item] : []);
  if (items.length === 0) return _json({ ok: false, error: 'items kosong' });
  const sh = _kodeSheet();
  const existing = new Set(_kodeRows().map(r => String(r.kode).trim().toUpperCase()));
  const rows = [];
  const created = [];
  items.forEach(it => {
    const k = String(it.kode || '').trim().toUpperCase();
    if (!k) return;
    if (existing.has(k)) return; // skip duplicate
    existing.add(k);
    const row = KODE_HEADERS.map(h => {
      if (h === 'kode') return k;
      if (h === 'digunakan') return it.digunakan ? true : false;
      const v = it[h];
      if (v === null || v === undefined) return '';
      return v;
    });
    rows.push(row);
    created.push(it);
  });
  if (rows.length > 0) {
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, KODE_HEADERS.length).setValues(rows);
  }
  return _json({ ok: true, created: created.length });
}

function _kodeValidate(body) {
  const k = String(body.kode || '').trim().toUpperCase();
  if (!k) return _json({ ok: false, reason: 'Kode wajib diisi' });
  const found = _kodeRows().find(r => String(r.kode).trim().toUpperCase() === k);
  if (!found) return _json({ ok: false, reason: 'Kode aktivasi tidak ditemukan' });
  const used = found.digunakan === true || found.digunakan === 'TRUE' || found.digunakan === 'true' || found.digunakan === 1;
  if (used) return _json({ ok: false, reason: 'Kode aktivasi sudah pernah digunakan' });
  return _json({ ok: true, kode: { kode: found.kode, role: found.role, deskripsi: found.deskripsi } });
}

function _kodeClaim(body) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) return _json({ ok: false, reason: 'Server sibuk, coba lagi' });
  try {
    const k = String(body.kode || '').trim().toUpperCase();
    if (!k) return _json({ ok: false, reason: 'Kode wajib diisi' });
    const sh = _kodeSheet();
    const rows = _kodeRows();
    const found = rows.find(r => String(r.kode).trim().toUpperCase() === k);
    if (!found) return _json({ ok: false, reason: 'Kode aktivasi tidak ditemukan' });
    const used = found.digunakan === true || found.digunakan === 'TRUE' || found.digunakan === 'true' || found.digunakan === 1;
    if (used) return _json({ ok: false, reason: 'Kode aktivasi sudah pernah digunakan' });
    const userId = body.userId || '';
    const username = body.username || '';
    const ts = Date.now();
    const colDigunakan = KODE_HEADERS.indexOf('digunakan') + 1;
    const colOleh = KODE_HEADERS.indexOf('digunakanOleh') + 1;
    const colUsername = KODE_HEADERS.indexOf('digunakanOlehUsername') + 1;
    const colTanggal = KODE_HEADERS.indexOf('digunakanTanggal') + 1;
    sh.getRange(found._row, colDigunakan).setValue(true);
    sh.getRange(found._row, colOleh).setValue(userId);
    sh.getRange(found._row, colUsername).setValue(username);
    sh.getRange(found._row, colTanggal).setValue(ts);
    return _json({ ok: true, kode: { kode: found.kode, role: found.role, deskripsi: found.deskripsi } });
  } catch (err) {
    return _json({ ok: false, reason: 'Gagal claim: ' + err });
  } finally {
    lock.releaseLock();
  }
}

function _kodeDelete(body) {
  const id = String(body.id || '').trim();
  if (!id) return _json({ ok: false, error: 'id wajib diisi' });
  const sh = _kodeSheet();
  const rows = _kodeRows();
  const found = rows.find(r => String(r.id) === id);
  if (!found) return _json({ ok: false, error: 'Tidak ditemukan' });
  const used = found.digunakan === true || found.digunakan === 'TRUE' || found.digunakan === 'true' || found.digunakan === 1;
  if (used) return _json({ ok: false, error: 'Kode yang sudah dipakai tidak bisa dihapus' });
  sh.deleteRow(found._row);
  return _json({ ok: true });
}
