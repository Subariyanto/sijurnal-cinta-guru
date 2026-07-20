import React, { useState, useMemo } from 'react';
import { getData, addItem, updateItem, deleteItem, generateId, formatDate, TAHAPAN_PEMBIASAAN, TOTAL_KEGIATAN_HARIAN, getKategoriPembiasaan, BULAN_NAMA, getDaysInMonth } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Plus, Search, Edit, Trash2, Eye, Printer, Save, X, CheckSquare, Square, Calendar, FileText, Send } from 'lucide-react';

function showToast(msg, type) {
  const el = document.createElement('div');
  el.className = `fixed bottom-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-[#102a4d]'}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

const STATUS_COLORS = {
  'Disetujui': 'bg-green-100 text-green-700',
  'Dikirim': 'bg-yellow-100 text-yellow-700',
  'Perlu Revisi': 'bg-red-100 text-red-700',
  'Draft': 'bg-gray-100 text-gray-700',
};

const KATEGORI_COLORS = {
  'Sangat Konsisten': 'bg-green-100 text-green-700 border-green-200',
  'Konsisten': 'bg-blue-100 text-blue-700 border-blue-200',
  'Mulai Konsisten': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Perlu Pembiasaan': 'bg-red-100 text-red-700 border-red-200',
};

function calculateChecklistStats(checklist, daysInMonth) {
  let total = 0, checked = 0;
  TAHAPAN_PEMBIASAAN.forEach(t => {
    t.kegiatan.forEach((_, kIdx) => {
      for (let d = 1; d <= daysInMonth; d++) {
        total++;
        if (checklist?.[t.id]?.[kIdx]?.[d]) checked++;
      }
    });
  });
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  return { total, checked, pct, kategori: getKategoriPembiasaan(pct) };
}

function buildEmptyChecklist() {
  const c = {};
  TAHAPAN_PEMBIASAAN.forEach(t => {
    c[t.id] = {};
    t.kegiatan.forEach((_, kIdx) => {
      c[t.id][kIdx] = {};
    });
  });
  return c;
}

export default function PembiasaanHarian() {
  const { user } = useAuth();
  const [list, setList] = useState(getData().pembiasaanHarian);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentJurnal, setCurrentJurnal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [editorTab, setEditorTab] = useState('checklist');
  const [newJurnal, setNewJurnal] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    semester: 'Ganjil',
    tahunPelajaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    madrasahId: user?.madrasahId || '',
    kelasId: '',
    guruId: user?.guruId || '',
  });

  const refData = useMemo(() => getData(), [list, viewMode]);
  const guruList = refData.guru;
  const madrasahList = refData.madrasah;
  const kelasList = refData.kelas;

  let filtered = list;
  if (user?.role === 'guru') filtered = filtered.filter(j => j.guruId === user.guruId);
  else if (user?.role === 'kamad') filtered = filtered.filter(j => j.madrasahId === user.madrasahId);
  if (filterStatus) filtered = filtered.filter(j => j.status === filterStatus);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(j => `${j.guruNama || ''} ${BULAN_NAMA[(j.bulan || 1) - 1] || ''} ${j.tahun || ''}`.toLowerCase().includes(q));
  }

  const refresh = () => setList(getData().pembiasaanHarian);

  const openNewJurnalModal = () => {
    setNewJurnal({
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      semester: 'Ganjil',
      tahunPelajaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      madrasahId: user?.madrasahId || (madrasahList[0]?.id || ''),
      kelasId: '',
      guruId: user?.guruId || (guruList[0]?.id || ''),
    });
    setShowForm(true);
  };

  const saveNewJurnal = () => {
    if (!newJurnal.bulan || !newJurnal.tahun) return showToast('Bulan dan tahun wajib diisi', 'error');
    if (!newJurnal.guruId) return showToast('Guru wajib dipilih', 'error');
    if (!newJurnal.madrasahId) return showToast('Madrasah wajib dipilih', 'error');

    const exists = list.find(j => j.guruId === newJurnal.guruId && Number(j.bulan) === Number(newJurnal.bulan) && Number(j.tahun) === Number(newJurnal.tahun));
    if (exists) return showToast('Jurnal bulan tersebut sudah ada untuk guru ini', 'error');

    const g = guruList.find(x => x.id === newJurnal.guruId);
    const m = madrasahList.find(x => x.id === newJurnal.madrasahId);
    const k = kelasList.find(x => x.id === newJurnal.kelasId);

    const item = {
      id: generateId(),
      guruId: newJurnal.guruId,
      guruNama: g?.nama || '',
      madrasahId: newJurnal.madrasahId,
      madrasahNama: m?.nama || '',
      kelasId: newJurnal.kelasId || '',
      kelasNama: k?.nama || '',
      bulan: Number(newJurnal.bulan),
      tahun: Number(newJurnal.tahun),
      semester: newJurnal.semester,
      tahunPelajaran: newJurnal.tahunPelajaran,
      status: 'Draft',
      checklist: buildEmptyChecklist(),
      catatanKegiatan: {},
      refleksi: [],
      createdAt: new Date().toISOString(),
    };
    addItem('pembiasaanHarian', item);
    refresh();
    setShowForm(false);
    showToast('Jurnal pembiasaan dibuat', 'success');
    openEditor(item);
  };

  const openEditor = (jurnal) => {
    const fresh = getData().pembiasaanHarian.find(x => x.id === jurnal.id) || jurnal;
    if (!fresh.checklist) fresh.checklist = buildEmptyChecklist();
    if (!fresh.catatanKegiatan) fresh.catatanKegiatan = {};
    if (!fresh.refleksi) fresh.refleksi = [];
    setCurrentJurnal(fresh);
    setEditingId(fresh.id);
    setEditorTab('checklist');
    setViewMode('editor');
  };

  const backToList = () => {
    setViewMode('list');
    setCurrentJurnal(null);
    setEditingId(null);
    refresh();
  };

  const toggleCell = (tahapanId, kIdx, day) => {
    setCurrentJurnal(prev => {
      const next = { ...prev };
      const cl = { ...(next.checklist || {}) };
      const tahapanCl = { ...(cl[tahapanId] || {}) };
      const kegiatanCl = { ...(tahapanCl[kIdx] || {}) };
      kegiatanCl[day] = !kegiatanCl[day];
      if (!kegiatanCl[day]) delete kegiatanCl[day];
      tahapanCl[kIdx] = kegiatanCl;
      cl[tahapanId] = tahapanCl;
      next.checklist = cl;
      return next;
    });
  };

  const setCatatan = (tahapanId, kIdx, val) => {
    setCurrentJurnal(prev => {
      const next = { ...prev };
      const cat = { ...(next.catatanKegiatan || {}) };
      const tCat = { ...(cat[tahapanId] || {}) };
      tCat[kIdx] = val;
      cat[tahapanId] = tCat;
      next.catatanKegiatan = cat;
      return next;
    });
  };

  const checkAllForDay = (day, value) => {
    setCurrentJurnal(prev => {
      const next = { ...prev };
      const cl = { ...(next.checklist || {}) };
      TAHAPAN_PEMBIASAAN.forEach(t => {
        const tahapanCl = { ...(cl[t.id] || {}) };
        t.kegiatan.forEach((_, kIdx) => {
          const kegiatanCl = { ...(tahapanCl[kIdx] || {}) };
          if (value) kegiatanCl[day] = true;
          else delete kegiatanCl[day];
          tahapanCl[kIdx] = kegiatanCl;
        });
        cl[t.id] = tahapanCl;
      });
      next.checklist = cl;
      return next;
    });
  };

  const saveJurnal = (status) => {
    if (!currentJurnal) return;
    const payload = { ...currentJurnal, status: status || currentJurnal.status, updatedAt: new Date().toISOString() };
    updateItem('pembiasaanHarian', currentJurnal.id, payload);
    setCurrentJurnal(payload);
    refresh();
    showToast(status === 'Dikirim' ? 'Jurnal dikirim untuk validasi' : 'Jurnal disimpan', 'success');
  };

  const del = (id) => {
    if (!confirm('Hapus jurnal pembiasaan ini?')) return;
    deleteItem('pembiasaanHarian', id);
    refresh();
    showToast('Jurnal dihapus', 'success');
  };

  const printJurnal = (jurnal) => {
    if (jurnal && jurnal.id !== currentJurnal?.id) openEditor(jurnal);
    setTimeout(() => window.print(), 200);
  };

  const addRefleksi = () => {
    setCurrentJurnal(prev => ({
      ...prev,
      refleksi: [...(prev.refleksi || []), { id: generateId(), tanggal: '', kejadian: '', refleksi: '', tindakLanjut: '', eviden: '' }],
    }));
  };

  const updateRefleksi = (id, field, value) => {
    setCurrentJurnal(prev => ({
      ...prev,
      refleksi: (prev.refleksi || []).map(r => r.id === id ? { ...r, [field]: value } : r),
    }));
  };

  const delRefleksi = (id) => {
    setCurrentJurnal(prev => ({
      ...prev,
      refleksi: (prev.refleksi || []).filter(r => r.id !== id),
    }));
  };

  // ============================================================
  // EDITOR VIEW
  // ============================================================
  if (viewMode === 'editor' && currentJurnal) {
    const daysInMonth = getDaysInMonth(currentJurnal.tahun, currentJurnal.bulan);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const stats = calculateChecklistStats(currentJurnal.checklist || {}, daysInMonth);
    const totalHarusan = TOTAL_KEGIATAN_HARIAN * daysInMonth;

    return (
      <div className="space-y-4 print-area">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
          <button onClick={backToList} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2">
            <X className="w-4 h-4" /> Kembali ke daftar
          </button>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => printJurnal()} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2">
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button onClick={() => saveJurnal()} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 font-medium">
              <Save className="w-4 h-4" /> Simpan
            </button>
            <button onClick={() => saveJurnal('Dikirim')} className="px-4 py-2 text-sm bg-[#102a4d] hover:bg-[#0a1f3b] text-white rounded-lg flex items-center gap-2 font-medium">
              <Send className="w-4 h-4" /> Kirim Validasi
            </button>
          </div>
        </div>

        {/* Identitas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold text-[#102a4d]">Jurnal Pembiasaan Harian Guru Berbasis Cinta</h2>
              <p className="text-xs text-gray-500">Implementasi 7 tahapan pembiasaan harian</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[currentJurnal.status] || STATUS_COLORS.Draft}`}>{currentJurnal.status || 'Draft'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500 block text-xs">Guru</span><span className="font-medium text-gray-800">{currentJurnal.guruNama || '-'}</span></div>
            <div><span className="text-gray-500 block text-xs">Madrasah</span><span className="font-medium text-gray-800">{currentJurnal.madrasahNama || '-'}</span></div>
            <div><span className="text-gray-500 block text-xs">Kelas</span><span className="font-medium text-gray-800">{currentJurnal.kelasNama || '-'}</span></div>
            <div><span className="text-gray-500 block text-xs">Bulan / Tahun</span><span className="font-medium text-gray-800">{BULAN_NAMA[(currentJurnal.bulan || 1) - 1]} {currentJurnal.tahun}</span></div>
            <div><span className="text-gray-500 block text-xs">Semester</span><span className="font-medium text-gray-800">{currentJurnal.semester || '-'}</span></div>
            <div><span className="text-gray-500 block text-xs">Tahun Pelajaran</span><span className="font-medium text-gray-800">{currentJurnal.tahunPelajaran || '-'}</span></div>
            <div><span className="text-gray-500 block text-xs">Jumlah Hari</span><span className="font-medium text-gray-800">{daysInMonth} hari</span></div>
            <div><span className="text-gray-500 block text-xs">Total Kegiatan/Hari</span><span className="font-medium text-gray-800">{TOTAL_KEGIATAN_HARIAN}</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 print:hidden">
          <button onClick={() => setEditorTab('checklist')} className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${editorTab === 'checklist' ? 'border-[#102a4d] text-[#102a4d]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <CheckSquare className="w-4 h-4" /> Checklist Bulanan
          </button>
          <button onClick={() => setEditorTab('refleksi')} className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${editorTab === 'refleksi' ? 'border-[#102a4d] text-[#102a4d]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FileText className="w-4 h-4" /> Catatan Refleksi
          </button>
        </div>

        {/* CHECKLIST TAB */}
        {editorTab === 'checklist' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-[#102a4d] text-white">
                    <tr>
                      <th className="sticky left-0 bg-[#102a4d] z-20 px-2 py-2 text-center w-10 border-r border-[#0a1f3b]">No</th>
                      <th className="sticky left-10 bg-[#102a4d] z-20 px-2 py-2 text-left w-32 border-r border-[#0a1f3b]">Tahapan</th>
                      <th className="px-2 py-2 text-left w-40 border-r border-[#0a1f3b]">Nilai Cinta</th>
                      <th className="px-2 py-2 text-left w-48 border-r border-[#0a1f3b]">Tujuan</th>
                      <th className="px-2 py-2 text-left w-64 border-r border-[#0a1f3b]">Uraian Kegiatan</th>
                      {days.map(d => (
                        <th key={d} className="px-1 py-1 text-center min-w-[40px] border-r border-[#0a1f3b]">
                          <div className="font-semibold">{d}</div>
                          <div className="flex flex-col gap-0.5 mt-1 print:hidden">
                            <button title="Centang semua hari ini" onClick={() => checkAllForDay(d, true)} className="text-[10px] hover:bg-white/20 rounded px-0.5">
                              <CheckSquare className="w-3 h-3 mx-auto" />
                            </button>
                            <button title="Kosongkan hari ini" onClick={() => checkAllForDay(d, false)} className="text-[10px] hover:bg-white/20 rounded px-0.5">
                              <Square className="w-3 h-3 mx-auto" />
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center w-16 border-r border-[#0a1f3b]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAHAPAN_PEMBIASAAN.map((tahapan, tIdx) => (
                      <React.Fragment key={tahapan.id}>
                        <tr className="bg-[#eecb59]/15">
                          <td colSpan={5 + days.length + 1} className="px-3 py-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-[#102a4d] text-white text-[10px] font-bold">{tahapan.no}</span>
                              <span className="font-semibold text-[#102a4d] text-sm">{tahapan.nama}</span>
                              <div className="flex gap-1 flex-wrap">
                                {tahapan.nilaiCinta.map(nc => (
                                  <span key={nc} className="px-1.5 py-0.5 rounded-full bg-[#2fa295]/15 text-[#2fa295] text-[10px] font-medium">{nc}</span>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                        {tahapan.kegiatan.map((kegiatan, kIdx) => {
                          const rowChecked = days.reduce((acc, d) => acc + (currentJurnal.checklist?.[tahapan.id]?.[kIdx]?.[d] ? 1 : 0), 0);
                          return (
                            <React.Fragment key={`${tahapan.id}-${kIdx}`}>
                              <tr className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="sticky left-0 bg-white z-10 px-2 py-2 text-center text-gray-500 border-r border-gray-100">{kIdx + 1}</td>
                                <td className="sticky left-10 bg-white z-10 px-2 py-2 border-r border-gray-100 align-top">
                                  <span className="text-[11px] text-gray-700 font-medium">{tahapan.nama.split(' / ')[0]}</span>
                                </td>
                                <td className="px-2 py-2 border-r border-gray-100 align-top">
                                  <div className="flex flex-wrap gap-1">
                                    {tahapan.nilaiCinta.map(nc => (
                                      <span key={nc} className="text-[10px] text-[#2fa295]">{nc}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-2 py-2 border-r border-gray-100 align-top">
                                  <span className="text-[11px] text-gray-600 line-clamp-3" title={tahapan.tujuan}>{tahapan.tujuan}</span>
                                </td>
                                <td className="px-2 py-2 border-r border-gray-100 align-top">
                                  <span className="text-[11px] text-gray-700">{kegiatan}</span>
                                </td>
                                {days.map(d => {
                                  const checked = !!currentJurnal.checklist?.[tahapan.id]?.[kIdx]?.[d];
                                  return (
                                    <td key={d} className="px-1 py-1 text-center border-r border-gray-100">
                                      <button
                                        type="button"
                                        onClick={() => toggleCell(tahapan.id, kIdx, d)}
                                        className={`w-6 h-6 rounded border transition flex items-center justify-center ${checked ? 'bg-[#2fa295] border-[#2fa295] text-white' : 'bg-white border-gray-300 hover:border-[#102a4d]'}`}
                                      >
                                        {checked && <CheckSquare className="w-4 h-4" />}
                                      </button>
                                    </td>
                                  );
                                })}
                                <td className="px-2 py-2 text-center border-r border-gray-100 font-semibold text-[#102a4d]">
                                  {rowChecked}/{daysInMonth}
                                </td>
                              </tr>
                              <tr className="bg-gray-50/50 print:hidden">
                                <td colSpan={5} className="px-2 py-1 text-right text-[10px] text-gray-500 italic">Catatan singkat:</td>
                                <td colSpan={days.length + 1} className="px-2 py-1">
                                  <input
                                    type="text"
                                    value={currentJurnal.catatanKegiatan?.[tahapan.id]?.[kIdx] || ''}
                                    onChange={(e) => setCatatan(tahapan.id, kIdx, e.target.value)}
                                    placeholder="Catatan opsional untuk kegiatan ini..."
                                    className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded focus:ring-1 focus:ring-[#102a4d] outline-none bg-white"
                                  />
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Target Kegiatan Bulan Ini</p>
                  <p className="text-2xl font-bold text-[#102a4d]">{totalHarusan}</p>
                  <p className="text-[10px] text-gray-400">{TOTAL_KEGIATAN_HARIAN} kegiatan × {daysInMonth} hari</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tercentang</p>
                  <p className="text-2xl font-bold text-[#2fa295]">{stats.checked}</p>
                  <p className="text-[10px] text-gray-400">dari {stats.total} kegiatan</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">% Keterlaksanaan</p>
                  <p className="text-2xl font-bold text-[#102a4d]">{stats.pct}%</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="h-full bg-[#eecb59] transition-all" style={{ width: `${stats.pct}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kategori Pembiasaan</p>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${KATEGORI_COLORS[stats.kategori]}`}>{stats.kategori}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REFLEKSI TAB */}
        {editorTab === 'refleksi' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#102a4d] text-white">
                    <tr>
                      <th className="px-2 py-2 text-center w-12">No</th>
                      <th className="px-2 py-2 text-left w-32">Tanggal</th>
                      <th className="px-2 py-2 text-left">Kejadian</th>
                      <th className="px-2 py-2 text-left">Refleksi</th>
                      <th className="px-2 py-2 text-left">Tindak Lanjut</th>
                      <th className="px-2 py-2 text-left w-40">Eviden</th>
                      <th className="px-2 py-2 text-center w-12 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentJurnal.refleksi || []).map((r, idx) => (
                      <tr key={r.id} className="border-t border-gray-100 align-top">
                        <td className="px-2 py-2 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            type="date"
                            value={r.tanggal || ''}
                            onChange={(e) => updateRefleksi(r.id, 'tanggal', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#102a4d] outline-none"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <textarea
                            value={r.kejadian || ''}
                            onChange={(e) => updateRefleksi(r.id, 'kejadian', e.target.value)}
                            rows={2}
                            placeholder="Kejadian yang terjadi..."
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#102a4d] outline-none resize-y"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <textarea
                            value={r.refleksi || ''}
                            onChange={(e) => updateRefleksi(r.id, 'refleksi', e.target.value)}
                            rows={2}
                            placeholder="Refleksi guru..."
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#102a4d] outline-none resize-y"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <textarea
                            value={r.tindakLanjut || ''}
                            onChange={(e) => updateRefleksi(r.id, 'tindakLanjut', e.target.value)}
                            rows={2}
                            placeholder="Rencana tindak lanjut..."
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#102a4d] outline-none resize-y"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={r.eviden || ''}
                            onChange={(e) => updateRefleksi(r.id, 'eviden', e.target.value)}
                            placeholder="Link/URL eviden"
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#102a4d] outline-none"
                          />
                        </td>
                        <td className="px-2 py-2 text-center print:hidden">
                          <button onClick={() => delRefleksi(r.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(currentJurnal.refleksi || []).length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-400 py-8 text-xs">Belum ada catatan refleksi. Klik tombol di bawah untuk menambah.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <button onClick={addRefleksi} className="px-4 py-2 bg-[#102a4d] hover:bg-[#0a1f3b] text-white rounded-lg text-sm font-medium flex items-center gap-2 print:hidden">
              <Plus className="w-4 h-4" /> Tambah Catatan Refleksi
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // LIST VIEW
  // ============================================================
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Jurnal Pembiasaan Harian Guru</h2>
        <p className="text-sm text-gray-500">Pelaksanaan 7 tahapan pembiasaan harian guru berbasis cinta</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari guru atau bulan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
          <option value="">Semua status</option>
          <option value="Draft">Draft</option>
          <option value="Dikirim">Dikirim</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Perlu Revisi">Perlu Revisi</option>
        </select>
        <button onClick={openNewJurnalModal} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]">
          <Plus className="w-4 h-4" /> Tambah Jurnal Bulan Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(j => {
          const dim = getDaysInMonth(j.tahun, j.bulan);
          const stats = calculateChecklistStats(j.checklist || {}, dim);
          return (
            <div key={j.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{j.guruNama}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {BULAN_NAMA[(j.bulan || 1) - 1]} {j.tahun}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{j.madrasahNama || '-'}{j.kelasNama ? ` • ${j.kelasNama}` : ''}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${STATUS_COLORS[j.status] || STATUS_COLORS.Draft}`}>{j.status || 'Draft'}</span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Keterlaksanaan</span>
                  <span className="font-semibold text-[#102a4d]">{stats.pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-[#eecb59] transition-all" style={{ width: `${stats.pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{stats.checked} / {stats.total} kegiatan</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium border ${KATEGORI_COLORS[stats.kategori]}`}>{stats.kategori}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mt-auto pt-3 border-t border-gray-100">
                <button onClick={() => openEditor(j)} className="flex-1 px-2 py-1.5 text-xs bg-[#102a4d] text-white hover:bg-[#0a1f3b] rounded-lg flex items-center justify-center gap-1 font-medium">
                  <Edit className="w-3 h-3" /> Buka Editor
                </button>
                <button onClick={() => printJurnal(j)} title="Cetak" className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1">
                  <Printer className="w-3 h-3" />
                </button>
                <button onClick={() => del(j.id)} title="Hapus" className="px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12 text-sm">Belum ada jurnal pembiasaan harian. Klik <span className="font-medium text-[#102a4d]">Tambah Jurnal Bulan Baru</span> untuk memulai.</p>
        )}
      </div>

      {/* Modal Tambah Jurnal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-[#102a4d]">Tambah Jurnal Bulan Baru</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                  <select value={newJurnal.bulan} onChange={(e) => setNewJurnal({ ...newJurnal, bulan: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                    {BULAN_NAMA.map((nama, idx) => (
                      <option key={idx} value={idx + 1}>{nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input type="number" value={newJurnal.tahun} onChange={(e) => setNewJurnal({ ...newJurnal, tahun: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select value={newJurnal.semester} onChange={(e) => setNewJurnal({ ...newJurnal, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label>
                  <input type="text" value={newJurnal.tahunPelajaran} onChange={(e) => setNewJurnal({ ...newJurnal, tahunPelajaran: e.target.value })} placeholder="2026/2027" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guru</label>
                <select value={newJurnal.guruId} onChange={(e) => setNewJurnal({ ...newJurnal, guruId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" disabled={user?.role === 'guru'}>
                  <option value="">Pilih guru...</option>
                  {(user?.role === 'guru' ? guruList.filter(g => g.id === user.guruId) : guruList).map(g => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Madrasah</label>
                <select value={newJurnal.madrasahId} onChange={(e) => setNewJurnal({ ...newJurnal, madrasahId: e.target.value, kelasId: '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" disabled={user?.role === 'guru' || user?.role === 'kamad'}>
                  <option value="">Pilih madrasah...</option>
                  {madrasahList.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <select value={newJurnal.kelasId} onChange={(e) => setNewJurnal({ ...newJurnal, kelasId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                  <option value="">Pilih kelas...</option>
                  {kelasList.filter(k => !newJurnal.madrasahId || k.madrasahId === newJurnal.madrasahId).map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white">
              <button onClick={saveNewJurnal} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Buat Jurnal
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
