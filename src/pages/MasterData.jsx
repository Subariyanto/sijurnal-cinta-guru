import React, { useState } from 'react';
import { getData, updateCollection, addItem, updateItem, deleteItem, generateId } from '../lib/store';
import { Plus, Search, Edit, Trash2, X, Save, Building2, Users, BookOpen, Heart, GraduationCap, FileDown, Upload, FileText } from 'lucide-react';
import { JENJANG, NILAI_PANCA_CINTA, ROLE_LIST } from '../lib/store';
import { downloadCSV, downloadTemplate, parseCSV, readFileAsText } from '../lib/csv';
import { useAuth } from '../lib/AuthContext';

function useDataRefresher() {
  const [_, setTick] = useState(0);
  return () => setTick(t => t + 1);
}

function showToast(msg, type) { const el = document.createElement('div'); el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type==='success'?'bg-green-600':'bg-red-600'}`; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); }

// === Helper toolbar Template / Import / Export ===
function TemplateImportExport({ onTemplate, onImport, onExport }) {
  const fileRef = React.useRef(null);
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onTemplate} className="px-3 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium flex items-center gap-2" title="Download template CSV">
        <FileText className="w-4 h-4"/>Template
      </button>
      <button onClick={()=>fileRef.current?.click()} className="px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium flex items-center gap-2" title="Import CSV ke aplikasi">
        <Upload className="w-4 h-4"/>Import
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e=>{ const f = e.target.files?.[0]; if (f) onImport(f); e.target.value=''; }}/>
      </button>
      <button onClick={onExport} className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium flex items-center gap-2" title="Export semua data ke CSV">
        <FileDown className="w-4 h-4"/>Export
      </button>
    </div>
  );
}

export default function MasterData() {
  const { user } = useAuth();
  const [tab, setTab] = useState(user.role === 'kamad' ? 'guru' : 'madrasah');
  const canEditMadrasah = user.role === 'admin';
  const canEditTenantData = user.role === 'admin' || user.role === 'kamad';
  const refresh = useDataRefresher();

  const tabs = [
    { key: 'madrasah', label: 'Data Madrasah', icon: Building2 },
    { key: 'guru', label: 'Data Guru', icon: Users },
    { key: 'kelas', label: 'Data Kelas', icon: BookOpen },
    { key: 'murid', label: 'Data Murid', icon: GraduationCap },
    { key: 'indikator', label: 'Indikator Panca Cinta', icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Master Data</h2>
        <p className="text-sm text-gray-500">Kelola data madrasah, guru, kelas, dan indikator KBC</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t.key ? 'bg-[#102a4d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {user.role === 'pengawas' && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">Mode baca saja untuk madrasah binaan.</p>}
      {tab === 'madrasah' && <MadrasahTab refresh={refresh} canEdit={canEditMadrasah} />}
      {tab === 'guru' && <GuruTab refresh={refresh} canEdit={canEditTenantData} />}
      {tab === 'kelas' && <KelasTab refresh={refresh} canEdit={canEditTenantData} />}
      {tab === 'murid' && <MuridTab refresh={refresh} canEdit={canEditTenantData} />}
      {tab === 'indikator' && <IndikatorTab refresh={refresh} canEdit={user.role === 'admin'} />}
    </div>
  );
}

function MadrasahTab({ refresh, canEdit }) {
  const data = getData();
  const [list, setList] = useState(data.madrasah);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  const filtered = list.filter(m => `${m.nama} ${m.nsmNpsn} ${m.kecamatan}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ nama:'', nsmNpsn:'', jenjang:'MI', alamat:'', kepalaMadrasah:'', kecamatan:'', pengawas:'' }); setShowModal(true); };
  const openEdit = (m) => { setForm(m); setShowModal(true); };

  const save = () => {
    if (!form.nama) return showToast('Nama madrasah wajib diisi','error');
    if (form.id) { updateItem('madrasah', form.id, form); showToast('Madrasah diperbarui','success'); }
    else { addItem('madrasah', { ...form, id: generateId() }); showToast('Madrasah ditambahkan','success'); }
    setList(getData().madrasah); setShowModal(false); refresh();
  };

  const del = (id) => { if (!confirm('Hapus madrasah ini?')) return; deleteItem('madrasah', id); setList(getData().madrasah); refresh(); showToast('Madrasah dihapus','success'); };

  const M_HEADERS = ['nama','nsmNpsn','jenjang','alamat','kepalaMadrasah','kecamatan','pengawas'];
  const handleTemplate = () => downloadTemplate('template-madrasah.csv', M_HEADERS, [
    { nama: 'MI Contoh', nsmNpsn: '111235090099', jenjang: 'MI', alamat: 'Jl. Contoh No.1', kepalaMadrasah: 'Drs. Nama Kepala', kecamatan: 'Sukowono', pengawas: 'Subariyanto, S.Pd, M.Pd.I' }
  ]);
  const handleExport = () => downloadCSV(`data-madrasah-${new Date().toISOString().slice(0,10)}.csv`, M_HEADERS, list);
  const handleImport = async (file) => {
    try {
      const txt = await readFileAsText(file);
      const { rows } = parseCSV(txt);
      if (rows.length === 0) return showToast('CSV kosong','error');
      let count = 0;
      rows.forEach(r => {
        if (!r.nama) return;
        addItem('madrasah', { id: generateId(), nama:r.nama, nsmNpsn:r.nsmNpsn||'', jenjang:r.jenjang||'MI', alamat:r.alamat||'', kepalaMadrasah:r.kepalaMadrasah||'', kecamatan:r.kecamatan||'', pengawas:r.pengawas||'' });
        count++;
      });
      setList(getData().madrasah); refresh();
      showToast(`${count} madrasah berhasil diimport`,'success');
    } catch (e) { showToast('Gagal import: ' + e.message,'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari madrasah..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        {canEdit && <TemplateImportExport onTemplate={handleTemplate} onImport={handleImport} onExport={handleExport} />}
        {canEdit && <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button>}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4">Nama</th><th className="py-3 px-4">NSM/NPSN</th><th className="py-3 px-4">Jenjang</th><th className="py-3 px-4">Kecamatan</th><th className="py-3 px-4">Kepala</th><th className="py-3 px-4 w-20">Aksi</th></tr></thead><tbody>{filtered.map(m => (<tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="py-2.5 px-4 font-medium text-xs">{m.nama}</td><td className="py-2.5 px-4 text-xs">{m.nsmNpsn}</td><td className="py-2.5 px-4 text-xs">{m.jenjang}</td><td className="py-2.5 px-4 text-xs">{m.kecamatan}</td><td className="py-2.5 px-4 text-xs text-gray-500">{m.kepalaMadrasah}</td><td className="py-2.5 px-4">{canEdit && <div className="flex gap-1"><button onClick={()=>openEdit(m)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5"/></button><button onClick={()=>del(m.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button></div>}</td></tr>))}</tbody></table></div></div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white"><h3 className="font-semibold">{form.id?'Edit':'Tambah'} Madrasah</h3><button onClick={()=>setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">NSM/NPSN</label><input value={form.nsmNpsn} onChange={e=>setForm({...form,nsmNpsn:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label><select value={form.jenjang} onChange={e=>setForm({...form,jenjang:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">{JENJANG.map(j=><option key={j}>{j}</option>)}</select></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label><input value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepala Madrasah</label><input value={form.kepalaMadrasah} onChange={e=>setForm({...form,kepalaMadrasah:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label><input value={form.kecamatan} onChange={e=>setForm({...form,kecamatan:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Pengawas</label><input value={form.pengawas} onChange={e=>setForm({...form,pengawas:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div>
            </div>
            <div className="flex gap-3 p-4 border-t"><button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan</button><button onClick={()=>setShowModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuruTab({ refresh, canEdit }) {
  const data = getData();
  const [list, setList] = useState(data.guru);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  const filtered = list.filter(g => `${g.nama} ${g.nip||''} ${g.mapel||''}`.toLowerCase().includes(search.toLowerCase()));
  const madrasahList = getData().madrasah;

  const openAdd = () => { setForm({ nama:'', nip:'', jabatan:'', mapel:'', madrasahId:'', noHP:'', email:'', userId:'' }); setShowModal(true); };
  const openEdit = (g) => { setForm(g); setShowModal(true); };
  const save = () => {
    if (!form.nama) return showToast('Nama guru wajib diisi','error');
    const m = madrasahList.find(x=>x.id===form.madrasahId);
    const payload = { ...form, madrasahNama: m?.nama||'' };
    if (form.id) { updateItem('guru', form.id, payload); showToast('Guru diperbarui','success'); }
    else { addItem('guru', { ...payload, id: generateId() }); showToast('Guru ditambahkan','success'); }
    setList(getData().guru); setShowModal(false); refresh();
  };
  const del = (id) => { if (!confirm('Hapus guru ini?')) return; deleteItem('guru', id); setList(getData().guru); refresh(); showToast('Guru dihapus','success'); };

  const G_HEADERS = ['nama','nip','jabatan','mapel','madrasahNama','noHP','email','userId'];
  const handleTemplate = () => downloadTemplate('template-guru.csv', G_HEADERS, [
    { nama: 'Nama Guru, S.Pd', nip: '198501012019011001', jabatan: 'Guru Kelas', mapel: 'Tematik', madrasahNama: 'MI Contoh', noHP: '0812xxxx', email: 'guru@contoh.id', userId: 'guru1' }
  ]);
  const handleExport = () => downloadCSV(`data-guru-${new Date().toISOString().slice(0,10)}.csv`, G_HEADERS, list);
  const handleImport = async (file) => {
    try {
      const txt = await readFileAsText(file);
      const { rows } = parseCSV(txt);
      if (rows.length === 0) return showToast('CSV kosong','error');
      const mList = getData().madrasah;
      let count = 0;
      rows.forEach(r => {
        if (!r.nama) return;
        const m = mList.find(x => x.nama.toLowerCase() === (r.madrasahNama||'').toLowerCase());
        addItem('guru', { id: generateId(), nama:r.nama, nip:r.nip||'', jabatan:r.jabatan||'', mapel:r.mapel||'', madrasahId:m?.id||'', madrasahNama:m?.nama||r.madrasahNama||'', noHP:r.noHP||'', email:r.email||'', userId:r.userId||'' });
        count++;
      });
      setList(getData().guru); refresh();
      showToast(`${count} guru berhasil diimport`,'success');
    } catch (e) { showToast('Gagal import: ' + e.message,'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center"><div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari guru..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>{canEdit && <TemplateImportExport onTemplate={handleTemplate} onImport={handleImport} onExport={handleExport} />}{canEdit && <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button>}</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4">Nama</th><th className="py-3 px-4">NIP</th><th className="py-3 px-4">Mapel</th><th className="py-3 px-4">Madrasah</th><th className="py-3 px-4 w-20">Aksi</th></tr></thead><tbody>{filtered.map(g=>(<tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="py-2.5 px-4 font-medium text-xs">{g.nama}</td><td className="py-2.5 px-4 text-xs">{g.nip||'-'}</td><td className="py-2.5 px-4 text-xs">{g.mapel||'-'}</td><td className="py-2.5 px-4 text-xs text-gray-500">{g.madrasahNama||'-'}</td><td className="py-2.5 px-4">{canEdit && <div className="flex gap-1"><button onClick={()=>openEdit(g)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5"/></button><button onClick={()=>del(g.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button></div>}</td></tr>))}</tbody></table></div></div>
      {showModal && <GuruModal form={form} setForm={setForm} save={save} close={()=>setShowModal(false)} madrasahList={madrasahList} />}
    </div>
  );
}

function GuruModal({ form, setForm, save, close, madrasahList }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white"><h3 className="font-semibold">{form.id?'Edit':'Tambah'} Guru</h3><button onClick={close} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button></div><div className="p-4 space-y-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Guru</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">NIP/NUPTK</label><input value={form.nip} onChange={e=>setForm({...form,nip:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label><input value={form.jabatan} onChange={e=>setForm({...form,jabatan:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Mapel/Kelas</label><input value={form.mapel} onChange={e=>setForm({...form,mapel:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Madrasah</label><select value={form.madrasahId} onChange={e=>setForm({...form,madrasahId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{madrasahList.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">No HP</label><input value={form.noHP} onChange={e=>setForm({...form,noHP:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">User ID (username)</label><input value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div><div className="flex gap-3 p-4 border-t"><button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan</button><button onClick={close} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button></div></div></div>
  );
}

function KelasTab({ refresh, canEdit }) {
  const data = getData();
  const [list, setList] = useState(data.kelas);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const madrasahList = getData().madrasah;

  const filtered = list.filter(k => `${k.nama} ${k.jenjang} ${k.waliKelas||''}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ nama:'', jenjang:'MI', waliKelas:'', jmlSiswaL:0, jmlSiswaP:0, tahunPelajaran:'2026/2027', madrasahId:'' }); setShowModal(true); };
  const openEdit = (k) => { setForm(k); setShowModal(true); };
  const save = () => {
    if (!form.nama) return showToast('Nama kelas wajib diisi','error');
    if (form.id) { updateItem('kelas', form.id, form); showToast('Kelas diperbarui','success'); }
    else { addItem('kelas', { ...form, id: generateId() }); showToast('Kelas ditambahkan','success'); }
    setList(getData().kelas); setShowModal(false); refresh();
  };
  const del = (id) => { if (!confirm('Hapus kelas ini?')) return; deleteItem('kelas', id); setList(getData().kelas); refresh(); showToast('Kelas dihapus','success'); };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap"><div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari kelas..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>{canEdit && <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah</button>}</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4">Kelas</th><th className="py-3 px-4">Jenjang</th><th className="py-3 px-4">Wali Kelas</th><th className="py-3 px-4">L</th><th className="py-3 px-4">P</th><th className="py-3 px-4 w-20">Aksi</th></tr></thead><tbody>{filtered.map(k=>(<tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="py-2.5 px-4 font-medium text-xs">{k.nama}</td><td className="py-2.5 px-4 text-xs">{k.jenjang}</td><td className="py-2.5 px-4 text-xs">{k.waliKelas||'-'}</td><td className="py-2.5 px-4 text-xs">{k.jmlSiswaL}</td><td className="py-2.5 px-4 text-xs">{k.jmlSiswaP}</td><td className="py-2.5 px-4">{canEdit && <div className="flex gap-1"><button onClick={()=>openEdit(k)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5"/></button><button onClick={()=>del(k.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button></div>}</td></tr>))}</tbody></table></div></div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white"><h3 className="font-semibold">{form.id?'Edit':'Tambah'} Kelas</h3><button onClick={()=>setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button></div><div className="p-4 space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label><select value={form.jenjang} onChange={e=>setForm({...form,jenjang:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">{JENJANG.map(j=><option key={j}>{j}</option>)}</select></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label><input value={form.waliKelas} onChange={e=>setForm({...form,waliKelas:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Madrasah</label><select value={form.madrasahId} onChange={e=>setForm({...form,madrasahId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{madrasahList.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Siswa Laki-laki</label><input type="number" min="0" value={form.jmlSiswaL} onChange={e=>setForm({...form,jmlSiswaL:parseInt(e.target.value)||0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Siswa Perempuan</label><input type="number" min="0" value={form.jmlSiswaP} onChange={e=>setForm({...form,jmlSiswaP:parseInt(e.target.value)||0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label><input value={form.tahunPelajaran} onChange={e=>setForm({...form,tahunPelajaran:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div></div><div className="flex gap-3 p-4 border-t"><button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan</button><button onClick={()=>setShowModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button></div></div></div>
      )}
    </div>
  );
}

function MuridTab({ refresh, canEdit }) {
  const data = getData();
  const [list, setList] = useState(data.murid || []);
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterMadrasah, setFilterMadrasah] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [form, setForm] = useState({});
  const madrasahList = getData().madrasah;
  const kelasList = getData().kelas;

  const filtered = list.filter(s => {
    if (search && !`${s.nama} ${s.nis||''} ${s.nisn||''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterKelas && s.kelasId !== filterKelas) return false;
    if (filterMadrasah && s.madrasahId !== filterMadrasah) return false;
    return true;
  });

  const openAdd = () => { setForm({ nama:'', nis:'', nisn:'', jenisKelamin:'L', tempatLahir:'', tanggalLahir:'', kelasId:'', madrasahId:'', namaWali:'', noHP:'', alamat:'', tahunPelajaran:'2026/2027' }); setShowModal(true); };
  const openEdit = (s) => { setForm(s); setShowModal(true); };
  const save = () => {
    if (!form.nama) return showToast('Nama murid wajib diisi','error');
    const k = kelasList.find(x=>x.id===form.kelasId);
    const m = madrasahList.find(x=>x.id===form.madrasahId);
    const payload = { ...form, kelasNama: k?.nama||'', madrasahNama: m?.nama||'', jenjang: k?.jenjang||m?.jenjang||'' };
    if (form.id) { updateItem('murid', form.id, payload); showToast('Murid diperbarui','success'); }
    else { addItem('murid', { ...payload, id: generateId() }); showToast('Murid ditambahkan','success'); }
    setList(getData().murid); setShowModal(false); refresh();
  };
  const del = (id) => { if (!confirm('Hapus murid ini?')) return; deleteItem('murid', id); setList(getData().murid); refresh(); showToast('Murid dihapus','success'); };

  const S_HEADERS = ['nama','nis','nisn','jenisKelamin','tempatLahir','tanggalLahir','madrasahNama','kelasNama','namaWali','noHP','alamat','tahunPelajaran'];
  const handleTemplate = () => downloadTemplate('template-murid.csv', S_HEADERS, [
    { nama: 'Ahmad Fauzi', nis: '12345', nisn: '9876543210', jenisKelamin: 'L', tempatLahir: 'Jember', tanggalLahir: '2014-03-15', madrasahNama: 'MI Contoh', kelasNama: '5A', namaWali: 'Bapak Fauzi', noHP: '0812xxxx', alamat: 'Jl. Contoh', tahunPelajaran: '2026/2027' }
  ]);
  const handleExport = () => downloadCSV(`data-murid-${new Date().toISOString().slice(0,10)}.csv`, S_HEADERS, filtered);
  const handleImportFile = async (file) => {
    try {
      const txt = await readFileAsText(file);
      const { rows } = parseCSV(txt);
      if (rows.length === 0) return showToast('CSV kosong','error');
      const mList = getData().madrasah;
      const kList = getData().kelas;
      let count = 0;
      rows.forEach(r => {
        if (!r.nama) return;
        const m = mList.find(x => x.nama.toLowerCase() === (r.madrasahNama||'').toLowerCase());
        const k = kList.find(x => x.nama.toLowerCase() === (r.kelasNama||'').toLowerCase() && (!m || x.madrasahId === m.id));
        addItem('murid', {
          id: generateId(),
          nama: r.nama, nis: r.nis||'', nisn: r.nisn||'',
          jenisKelamin: (r.jenisKelamin||'L').toUpperCase().startsWith('P') ? 'P' : 'L',
          tempatLahir: r.tempatLahir||'', tanggalLahir: r.tanggalLahir||'',
          madrasahId: m?.id||'', madrasahNama: m?.nama||r.madrasahNama||'',
          kelasId: k?.id||'', kelasNama: k?.nama||r.kelasNama||'',
          jenjang: k?.jenjang||m?.jenjang||'',
          namaWali: r.namaWali||'', noHP: r.noHP||'', alamat: r.alamat||'',
          tahunPelajaran: r.tahunPelajaran||'2026/2027'
        });
        count++;
      });
      setList(getData().murid); refresh();
      showToast(`${count} murid berhasil diimport`,'success');
    } catch (e) { showToast('Gagal import: ' + e.message,'error'); }
  };

  const importBulk = () => {
    const lines = importText.split('\n').map(l=>l.trim()).filter(Boolean);
    if (lines.length === 0) return showToast('Tempel data minimal 1 baris','error');
    if (!filterKelas || !filterMadrasah) return showToast('Pilih filter Madrasah & Kelas dulu (data ini akan masuk ke kelas tersebut)','error');
    const k = kelasList.find(x=>x.id===filterKelas);
    const m = madrasahList.find(x=>x.id===filterMadrasah);
    let count = 0;
    lines.forEach(line => {
      const cols = line.split(/\t|;|,/).map(c=>c.trim());
      const [nama, nis, nisn, jk] = cols;
      if (!nama) return;
      addItem('murid', {
        id: generateId(),
        nama, nis: nis||'', nisn: nisn||'',
        jenisKelamin: (jk||'L').toUpperCase().startsWith('P') ? 'P' : 'L',
        kelasId: filterKelas, kelasNama: k?.nama||'',
        madrasahId: filterMadrasah, madrasahNama: m?.nama||'',
        jenjang: k?.jenjang||m?.jenjang||'',
        tahunPelajaran: k?.tahunPelajaran || '2026/2027'
      });
      count++;
    });
    setList(getData().murid); setShowImport(false); setImportText(''); refresh();
    showToast(`${count} murid berhasil diimpor`,'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Cari nama/NIS/NISN..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        <select value={filterMadrasah} onChange={e=>{setFilterMadrasah(e.target.value); setFilterKelas('');}} className="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Semua Madrasah</option>{madrasahList.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select>
        <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Semua Kelas</option>{kelasList.filter(k=>!filterMadrasah||k.madrasahId===filterMadrasah).map(k=><option key={k.id} value={k.id}>{k.nama} ({k.jenjang})</option>)}</select>
        {canEdit && <button onClick={()=>setShowImport(true)} className="px-4 py-2 bg-[#2fa295] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#278f84]"><Plus className="w-4 h-4"/>Impor Bulk</button>}
        {canEdit && <TemplateImportExport onTemplate={handleTemplate} onImport={handleImportFile} onExport={handleExport} />}
        {canEdit && <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4"/>Tambah Murid</button>}
      </div>
      <div className="text-xs text-gray-500">Total: <b>{filtered.length}</b> murid {filterKelas && `di kelas ini`}</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4">Nama</th><th className="py-3 px-4">NIS</th><th className="py-3 px-4">NISN</th><th className="py-3 px-4">JK</th><th className="py-3 px-4">Kelas</th><th className="py-3 px-4">Madrasah</th><th className="py-3 px-4 w-20">Aksi</th></tr></thead><tbody>{filtered.length===0?(<tr><td colSpan={7} className="py-6 text-center text-xs text-gray-400">Belum ada murid. Klik <b>Tambah Murid</b> atau <b>Impor Bulk</b>.</td></tr>):filtered.map(s=>(<tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="py-2.5 px-4 font-medium text-xs">{s.nama}</td><td className="py-2.5 px-4 text-xs">{s.nis||'-'}</td><td className="py-2.5 px-4 text-xs">{s.nisn||'-'}</td><td className="py-2.5 px-4 text-xs"><span className={`px-2 py-0.5 rounded text-xs ${s.jenisKelamin==='L'?'bg-blue-100 text-blue-700':'bg-pink-100 text-pink-700'}`}>{s.jenisKelamin}</span></td><td className="py-2.5 px-4 text-xs">{s.kelasNama||'-'}</td><td className="py-2.5 px-4 text-xs text-gray-500">{s.madrasahNama||'-'}</td><td className="py-2.5 px-4">{canEdit && <div className="flex gap-1"><button onClick={()=>openEdit(s)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5"/></button><button onClick={()=>del(s.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button></div>}</td></tr>))}</tbody></table></div></div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white"><h3 className="font-semibold">{form.id?'Edit':'Tambah'} Murid</h3><button onClick={()=>setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">NIS</label><input value={form.nis} onChange={e=>setForm({...form,nis:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">NISN</label><input value={form.nisn} onChange={e=>setForm({...form,nisn:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label><select value={form.jenisKelamin} onChange={e=>setForm({...form,jenisKelamin:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label><input value={form.tempatLahir} onChange={e=>setForm({...form,tempatLahir:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label><input type="date" value={form.tanggalLahir} onChange={e=>setForm({...form,tanggalLahir:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Madrasah</label><select value={form.madrasahId} onChange={e=>setForm({...form,madrasahId:e.target.value, kelasId:''})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{madrasahList.map(m=><option key={m.id} value={m.id}>{m.nama}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label><select value={form.kelasId} onChange={e=>setForm({...form,kelasId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Pilih...</option>{kelasList.filter(k=>!form.madrasahId||k.madrasahId===form.madrasahId).map(k=><option key={k.id} value={k.id}>{k.nama} ({k.jenjang})</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Wali/Orang Tua</label><input value={form.namaWali} onChange={e=>setForm({...form,namaWali:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">No HP Wali</label><input value={form.noHP} onChange={e=>setForm({...form,noHP:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label><textarea rows={2} value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label><input value={form.tahunPelajaran} onChange={e=>setForm({...form,tahunPelajaran:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
            </div>
            <div className="flex gap-3 p-4 border-t"><button onClick={save} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Simpan</button><button onClick={()=>setShowModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button></div>
          </div>
        </div>
      )}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b"><h3 className="font-semibold">Impor Murid (Bulk Paste)</h3><button onClick={()=>setShowImport(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5"/></button></div>
            <div className="p-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">Cara pakai:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Pilih <b>Madrasah</b> & <b>Kelas</b> dari filter di atas (semua baris akan masuk ke kelas tersebut).</li>
                  <li>Tempel data dari Excel/spreadsheet, satu murid per baris.</li>
                  <li>Format kolom: <code>Nama [TAB] NIS [TAB] NISN [TAB] L/P</code> — pemisah bisa TAB, koma, atau titik koma.</li>
                </ol>
                <p className="mt-2"><b>Madrasah:</b> {madrasahList.find(m=>m.id===filterMadrasah)?.nama || <span className="text-red-600">belum dipilih</span>} • <b>Kelas:</b> {kelasList.find(k=>k.id===filterKelas)?.nama || <span className="text-red-600">belum dipilih</span>}</p>
              </div>
              <textarea rows={12} value={importText} onChange={e=>setImportText(e.target.value)} placeholder={'Ahmad Fauzi\t12345\t9876543210\tL\nSiti Aminah\t12346\t9876543211\tP\n...'} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#102a4d] outline-none"/>
            </div>
            <div className="flex gap-3 p-4 border-t"><button onClick={importBulk} className="flex-1 py-2.5 bg-[#2fa295] text-white rounded-lg text-sm font-medium hover:bg-[#278f84]">Impor Sekarang</button><button onClick={()=>setShowImport(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function IndikatorTab({ refresh, canEdit }) {
  const data = getData();
  const [indikatorPC, setIndikatorPC] = useState(data.indikatorPancaCinta);
  const [expanded, setExpanded] = useState(null);
  const [addIndikator, setAddIndikator] = useState({ pcId: null, teks: '' });

  const saveAll = (arr) => { updateCollection('indikatorPancaCinta', arr); setIndikatorPC(arr); refresh(); showToast('Indikator diperbarui','success'); };

  const addNewIndikator = (pcId) => {
    if (!addIndikator.teks.trim()) return;
    const updated = indikatorPC.map(pc => {
      if (pc.id === pcId) return { ...pc, indikator: [...pc.indikator, { id: generateId(), teks: addIndikator.teks.trim() }] };
      return pc;
    });
    saveAll(updated);
    setAddIndikator({ pcId: null, teks: '' });
  };

  const deleteIndikator = (pcId, indId) => { const updated = indikatorPC.map(pc => pc.id === pcId ? { ...pc, indikator: pc.indikator.filter(i => i.id !== indId) } : pc); saveAll(updated); };
  const editIndikator = (pcId, indId, newTeks) => { const updated = indikatorPC.map(pc => pc.id === pcId ? { ...pc, indikator: pc.indikator.map(i => i.id === indId ? { ...i, teks: newTeks } : i) } : pc); saveAll(updated); showToast('Indikator diperbarui','success'); setIndikatorPC(getData().indikatorPancaCinta); };

  return (
    <div className="space-y-4">
      {indikatorPC.map(pc => (
        <div key={pc.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setExpanded(expanded === pc.id ? null : pc.id)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-red-500" fill="currentColor" /><span className="font-semibold text-gray-800">{pc.nama}</span><span className="text-xs text-gray-500">({pc.indikator.length} indikator)</span></div>
            <span className="text-gray-400">{expanded === pc.id ? '▲' : '▼'}</span>
          </button>
          {expanded === pc.id && (
            <div className="p-4 space-y-3">
              {pc.indikator.map(ind => <IndikatorRow key={ind.id} ind={ind} pcId={pc.id} onEdit={editIndikator} onDelete={deleteIndikator} canEdit={canEdit} />)}
              {canEdit && <div className="flex gap-2 pt-2 border-t">
                <input type="text" placeholder="Tambah indikator baru..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" value={addIndikator.pcId === pc.id ? addIndikator.teks : ''} onChange={e => setAddIndikator({ pcId: pc.id, teks: e.target.value })} onKeyDown={e => e.key === 'Enter' && addNewIndikator(pc.id)} />
                <button onClick={() => addNewIndikator(pc.id)} className="px-4 py-2 bg-[#2fa295] text-white rounded-lg text-sm font-medium hover:bg-[#278f84]"><Plus className="w-4 h-4" /></button>
              </div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IndikatorRow({ ind, pcId, onEdit, onDelete, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [teks, setTeks] = useState(ind.teks);
  const handleSave = () => { if (!teks.trim()) return; onEdit(pcId, ind.id, teks.trim()); setEditing(false); };
  return (
    <div className="flex items-center gap-2 py-1.5">
      {editing ? (<><input type="text" value={teks} onChange={e=>setTeks(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" onKeyDown={e=>e.key==='Enter'&&handleSave()} /><button onClick={handleSave} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Save className="w-4 h-4"/></button><button onClick={()=>{setTeks(ind.teks);setEditing(false)}} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"><X className="w-4 h-4"/></button></>) : (<><span className="flex-1 text-sm text-gray-700">{ind.teks}</span>{canEdit && <><button onClick={()=>setEditing(true)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5"/></button><button onClick={()=>onDelete(pcId, ind.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button></>}</>)}
    </div>
  );
}


