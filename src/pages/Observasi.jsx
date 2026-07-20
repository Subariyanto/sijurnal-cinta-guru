import React, { useState } from 'react';
import { getData, addItem, updateItem, deleteItem, generateId, formatDate, NILAI_PANCA_CINTA, KATEGORI_OBSERVASI, INDIKATOR_PERILAKU } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

const KATEGORI_COLORS = {
  'Membudaya': 'bg-green-100 text-green-700',
  'Berkembang': 'bg-blue-100 text-blue-700',
  'Mulai Tampak': 'bg-yellow-100 text-yellow-700',
  'Belum Tampak': 'bg-gray-100 text-gray-700',
};

export default function Observasi() {
  const { user } = useAuth();
  const [list, setList] = useState(getData().observasiSiswa);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const guruList = getData().guru.filter(g => !user.guruId || g.id === user.guruId);
  const kelasList = getData().kelas;

  let filtered = list;
  if (user.role === 'guru') filtered = filtered.filter(o => o.guruId === user.guruId);
  else if (user.role === 'kamad') {
    const myKelas = kelasList.filter(k => k.madrasahId === user.madrasahId).map(k => k.id);
    filtered = filtered.filter(o => myKelas.includes(o.kelasId));
  }
  if (search) filtered = filtered.filter(o => `${o.inisial} ${o.indikatorPerilaku} ${o.guruNama}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setForm({
      tanggal: new Date().toISOString().slice(0,10),
      guruId: user.guruId||'', guruNama: user.nama||'',
      kelasId: '', kelasNama: '',
      inisial: '', indikatorPerilaku: INDIKATOR_PERILAKU[0],
      pancaCinta: NILAI_PANCA_CINTA[0], deskripsi: '',
      kategori: KATEGORI_OBSERVASI[0],
      catatanKhusus: '', tindakLanjut: '',
    });
    setShowForm(true);
  };

  const openEdit = (o) => { setForm(o); setShowForm(true); };

  const save = () => {
    if (!form.tanggal || !form.inisial) return showToast('Tanggal dan inisial siswa wajib diisi','error');
    const g = guruList.find(x => x.id === form.guruId);
    const k = kelasList.find(x => x.id === form.kelasId);
    const payload = { ...form, guruNama: g?.nama||form.guruNama, kelasNama: k?.nama||form.kelasNama };
    if (form.id) { updateItem('observasiSiswa', form.id, payload); showToast('Observasi diperbarui','success'); }
    else { addItem('observasiSiswa', { ...payload, id: generateId() }); showToast('Observasi ditambahkan','success'); }
    setList(getData().observasiSiswa); setShowForm(false);
  };

  const del = (id) => { if (!confirm('Hapus observasi ini?')) return; deleteItem('observasiSiswa', id); setList(getData().observasiSiswa); showToast('Observasi dihapus','success'); };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-800">Observasi Dampak Siswa</h2><p className="text-sm text-gray-500">Catat perkembangan karakter siswa berbasis Panca Cinta</p></div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari observasi..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Inisial</th>
              <th className="px-4 py-3">Indikator Perilaku</th>
              <th className="px-4 py-3">Panca Cinta</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Guru</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{o.inisial}</td>
                <td className="px-4 py-3 text-gray-600">{o.indikatorPerilaku}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#eecb59]/20 text-[#102a4d] rounded-full text-xs">{o.pancaCinta}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${KATEGORI_COLORS[o.kategori]||KATEGORI_COLORS['Belum Tampak']}`}>{o.kategori}</span></td>
                <td className="px-4 py-3 text-gray-600">{o.guruNama}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(o.tanggal)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={()=>openEdit(o)} className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"><Edit className="w-3 h-3"/></button>
                    <button onClick={()=>del(o.id)} className="px-2 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-3 h-3"/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada observasi</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold">{form.id?'Edit':'Tambah'} Observasi Siswa</h3>
              <button onClick={()=>setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={form.tanggal||''} onChange={e=>setForm({...form,tanggal:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Guru</label><select value={form.guruId||''} onChange={e=>setForm({...form,guruId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{guruList.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label><select value={form.kelasId||''} onChange={e=>setForm({...form,kelasId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{kelasList.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Inisial Siswa</label><input value={form.inisial||''} onChange={e=>setForm({...form,inisial:e.target.value})} placeholder="cth. A.B." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Indikator Perilaku</label><select value={form.indikatorPerilaku||''} onChange={e=>setForm({...form,indikatorPerilaku:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">{INDIKATOR_PERILAKU.map(i=><option key={i} value={i}>{i}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nilai Panca Cinta Terkait</label><select value={form.pancaCinta||''} onChange={e=>setForm({...form,pancaCinta:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">{NILAI_PANCA_CINTA.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Perilaku</label><textarea value={form.deskripsi||''} onChange={e=>setForm({...form,deskripsi:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label><select value={form.kategori||''} onChange={e=>setForm({...form,kategori:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">{KATEGORI_OBSERVASI.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan Khusus</label><textarea value={form.catatanKhusus||''} onChange={e=>setForm({...form,catatanKhusus:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tindak Lanjut Guru</label><textarea value={form.tindakLanjut||''} onChange={e=>setForm({...form,tindakLanjut:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
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
