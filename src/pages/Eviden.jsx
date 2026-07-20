import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, addItem, updateItem, deleteItem, generateId, formatDate, JENIS_EVIDEN } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Plus, Search, Edit, Trash2, Camera, Grid3x3, List, X } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

export default function Eviden() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState(getData().eviden);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [viewMode, setViewMode] = useState('table');

  const jurnalList = getData().jurnalHarian;

  let filtered = list;
  if (user.role === 'guru') {
    const myJurnal = jurnalList.filter(j => j.guruId === user.guruId).map(j => j.id);
    filtered = filtered.filter(e => !e.jurnalId || myJurnal.includes(e.jurnalId));
  } else if (user.role === 'kamad') {
    const mJurnal = jurnalList.filter(j => j.madrasahId === user.madrasahId).map(j => j.id);
    filtered = filtered.filter(e => !e.jurnalId || mJurnal.includes(e.jurnalId));
  }
  if (search) filtered = filtered.filter(e => `${e.judul} ${e.jenis} ${e.deskripsi||''}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setForm({ judul: '', jenis: JENIS_EVIDEN[0], tanggal: new Date().toISOString().slice(0,10), jurnalId: '', deskripsi: '', fileUrl: '', catatanGuru: '' });
    setShowForm(true);
  };
  const openEdit = (e) => { setForm(e); setShowForm(true); };

  const save = () => {
    if (!form.judul) return showToast('Judul wajib diisi','error');
    if (form.id) { updateItem('eviden', form.id, form); showToast('Eviden diperbarui','success'); }
    else { addItem('eviden', { ...form, id: generateId() }); showToast('Eviden ditambahkan','success'); }
    setList(getData().eviden); setShowForm(false);
  };

  const del = (id) => { if (!confirm('Hapus eviden ini?')) return; deleteItem('eviden', id); setList(getData().eviden); showToast('Eviden dihapus','success'); };

  const jurnalLabel = (id) => {
    const j = jurnalList.find(x => x.id === id);
    return j ? `${j.materi||'(tanpa materi)'} - ${formatDate(j.tanggal)}` : '-';
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-800">Eviden Digital</h2><p className="text-sm text-gray-500">Bukti pelaksanaan pembelajaran berbasis cinta</p></div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari eviden..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={()=>setViewMode('table')} className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${viewMode==='table'?'bg-white shadow-sm':''}`}><List className="w-4 h-4"/></button>
          <button onClick={()=>setViewMode('gallery')} className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${viewMode==='gallery'?'bg-white shadow-sm':''}`}><Grid3x3 className="w-4 h-4"/></button>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jurnal Terkait</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{e.judul}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{e.jenis}</span></td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(e.tanggal)}</td>
                  <td className="px-4 py-3">{e.jurnalId ? <button onClick={()=>navigate(`/jurnal/${e.jurnalId}`)} className="text-[#102a4d] hover:underline">{jurnalLabel(e.jurnalId)}</button> : <span className="text-gray-400">-</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={()=>openEdit(e)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"><Edit className="w-3 h-3"/></button>
                      <button onClick={()=>del(e.id)} className="px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada eviden</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="aspect-video bg-gradient-to-br from-[#102a4d] to-[#2fa295] flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/70"/>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 truncate">{e.judul}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{e.jenis}</span>
                  <span className="text-xs text-gray-500">{formatDate(e.tanggal)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>openEdit(e)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"><Edit className="w-3 h-3"/>Edit</button>
                  <button onClick={()=>del(e.id)} className="px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-3 h-3"/></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <p className="col-span-full text-center text-gray-400 py-8">Belum ada eviden</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={ev=>ev.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold">{form.id?'Edit':'Tambah'} Eviden</h3>
              <button onClick={()=>setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Judul Eviden</label><input value={form.judul||''} onChange={e=>setForm({...form,judul:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Eviden</label><select value={form.jenis||''} onChange={e=>setForm({...form,jenis:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">{JENIS_EVIDEN.map(j=><option key={j} value={j}>{j}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={form.tanggal||''} onChange={e=>setForm({...form,tanggal:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Jurnal Terkait</label><select value={form.jurnalId||''} onChange={e=>setForm({...form,jurnalId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">- tidak terkait -</option>{jurnalList.map(j=><option key={j.id} value={j.id}>{j.materi||'(tanpa materi)'} - {formatDate(j.tanggal)}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><textarea value={form.deskripsi||''} onChange={e=>setForm({...form,deskripsi:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">URL File (opsional)</label><input value={form.fileUrl||''} onChange={e=>setForm({...form,fileUrl:e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan Guru</label><textarea value={form.catatanGuru||''} onChange={e=>setForm({...form,catatanGuru:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b]">Simpan</button>
              <button onClick={()=>setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
