// src/lib/csv.js
// Lightweight CSV helpers untuk Template / Import / Export Master Data.
// Format: UTF-8 BOM + comma separator. Aman dibuka di Excel.

const BOM = '\uFEFF';

function escapeCSV(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function buildCSV(headers, rows) {
  const head = headers.map(escapeCSV).join(',');
  const body = rows
    .map((r) => headers.map((h) => escapeCSV(r[h] !== undefined ? r[h] : '')).join(','))
    .join('\n');
  return BOM + head + '\n' + body;
}

export function downloadCSV(filename, headers, rows) {
  const csv = buildCSV(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 100);
}

// Template = CSV dengan header + 1-2 baris contoh.
export function downloadTemplate(filename, headers, sampleRows = []) {
  downloadCSV(filename, headers, sampleRows);
}

// Parser CSV yang handle quoted values + escaped quotes ("").
export function parseCSV(text) {
  // Strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let row = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else { inQuote = false; }
      } else cur += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows
    .slice(1)
    .filter((r) => r.some((v) => v && v.trim().length > 0))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] !== undefined ? r[idx] : '').trim(); });
      return obj;
    });
  return { headers, rows: dataRows };
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}
