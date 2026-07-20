import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData, addItem, updateItem, deleteItem, generateId, formatDate, NILAI_PANCA_CINTA, STATUS_JURNAL } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Plus, Search, Edit, Trash2, Eye, Printer, Save, X } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

const STATUS_COLORS = {
  'Disetujui': 'bg-green-100 text-green-700',
  'Dikirim': 'bg-yellow-100 text-yellow-700',
  'Perlu Revisi': 'bg-red-100 text-red-700',
  'Draft': 'bg-gray-100 text-gray-700',
};

export default function JurnalHarian() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [list, setList] = useState(getData().jurnalHarian);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [filterStatus, setFilterStatus] = useState('');

  let filtered = list;
  if (user.role === 'guru') filtered = filtered.filter(j => j.guruId === user.guruId);
  else if (user.role === 'kamad') filtered = filtered.filter(j => j.madrasahId === user.madrasahId);
  if (filterStatus) filtered = filtered.filter(j => j.status === filterStatus);
  if (search) filtered = filtered.filter(j => `${j.guruNama} ${j.mapel} ${j.materi}`.toLowerCase().includes(search.toLowerCase()));

  const guruList = getData().guru.filter(g => !user.guruId || g.id === user.guruId);
  const madrasahList = getData().madrasah;
  const kelasList = getData().kelas;

  useEffect(() => {
    if (location.state?.rencanaId) {
      const r = getData().rencanaKBC.find(x => x.id === location.state.rencanaId);
      if (r) {
        setForm({
          tanggal: r.tanggal || new Date().toISOString().slice(0,10),
          jam: '',
          guruId: r.guruId || '',
          guruNama: r.guruNama || '',
          madrasahId: r.madrasahId || '',
          madrasahNama: r.madrasahNama || '',
          kelasId: r.kelasId || '',
          kelasNama: r.kelasNama || '',
          mapel: r.mapel || '',
          materi: r.materiPokok || '',
          kegiatanPembuka: r.kegiatanPembuka || '',
          kegiatanInti: r.kegiatanInti || '',
          kegiatanPenutup: r.kegiatanPenutup || '',
          pancaCinta: r.pancaCinta || [],
          narasiKBC: '',
          responSiswa: '',
          dampakPositif: '',
          kendala: '',
          solusiGuru: '',
          refleksiGuru: '',
          rencanaTL: '',
          rencanaId: r.id,
          status: 'Draft',
        });
        setShowForm(true);
      }
    }
  }, [location.state]);

  const openAdd = () => {
    setForm({
      tanggal: new Date().toISOString().slice(0,10),
      jam: '',
      guruId: user.guruId||'', guruNama: user.nama||'',
      madrasahId: user.madrasahId||'', madrasahNama: madrasahList.find(m=>m.id===user.madrasahId)?.nama||'',
      kelasId: '', kelasNama: '', mapel: '', materi: '',
      kegiatanPembuka: '', kegiatanInti: '', kegiatanPenutup: '',
      pancaCinta: [], narasiKBC: '', responSiswa: '', dampakPositif: '',
      kendala: '', solusiGuru: '', refleksiGuru: '', rencanaTL: '',
      status: 'Draft',
    });
    setShowForm(true);
  };

  const openEdit = (j) => { setForm(j); setShowForm(true); };

  const save = (status) => {
    if (!form.tanggal || !form.materi) return showToast('Tanggal dan materi wajib diisi','error');
    const g = guruList.find(x => x.id === form.guruId);
    const m = madrasahList.find(x => x.id === form.madrasahId);
    const k = kelasList.find(x => x.id === form.kelasId);
    const payload = { ...form, status, guruNama: g?.nama||form.guruNama, madrasahNama: m?.nama||form.madrasahNama, kelasNama: k?.nama||form.kelasNama };
    if (form.id) { updateItem('jurnalHarian', form.id, payload); showToast('Jurnal diperbarui','success'); }
    else { addItem('jurnalHarian', { ...payload, id: generateId() }); showToast('Jurnal ditambahkan','success'); }
    setList(getData().jurnalHarian); setShowForm(false);
  };

  const del = (id) => { if (!confirm('Hapus jurnal ini?')) return; deleteItem('jurnalHarian', id); setList(getData().jurnalHarian); showToast('Jurnal dihapus','success'); };

  const togglePC = (val) => {
    const cur = form.pancaCinta || [];
    setForm({ ...form, pancaCinta: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] });
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-800">Jurnal Harian Guru</h2><p className="text-sm text-gray-500">Catat pelaksanaan pembelajaran berbasis cinta setiap hari</p></div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari jurnal..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Semua status</option>{STATUS_JURNAL.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(j => (
          <div key={j.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{j.guruNama}</span>
                  {j.mapel && <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{j.mapel}</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[j.status]||STATUS_COLORS.Draft}`}>{j.status||'Draft'}</span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(j.tanggal)} {j.jam && `• ${j.jam}`} • {j.kelasNama} • {j.madrasahNama}</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{j.materi}</p>
                {j.narasiKBC && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{j.narasiKBC}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              <button onClick={()=>navigate(`/jurnal/${j.id}`)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"><Eye className="w-3 h-3"/>Detail</button>
              <button onClick={()=>openEdit(j)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"><Edit className="w-3 h-3"/>Edit</button>
              <button onClick={()=>del(j.id)} className="px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-1"><Trash2 className="w-3 h-3"/></button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <p className="col-span-full text-center text-gray-400 py-8">Belum ada jurnal harian</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold">{form.id?'Edit':'Tambah'} Jurnal Harian</h3>
              <button onClick={()=>setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={form.tanggal||''} onChange={e=>setForm({...form,tanggal:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Jam</label><input type="time" value={form.jam||''} onChange={e=>setForm({...form,jam:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Guru</label><select value={form.guruId||''} onChange={e=>setForm({...form,guruId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{guruList.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Madrasah</label><select value={form.madrasahId||''} onChange={e=>setForm({...form,madrasahId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{madrasahList.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label><select value={form.kelasId||''} onChange={e=>setForm({...form,kelasId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{kelasList.filter(k=>!form.madrasahId||k.madrasahId===form.madrasahId).map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mapel/Tema</label><input value={form.mapel||''} onChange={e=>setForm({...form,mapel:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Materi</label><input value={form.materi||''} onChange={e=>setForm({...form,materi:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Pembuka</label><textarea value={form.kegiatanPembuka||''} onChange={e=>setForm({...form,kegiatanPembuka:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Inti</label><textarea value={form.kegiatanInti||''} onChange={e=>setForm({...form,kegiatanInti:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Penutup</label><textarea value={form.kegiatanPenutup||''} onChange={e=>setForm({...form,kegiatanPenutup:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Nilai Panca Cinta yang Diterapkan</label><div className="flex flex-wrap gap-2">{NILAI_PANCA_CINTA.map(pc=><button key={pc} type="button" onClick={()=>togglePC(pc)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${(form.pancaCinta||[]).includes(pc)?'bg-[#eecb59]/20 border-[#eecb59] text-[#102a4d]':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{pc}</button>)}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Narasi Implementasi KBC</label><textarea value={form.narasiKBC||''} onChange={e=>setForm({...form,narasiKBC:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Respon Siswa</label><textarea value={form.responSiswa||''} onChange={e=>setForm({...form,responSiswa:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Dampak Positif</label><textarea value={form.dampakPositif||''} onChange={e=>setForm({...form,dampakPositif:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kendala</label><textarea value={form.kendala||''} onChange={e=>setForm({...form,kendala:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Solusi Guru</label><textarea value={form.solusiGuru||''} onChange={e=>setForm({...form,solusiGuru:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Refleksi Guru</label><textarea value={form.refleksiGuru||''} onChange={e=>setForm({...form,refleksiGuru:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Rencana Tindak Lanjut</label><textarea value={form.rencanaTL||''} onChange={e=>setForm({...form,rencanaTL:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            </div>
            <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white">
              <button onClick={()=>save('Draft')} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan Draft</button>
              <button onClick={()=>save('Dikirim')} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b]">Kirim Validasi</button>
              <button onClick={()=>setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
