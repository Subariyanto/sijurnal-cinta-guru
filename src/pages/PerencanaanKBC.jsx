import React, { useState } from 'react';
import { getData, addItem, updateItem, deleteItem, generateId, formatDate, NILAI_PANCA_CINTA } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Plus, Search, Edit, Trash2, Printer, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

export default function PerencanaanKBC() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const data = getData();
  const [list, setList] = useState(data.rencanaKBC);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  let filtered = list;
  if (user.role === 'guru') filtered = list.filter(r => r.guruId === user.guruId);
  else if (user.role === 'kepala_madrasah') filtered = list.filter(r => r.madrasahId === user.madrasahId);
  if (search) filtered = filtered.filter(r => `${r.guruNama} ${r.mapel} ${r.materiPokok}`.toLowerCase().includes(search.toLowerCase()));

  const guruList = getData().guru.filter(g => !user.guruId || g.id === user.guruId);
  const madrasahList = getData().madrasah;
  const kelasList = getData().kelas;
  const indikatorList = getData().indikatorPancaCinta;

  const openAdd = () => {
    setForm({ tanggal: new Date().toISOString().slice(0,10), guruId: user.guruId||'', guruNama: user.nama||'', madrasahId: user.madrasahId||'', madrasahNama: madrasahList.find(m=>m.id===user.madrasahId)?.nama||'', kelasId: '', kelasNama: '', mapel: '', materiPokok: '', tujuanPembelajaran: '', pancaCinta: [], metode: '', media: '', kegiatanPembuka: '', kegiatanInti: '', kegiatanPenutup: '', rencanaAsesmen: '', rencanaEviden: '', catatanTL: '' });
    setShowForm(true);
  };

  const openEdit = (r) => { setForm(r); setShowForm(true); };

  const save = () => {
    if (!form.tanggal || !form.materiPokok) return showToast('Tanggal dan materi pokok wajib diisi','error');
    const g = guruList.find(x => x.id === form.guruId);
    const m = madrasahList.find(x => x.id === form.madrasahId);
    const k = kelasList.find(x => x.id === form.kelasId);
    const payload = { ...form, guruNama: g?.nama||form.guruNama, madrasahNama: m?.nama||form.madrasahNama, kelasNama: k?.nama||form.kelasNama };
    if (form.id) { updateItem('rencanaKBC', form.id, payload); showToast('Rencana diperbarui','success'); }
    else { addItem('rencanaKBC', { ...payload, id: generateId() }); showToast('Rencana ditambahkan','success'); }
    setList(getData().rencanaKBC); setShowForm(false);
  };

  const del = (id) => { if (!confirm('Hapus rencana ini?')) return; deleteItem('rencanaKBC', id); setList(getData().rencanaKBC); showToast('Rencana dihapus','success'); };

  const togglePC = (val) => {
    const cur = form.pancaCinta || [];
    setForm({ ...form, pancaCinta: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] });
  };

  const keJurnal = (r) => navigate('/jurnal', { state: { rencanaId: r.id } });

  const cetak = (r) => {
    const w = window.open('','_blank');
    w.document.write(`<html><head><title>Rencana KBC</title><style>body{font-family:Arial;font-size:12px;padding:30px;max-width:800px;margin:auto} h2{text-align:center;color:#102a4d} table{width:100%;border-collapse:collapse;margin-top:10px} td{padding:6px;border:1px solid #ccc} .label{font-weight:bold;width:150px;background:#f5f5f5}</style></head><body><h2>RENCANA PEMBELAJARAN KBC</h2><table><tr><td class="label">Tanggal</td><td>${formatDate(r.tanggal)}</td></tr><tr><td class="label">Guru</td><td>${r.guruNama}</td></tr><tr><td class="label">Madrasah</td><td>${r.madrasahNama}</td></tr><tr><td class="label">Kelas</td><td>${r.kelasNama}</td></tr><tr><td class="label">Mapel</td><td>${r.mapel}</td></tr><tr><td class="label">Materi</td><td>${r.materiPokok}</td></tr><tr><td class="label">Tujuan</td><td>${r.tujuanPembelajaran}</td></tr><tr><td class="label">Panca Cinta</td><td>${(r.pancaCinta||[]).join(', ')}</td></tr><tr><td class="label">Metode</td><td>${r.metode}</td></tr><tr><td class="label">Media</td><td>${r.media}</td></tr><tr><td class="label">Pembuka</td><td>${r.kegiatanPembuka}</td></tr><tr><td class="label">Inti</td><td>${r.kegiatanInti}</td></tr><tr><td class="label">Penutup</td><td>${r.kegiatanPenutup}</td></tr></table><script>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-800">Perencanaan KBC</h2><p className="text-sm text-gray-500">Rencana pembelajaran Kurikulum Berbasis Cinta</p></div>
      <div className="flex gap-3 flex-wrap"><div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari rencana..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button></div>
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-gray-800">{r.guruNama}</span><span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{r.mapel}</span></div>
                <p className="text-xs text-gray-500">{formatDate(r.tanggal)} &bull; {r.kelasNama} &bull; {r.madrasahNama}</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{r.materiPokok}</p>
                <div className="flex flex-wrap gap-1 mt-2">{(r.pancaCinta||[]).slice(0,3).map(pc=><span key={pc} className="px-2 py-0.5 bg-[#eecb59]/20 text-[#102a4d] rounded-full text-xs">{pc}</span>)}</div>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                <button onClick={()=>openEdit(r)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"><Edit className="w-3 h-3"/></button>
                <button onClick={()=>cetak(r)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"><Printer className="w-3 h-3"/></button>
                <button onClick={()=>keJurnal(r)} className="px-3 py-1.5 text-xs bg-[#2fa295] text-white rounded-lg flex items-center gap-1 hover:bg-[#278f84]"><ArrowRight className="w-3 h-3"/>Isi Jurnal</button>
                <button onClick={()=>del(r.id)} className="px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-3 h-3"/></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0 && <p className="text-center text-gray-400 py-8">Belum ada rencana pembelajaran</p>}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10"><h3 className="font-semibold">{form.id?'Edit':'Tambah'} Rencana KBC</h3><button onClick={()=>setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={form.tanggal} onChange={e=>setForm({...form,tanggal:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Guru</label><select value={form.guruId} onChange={e=>setForm({...form,guruId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{guruList.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Madrasah</label><select value={form.madrasahId} onChange={e=>setForm({...form,madrasahId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{madrasahList.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label><select value={form.kelasId} onChange={e=>setForm({...form,kelasId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{kelasList.filter(k=>!form.madrasahId||k.madrasahId===form.madrasahId).map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Mapel/Tema</label><input value={form.mapel} onChange={e=>setForm({...form,mapel:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Materi Pokok</label><input value={form.materiPokok} onChange={e=>setForm({...form,materiPokok:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran</label><textarea value={form.tujuanPembelajaran} onChange={e=>setForm({...form,tujuanPembelajaran:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Nilai Panca Cinta</label><div className="flex flex-wrap gap-2">{NILAI_PANCA_CINTA.map(pc=><button key={pc} type="button" onClick={()=>togglePC(pc)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${(form.pancaCinta||[]).includes(pc)?'bg-[#eecb59]/20 border-[#eecb59] text-[#102a4d]':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{pc}</button>)}</div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Metode</label><input value={form.metode} onChange={e=>setForm({...form,metode:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Media</label><input value={form.media} onChange={e=>setForm({...form,media:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Pembuka</label><textarea value={form.kegiatanPembuka} onChange={e=>setForm({...form,kegiatanPembuka:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Inti</label><textarea value={form.kegiatanInti} onChange={e=>setForm({...form,kegiatanInti:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Penutup</label><textarea value={form.kegiatanPenutup} onChange={e=>setForm({...form,kegiatanPenutup:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Rencana Asesmen</label><input value={form.rencanaAsesmen} onChange={e=>setForm({...form,rencanaAsesmen:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Rencana Eviden</label><input value={form.rencanaEviden} onChange={e=>setForm({...form,rencanaEviden:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tindak Lanjut</label><input value={form.catatanTL} onChange={e=>setForm({...form,catatanTL:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            </div>
            <div className="flex gap-3 p-4 border-t"><button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b]">Simpan</button><button onClick={()=>setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button></div>
          </div>
        </div>
      )}
    </div>
  );
}