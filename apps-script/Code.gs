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
const SHARED_TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA_ANDA'; // ⚠️ Ganti dengan token rahasia (dipakai oleh app saat sync). Setelah edit, redeploy version baru.
const SHEET_NAME_INDEX = 'INDEX_MADRASAH';
const SHEET_NAME_RAW = 'DATA_RAW';

// Daftar koleksi yang disinkronkan
const COLLECTIONS = [
  'madrasah', 'guru', 'kelas', 'murid',
  'jurnalHarian', 'pembiasaanHarian', 'observasiKarakter', 'observasi',
  'eviden', 'validasi', 'perencanaan'
];

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
