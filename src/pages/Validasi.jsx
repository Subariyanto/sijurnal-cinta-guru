import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, addItem, updateItem, generateId, formatDate, getKategoriSkor, BOBOT_VALIDASI } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Search, Eye, CheckCircle, X, Save } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

const STATUS_COLORS = {
  'Disetujui': 'bg-green-100 text-green-700',
  'Dikirim': 'bg-yellow-100 text-yellow-700',
  'Perlu Revisi': 'bg-red-100 text-red-700',
  'Ditolak': 'bg-red-100 text-red-700',
  'Draft': 'bg-gray-100 text-gray-700',
};

const KATEGORI_COLORS = {
  'Sangat Baik': 'bg-green-100 text-green-700',
  'Baik': 'bg-blue-100 text-blue-700',
  'Mulai Berkembang': 'bg-yellow-100 text-yellow-700',
  'Perlu Pendampingan': 'bg-red-100 text-red-700',
};

const RUBRIK_LABELS = {
  kesesuaianRencana: 'Kesesuaian dengan Rencana',
  pelaksanaanPancaCinta: 'Pelaksanaan Panca Cinta',
  buktiEviden: 'Bukti Eviden',
  dampakSiswa: 'Dampak ke Siswa',
  refleksiGuru: 'Refleksi Guru',
  kelengkapan: 'Kelengkapan Jurnal',
};

export default function Validasi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jurnal, setJurnal] = useState(getData().jurnalHarian);
  const [validasi, setValidasi] = useState(getData().validasi);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedJurnal, setSelectedJurnal] = useState(null);

  let filtered = jurnal.filter(j => ['Dikirim','Perlu Revisi','Disetujui'].includes(j.status));
  if (user.role === 'kamad') filtered = filtered.filter(j => j.madrasahId === user.madrasahId);
  if (search) filtered = filtered.filter(j => `${j.guruNama} ${j.mapel} ${j.materi}`.toLowerCase().includes(search.toLowerCase()));

  const existingValidasi = (jurnalId) => validasi.find(v => v.jurnalId === jurnalId);

  const refresh = () => {
    setJurnal(getData().jurnalHarian);
    setValidasi(getData().validasi);
  };

  const openValidasi = (j) => { setSelectedJurnal(j); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-800">Validasi Kepala/Pengawas</h2><p className="text-sm text-gray-500">Tinjau dan validasi jurnal pembelajaran guru</p></div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari jurnal..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(j => {
          const v = existingValidasi(j.id);
          return (
            <div key={j.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{j.guruNama}</span>
                    {j.mapel && <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{j.mapel}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[j.status]||STATUS_COLORS.Draft}`}>{j.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(j.tanggal)} • {j.kelasNama} • {j.madrasahNama}</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{j.materi}</p>
                  {v && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500">Total skor:</span>
                        <span className="font-semibold text-gray-800">{v.totalSkor}</span>
                        <span className={`px-2 py-0.5 rounded-full ${KATEGORI_COLORS[v.kategori]||''}`}>{v.kategori}</span>
                      </div>
                      <p className="text-gray-500 mt-1">Validator: {v.validatorNama} • {formatDate(v.tanggal)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                <button onClick={()=>navigate(`/jurnal/${j.id}`)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"><Eye className="w-3 h-3"/>Detail</button>
                <button onClick={()=>openValidasi(j)} className="px-3 py-1.5 text-xs bg-[#102a4d] text-white hover:bg-[#0a1f3b] rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3"/>{v?'Edit Validasi':'Validasi'}</button>
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <p className="col-span-full text-center text-gray-400 py-8">Tidak ada jurnal untuk divalidasi</p>}
      </div>

      {showForm && selectedJurnal && (
        <ValidasiForm
          jurnal={selectedJurnal}
          existing={existingValidasi(selectedJurnal.id)}
          user={user}
          onClose={()=>{ setShowForm(false); setSelectedJurnal(null); }}
          onSave={()=>{ refresh(); setShowForm(false); setSelectedJurnal(null); }}
        />
      )}
    </div>
  );
}

function ValidasiForm({ jurnal, existing, user, onClose, onSave }) {
  const today = new Date().toISOString().slice(0,10);
  const defaultSkor = Object.fromEntries(Object.entries(BOBOT_VALIDASI).map(([k,v])=>[k, Math.round(v*0.8)]));

  const [form, setForm] = useState(() => existing ? { ...existing } : {
    jurnalId: jurnal.id,
    validatorNama: user.nama || '',
    validatorRole: user.role || '',
    validatorId: user.id || '',
    tanggal: today,
    skor: defaultSkor,
    catatanApresiasi: '',
    catatanPerbaikan: '',
    rekomendasi: '',
    status: 'Disetujui',
  });

  const fSkor = (key, raw) => {
    const max = BOBOT_VALIDASI[key];
    let n = Number(raw);
    if (Number.isNaN(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    setForm({ ...form, skor: { ...form.skor, [key]: n } });
  };

  const totalSkor = Object.values(form.skor||{}).reduce((a,b)=>a+(Number(b)||0), 0);
  const kategori = getKategoriSkor(totalSkor);

  const save = () => {
    const payload = { ...form, totalSkor, kategori };
    if (existing) {
      updateItem('validasi', existing.id, payload);
    } else {
      addItem('validasi', { ...payload, id: generateId() });
    }
    updateItem('jurnalHarian', jurnal.id, { status: form.status === 'Ditolak' ? 'Perlu Revisi' : form.status });
    showToast('Validasi disimpan','success');
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold">Form Validasi Jurnal</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold">{jurnal.guruNama}</span>{jurnal.mapel && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{jurnal.mapel}</span>}<span className="text-gray-500 text-xs">{jurnal.kelasNama} • {formatDate(jurnal.tanggal)}</span></div>
            <p className="text-gray-700"><span className="font-medium">Materi:</span> {jurnal.materi}</p>
            {jurnal.narasiKBC && <p className="text-gray-600 text-xs"><span className="font-medium">Narasi KBC:</span> {jurnal.narasiKBC}</p>}
            {(jurnal.pancaCinta||[]).length>0 && <div className="flex flex-wrap gap-1 pt-1">{jurnal.pancaCinta.map(pc=><span key={pc} className="px-2 py-0.5 bg-[#eecb59]/20 text-[#102a4d] rounded-full text-xs">{pc}</span>)}</div>}
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Rubrik Penilaian</h4>
            <div className="space-y-2">
              {Object.entries(BOBOT_VALIDASI).map(([k, max]) => (
                <div key={k} className="grid grid-cols-12 gap-2 items-center">
                  <label className="col-span-7 text-sm text-gray-700">{RUBRIK_LABELS[k]||k}</label>
                  <span className="col-span-2 text-xs text-gray-500 text-right">Maks {max}</span>
                  <input type="number" min={0} max={max} value={form.skor?.[k] ?? 0} onChange={e=>fSkor(k, e.target.value)} className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-700">Total Skor:</span>
            <span className="text-xl font-bold text-[#102a4d]">{totalSkor}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${KATEGORI_COLORS[kategori]||''}`}>{kategori}</span>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-gray-700">Status:</label>
              <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="Disetujui">Disetujui</option>
                <option value="Perlu Revisi">Perlu Revisi</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan Apresiasi</label><textarea value={form.catatanApresiasi||''} onChange={e=>setForm({...form,catatanApresiasi:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan Perbaikan</label><textarea value={form.catatanPerbaikan||''} onChange={e=>setForm({...form,catatanPerbaikan:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi Tindak Lanjut</label><textarea value={form.rekomendasi||''} onChange={e=>setForm({...form,rekomendasi:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        </div>
        <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white">
          <button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan Validasi</button>
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button>
        </div>
      </div>
    </div>
  );
}
