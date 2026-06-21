import React, { useState, useMemo } from 'react';
import { getData, addItem, updateItem, deleteItem, generateId, formatDate, getKategoriKarakter, getRekomendasiKarakter, SKOR_KARAKTER_LABEL, BULAN_NAMA, NILAI_PANCA_CINTA } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Plus, Search, Edit, Trash2, Eye, Printer, Save, X, BookOpen, TrendingUp, Send, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

function showToast(msg, type) {
  const el = document.createElement('div');
  el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
}

const STATUS_BADGE = { Draft: 'bg-gray-100 text-gray-700', Dikirim: 'bg-blue-100 text-blue-700', Disetujui: 'bg-green-100 text-green-700', 'Perlu Revisi': 'bg-red-100 text-red-700' };
const KAT_COLORS = { 'Sudah Terbiasa': 'bg-green-100 text-green-700', 'Berkembang Baik': 'bg-blue-100 text-blue-700', 'Sedang Belajar': 'bg-yellow-100 text-yellow-700', 'Mulai Bertumbuh': 'bg-red-100 text-red-700' };
const KAT_BG = { 'Sudah Terbiasa': 'bg-green-50 border-green-400', 'Berkembang Baik': 'bg-blue-50 border-blue-400', 'Sedang Belajar': 'bg-yellow-50 border-yellow-400', 'Mulai Bertumbuh': 'bg-red-50 border-red-400' };
const PIE_CLR = ['#2fa295', '#3b82f6', '#eecb59', '#ef4444'];
const SKOR_BG = { 4: 'bg-green-100 border-green-400 text-green-700 ring-2 ring-green-300', 3: 'bg-blue-100 border-blue-400 text-blue-700 ring-2 ring-blue-300', 2: 'bg-yellow-100 border-yellow-400 text-yellow-700 ring-2 ring-yellow-300', 1: 'bg-red-100 border-red-400 text-red-700 ring-2 ring-red-300' };

function calcSkor(skor, instrumen) {
  let total = 0, max = 0;
  const perAspek = {};
  instrumen.aspek.forEach(asp => {
    let aspTotal = 0, aspMax = 0;
    asp.indikator.forEach(ind => { aspTotal += skor[ind.no] || 0; aspMax += 4; });
    perAspek[asp.kode] = { total: aspTotal, max: aspMax };
    total += aspTotal; max += aspMax;
  });
  const nilai = max > 0 ? Math.round((total / max) * 100 * 10) / 10 : 0;
  return { total, max, perAspek, nilai, kategori: getKategoriKarakter(nilai) };
}

function katColor(kat) { return KAT_COLORS[kat] || 'bg-gray-100 text-gray-700'; }

const DEFAULT_INSTRUMEN = {
  id: 'inst-cinta-allah', judul: 'Implementasi Nilai Karakter Religius melalui Cinta Allah dan Rasul-Nya', pancaCinta: 'Cinta Allah dan Rasul',
  aspek: [
    { id: 'A', kode: 'A', nama: 'Mensyukuri Nikmat dan Kebaikan Allah', indikator: [
      { no: 1, teks: 'Mengucapkan hamdalah ketika memperoleh keberhasilan atau kebahagiaan.' },
      { no: 2, teks: 'Mengucapkan terima kasih ketika menerima bantuan atau kebaikan.' },
      { no: 3, teks: 'Menjaga kebersihan diri dan lingkungan sebagai bentuk rasa syukur kepada Allah.' },
      { no: 4, teks: 'Menggunakan fasilitas madrasah dengan baik dan tidak merusaknya.' },
      { no: 5, teks: 'Belajar dengan sungguh-sungguh sebagai bentuk rasa syukur kepada Allah.' }
    ]},
    { id: 'B', kode: 'B', nama: 'Meneladani Akhlak Rasulullah SAW', indikator: [
      { no: 6, teks: 'Mengucapkan salam ketika bertemu guru dan teman.' },
      { no: 7, teks: 'Berkata jujur kepada guru, orang tua, dan teman.' },
      { no: 8, teks: 'Bersikap sopan kepada guru dan teman.' },
      { no: 9, teks: 'Mau meminta maaf ketika melakukan kesalahan.' },
      { no: 10, teks: 'Mau memaafkan kesalahan teman.' },
      { no: 11, teks: 'Menepati janji dan melaksanakan tugas yang diberikan.' }
    ]},
    { id: 'C', kode: 'C', nama: 'Membiasakan Beribadah', indikator: [
      { no: 12, teks: 'Berdoa sebelum dan sesudah belajar.' },
      { no: 13, teks: 'Mengikuti salat berjamaah dengan tertib.' },
      { no: 14, teks: "Membaca Al-Qur'an sesuai kemampuan." },
      { no: 15, teks: 'Mengikuti kegiatan keagamaan dengan senang hati.' },
      { no: 16, teks: 'Menjaga ketertiban saat beribadah.' }
    ]}
  ]
};

export default function ObservasiKarakter() {
  const { user } = useAuth();
  const data = getData();
  const [list, setList] = useState(data.observasiKarakter || []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [selectedMurid, setSelectedMurid] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [filterKelas, setFilterKelas] = useState('');
  const [filterPancaCinta, setFilterPancaCinta] = useState('');
  const [activeTab, setActiveTab] = useState('daftar');
  const [perKelasMode, setPerKelasMode] = useState(false);
  const [perKelasKelas, setPerKelasKelas] = useState('');
  const [perKelasForm, setPerKelasForm] = useState({});
  const [perKelasInstrumen, setPerKelasInstrumen] = useState('');

  const kelasList = data.kelas || [];
  const muridList = data.murid || [];
  const instrumenList = (data.instrumenKarakter && data.instrumenKarakter.length > 0) ? data.instrumenKarakter : [DEFAULT_INSTRUMEN];

  const refresh = () => setList(getData().observasiKarakter || []);

  let filtered = list;
  if (user.role === 'guru') filtered = filtered.filter(o => o.guruId === user.guruId);
  else if (user.role === 'kepala_madrasah') filtered = filtered.filter(o => o.madrasahId === user.madrasahId);
  if (search) filtered = filtered.filter(o => (o.muridNama || '').toLowerCase().includes(search.toLowerCase()));
  if (filterKelas) filtered = filtered.filter(o => o.kelasId === filterKelas);
  if (filterPancaCinta) filtered = filtered.filter(o => o.pancaCinta === filterPancaCinta);

  const stats = useMemo(() => {
    const sc = filtered.map(o => calcSkor(o.skor || {}, instrumenList.find(i => i.id === o.instrumenId) || instrumenList[0]));
    return {
      total: filtered.length,
      sudahTerbiasa: sc.filter(s => s.kategori === 'Sudah Terbiasa').length,
      berkembangBaik: sc.filter(s => s.kategori === 'Berkembang Baik').length,
      sedangBelajar: sc.filter(s => s.kategori === 'Sedang Belajar').length,
      mulaiBertumbuh: sc.filter(s => s.kategori === 'Mulai Bertumbuh').length,
    };
  }, [filtered, instrumenList]);

  const muridObservasi = useMemo(() => {
    const map = {};
    filtered.forEach(o => {
      if (!map[o.muridId]) map[o.muridId] = { muridId: o.muridId, muridNama: o.muridNama, nisn: o.nisn, kelasNama: o.kelasNama, observasi: [] };
      const skorData = calcSkor(o.skor || {}, instrumenList.find(i => i.id === o.instrumenId) || instrumenList[0]);
      map[o.muridId].observasi.push({ ...o, _skor: skorData });
    });
    return Object.values(map).sort((a, b) => (a.muridNama || '').localeCompare(b.muridNama || ''));
  }, [filtered, instrumenList]);

  const pieData = useMemo(() => [
    { name: 'Sudah Terbiasa', value: stats.sudahTerbiasa },
    { name: 'Berkembang Baik', value: stats.berkembangBaik },
    { name: 'Sedang Belajar', value: stats.sedangBelajar },
    { name: 'Mulai Bertumbuh', value: stats.mulaiBertumbuh },
  ].filter(d => d.value > 0), [stats]);

  const pancaCintaAvg = useMemo(() => {
    const map = {};
    NILAI_PANCA_CINTA.forEach(pc => { map[pc] = { total: 0, count: 0 }; });
    filtered.forEach(o => {
      const s = calcSkor(o.skor || {}, instrumenList.find(i => i.id === o.instrumenId) || instrumenList[0]);
      if (map[o.pancaCinta]) { map[o.pancaCinta].total += s.nilai; map[o.pancaCinta].count++; }
    });
    return NILAI_PANCA_CINTA.map(pc => ({
      name: pc, avg: map[pc].count > 0 ? Math.round((map[pc].total / map[pc].count) * 10) / 10 : 0, count: map[pc].count,
    })).filter(d => d.count > 0);
  }, [filtered, instrumenList]);

  // Form actions
  const openAdd = () => {
    const today = new Date();
    const inst = instrumenList[0];
    setForm({
      tanggal: today.toISOString().slice(0, 10), bulan: today.getMonth() + 1,
      semester: today.getMonth() < 6 ? 'Genap' : 'Ganjil', tahunPelajaran: '2026/2027',
      muridId: '', muridNama: '', nisn: '',
      kelasId: '', kelasNama: '', madrasahId: '', madrasahNama: '', jenjang: '',
      guruId: user.guruId || '', guruNama: user.nama || '',
      instrumenId: inst?.id || '', pancaCinta: inst?.pancaCinta || NILAI_PANCA_CINTA[0],
      skor: {}, catatan: '', rekomendasiSiswa: '', tindakLanjut: '', eviden: '', status: 'Draft',
    });
    setShowForm(true);
  };

  const openEdit = (o) => {
    setForm({ ...o, skor: { ...(o.skor || {}) }, bulan: o.bulan || (new Date(o.tanggal).getMonth() + 1), semester: o.semester || (new Date(o.tanggal).getMonth() < 6 ? 'Genap' : 'Ganjil') });
    setShowForm(true);
  };

  const openDetail = (o) => {
    const inst = instrumenList.find(i => i.id === o.instrumenId) || instrumenList[0];
    setSelectedDetail({ ...o, _skor: calcSkor(o.skor || {}, inst) });
    setViewMode('detail');
  };

  const onMuridSelect = (muridId) => {
    const m = muridList.find(x => x.id === muridId);
    if (m) {
      const k = kelasList.find(x => x.id === m.kelasId);
      setForm({ ...form, muridId: m.id, muridNama: m.nama, nisn: m.nisn || '', kelasId: m.kelasId, kelasNama: m.kelasNama || k?.nama || '', madrasahId: m.madrasahId || k?.madrasahId || '', madrasahNama: m.madrasahNama || '', jenjang: k?.jenjang || '' });
    }
  };

  const onInstrumenChange = (instId) => {
    const inst = instrumenList.find(i => i.id === instId);
    if (inst) setForm({ ...form, instrumenId: instId, pancaCinta: inst.pancaCinta, skor: {} });
  };

  const setSkor = (no, val) => setForm(f => ({ ...f, skor: { ...f.skor, [no]: val } }));

  const save = (statusOverride) => {
    if (!form.tanggal || !form.muridId || !form.instrumenId) return showToast('Lengkapi murid, instrumen, dan tanggal', 'error');
    const inst = instrumenList.find(i => i.id === form.instrumenId) || instrumenList[0];
    const totalIndikator = inst.aspek.reduce((sum, a) => sum + a.indikator.length, 0);
    const filled = Object.keys(form.skor || {}).length;
    if (filled < totalIndikator) return showToast(`Isi semua ${totalIndikator} indikator (baru ${filled} terisi)`, 'error');
    const s = calcSkor(form.skor, inst);
    const payload = { ...form, status: statusOverride || form.status || 'Draft', rekomendasiSiswa: getRekomendasiKarakter(s.kategori) };
    if (form.id) { updateItem('observasiKarakter', form.id, payload); showToast('Observasi diperbarui', 'success'); }
    else { addItem('observasiKarakter', { ...payload, id: generateId() }); showToast('Observasi ditambahkan', 'success'); }
    refresh(); setShowForm(false);
  };

  const del = (id) => { if (!confirm('Hapus observasi ini?')) return; deleteItem('observasiKarakter', id); refresh(); showToast('Observasi dihapus', 'success'); };

  // Per Kelas
  const startPerKelas = () => { setPerKelasMode(true); setPerKelasKelas(''); setPerKelasInstrumen(instrumenList[0]?.id || ''); setPerKelasForm({}); };

  const muridDiKelas = useMemo(() => {
    if (!perKelasKelas) return [];
    return muridList.filter(m => m.kelasId === perKelasKelas);
  }, [perKelasKelas, muridList]);

  const savePerKelas = () => {
    if (!perKelasKelas || !perKelasInstrumen) return showToast('Pilih kelas dan instrumen', 'error');
    const inst = instrumenList.find(i => i.id === perKelasInstrumen) || instrumenList[0];
    const k = kelasList.find(x => x.id === perKelasKelas);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    let count = 0;
    muridDiKelas.forEach(m => {
      const skorObj = perKelasForm[m.id] || {};
      const totalIndikator = inst.aspek.reduce((sum, a) => sum + a.indikator.length, 0);
      if (Object.keys(skorObj).length < totalIndikator) return;
      const s = calcSkor(skorObj, inst);
      addItem('observasiKarakter', {
        id: generateId(), muridId: m.id, muridNama: m.nama, nisn: m.nisn || '',
        kelasId: perKelasKelas, kelasNama: k?.nama || '',
        madrasahId: k?.madrasahId || m.madrasahId || '', madrasahNama: m.madrasahNama || '',
        jenjang: k?.jenjang || '', guruId: user.guruId || '', guruNama: user.nama || '',
        instrumenId: perKelasInstrumen, pancaCinta: inst.pancaCinta,
        tanggal: todayStr, bulan: today.getMonth() + 1,
        semester: today.getMonth() < 6 ? 'Genap' : 'Ganjil', tahunPelajaran: '2026/2027',
        skor: skorObj, catatan: '', rekomendasiSiswa: getRekomendasiKarakter(s.kategori),
        tindakLanjut: '', eviden: '', status: 'Draft',
      });
      count++;
    });
    refresh(); setPerKelasMode(false);
    showToast(`${count} observasi dibuat untuk ${k?.nama || perKelasKelas}`, 'success');
  };

  const selectedInstrumen = instrumenList.find(i => i.id === form.instrumenId) || instrumenList[0];
  const formCalc = calcSkor(form.skor || {}, selectedInstrumen);

  // ===========================================
  // DETAIL VIEW
  // ===========================================
  if (viewMode === 'detail' && selectedDetail) {
    const d = selectedDetail;
    const inst = instrumenList.find(i => i.id === d.instrumenId) || instrumenList[0];
    const s = d._skor || calcSkor(d.skor || {}, inst);
    const md = data.madrasah.find(m => m.id === d.madrasahId) || {};
    return (
      <div className="space-y-4" id="observasi-print">
        <div className="flex justify-between items-center print:hidden">
          <button onClick={() => { setViewMode('list'); setSelectedDetail(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><X className="w-4 h-4" /> Kembali</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Printer className="w-4 h-4" /> Cetak</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
          <div className="text-center border-b-2 border-[#102a4d] pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#102a4d] uppercase">Lembar Observasi Tumbuh Kembang</h2>
            <h3 className="text-base font-semibold text-gray-700 mt-1">Nilai Karakter Murid</h3>
            <p className="text-sm text-gray-500 mt-1">{md.nama || d.madrasahNama || ''}</p>
            <p className="text-xs text-gray-400">{md.alamat || ''}</p>
          </div>

          <table className="w-full text-sm mb-6">
            <tbody>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-gray-600 w-40">Nama Murid</td><td className="py-2">: {d.muridNama}</td><td className="py-2 pr-4 font-medium text-gray-600 w-32">NISN</td><td className="py-2">: {d.nisn || '-'}</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-gray-600">Kelas</td><td className="py-2">: {d.kelasNama}</td><td className="py-2 pr-4 font-medium text-gray-600">Jenjang</td><td className="py-2">: {d.jenjang || '-'}</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-gray-600">Semester</td><td className="py-2">: {d.semester || '-'}</td><td className="py-2 pr-4 font-medium text-gray-600">Tahun Pelajaran</td><td className="py-2">: {d.tahunPelajaran || '-'}</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-gray-600">Guru Penilai</td><td className="py-2">: {d.guruNama}</td><td className="py-2 pr-4 font-medium text-gray-600">Tanggal</td><td className="py-2">: {formatDate(d.tanggal)}</td></tr>
              <tr><td className="py-2 pr-4 font-medium text-gray-600">Instrumen</td><td className="py-2" colSpan={3}>: {inst.judul}</td></tr>
            </tbody>
          </table>

          <p className="font-semibold text-gray-700 mb-3">Hasil Observasi:</p>
          <div className="space-y-4 mb-6">
            {inst.aspek.map(asp => (
              <div key={asp.kode} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">Aspek {asp.kode}: {asp.nama}</div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 text-xs text-gray-500">
                    <tr><th className="px-3 py-2 text-left w-10">No</th><th className="px-3 py-2 text-left">Indikator</th><th className="px-3 py-2 text-center w-20">Skor</th><th className="px-3 py-2 text-left w-40">Keterangan</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {asp.indikator.map(ind => {
                      const v = d.skor?.[ind.no] || 0;
                      return (<tr key={ind.no}><td className="px-3 py-2 text-center text-gray-500">{ind.no}</td><td className="px-3 py-2 text-gray-700">{ind.teks}</td><td className="px-3 py-2 text-center font-semibold">{v || '-'}</td><td className="px-3 py-2 text-xs text-gray-500">{SKOR_KARAKTER_LABEL[v] || ''}</td></tr>);
                    })}
                    <tr className="bg-gray-50 font-semibold"><td colSpan={2} className="px-3 py-2 text-right text-gray-600">Subtotal Aspek {asp.kode}</td><td className="px-3 py-2 text-center">{s.perAspek[asp.kode]?.total || 0} / {s.perAspek[asp.kode]?.max || 0}</td><td></td></tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-[#102a4d] rounded-lg p-4 text-center"><p className="text-xs text-gray-500 uppercase">Total Skor</p><p className="text-2xl font-bold text-[#102a4d]">{s.total} / {s.max}</p></div>
            <div className="border-2 border-[#102a4d] rounded-lg p-4 text-center"><p className="text-xs text-gray-500 uppercase">Nilai Akhir</p><p className="text-2xl font-bold text-[#102a4d]">{s.nilai}</p></div>
            <div className={`border-2 rounded-lg p-4 text-center ${KAT_BG[s.kategori] || 'bg-gray-50 border-gray-300'}`}><p className="text-xs text-gray-500 uppercase mb-1">Kategori</p><span className={`px-3 py-1 rounded-full text-sm font-semibold ${katColor(s.kategori)}`}>{s.kategori}</span></div>
          </div>

          {s.kategori && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-sm text-yellow-800 mb-1">Rekomendasi:</p>
              <p className="text-sm text-yellow-700">{getRekomendasiKarakter(s.kategori)}</p>
            </div>
          )}

          {(d.catatan || d.tindakLanjut) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {d.catatan && <div><p className="font-semibold text-sm text-gray-700 mb-1">Catatan:</p><p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{d.catatan}</p></div>}
              {d.tindakLanjut && <div><p className="font-semibold text-sm text-gray-700 mb-1">Tindak Lanjut:</p><p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{d.tindakLanjut}</p></div>}
            </div>
          )}

          <div className="flex justify-end mt-12 pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{d.kelasNama || ''}, {formatDate(d.tanggal)}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">Guru Penilai,</p>
              <div className="mt-16"></div>
              <p className="text-sm font-bold text-gray-800 underline">{d.guruNama}</p>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 mt-12 pt-6 border-t print:block hidden">Dokumen ini dihasilkan oleh SiJurnal Cinta Guru — Lembar Observasi Karakter Murid</div>
        </div>
      </div>
    );
  }

  // ===========================================
  // PER KELAS MODE
  // ===========================================
  if (perKelasMode) {
    const pkInst = instrumenList.find(i => i.id === perKelasInstrumen) || instrumenList[0];
    const allInd = pkInst.aspek.reduce((arr, a) => arr.concat(a.indikator), []);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-gray-800">Observasi Per Kelas</h2><p className="text-sm text-gray-500">Isi observasi untuk seluruh murid dalam satu kelas sekaligus</p></div>
          <button onClick={() => setPerKelasMode(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><X className="w-4 h-4" /> Batal</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
              <select value={perKelasKelas} onChange={e => { setPerKelasKelas(e.target.value); setPerKelasForm({}); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.filter(k => { if (user.role === 'kepala_madrasah') return k.madrasahId === user.madrasahId; return true; }).map(k => <option key={k.id} value={k.id}>{k.nama} ({k.jenjang || ''})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Instrumen</label>
              <select value={perKelasInstrumen} onChange={e => setPerKelasInstrumen(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                {instrumenList.map(inst => <option key={inst.id} value={inst.id}>{inst.judul}</option>)}
              </select>
            </div>
          </div>

          {perKelasKelas && muridDiKelas.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left border border-gray-200 sticky left-0 bg-gray-50 z-10 whitespace-nowrap min-w-[140px]">Nama Murid</th>
                    {allInd.map(ind => <th key={ind.no} className="px-1 py-2 text-center border border-gray-200 w-10"><span className="block text-[10px] text-gray-500">{ind.no}</span></th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {muridDiKelas.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-2 py-1 border border-gray-200 sticky left-0 bg-white font-medium text-gray-800 whitespace-nowrap">{m.nama}</td>
                      {allInd.map(ind => {
                        const val = (perKelasForm[m.id] || {})[ind.no] || 0;
                        const cls = val ? (SKOR_BG[val] || 'border-gray-200') : 'border-gray-200 text-gray-400 bg-white';
                        return (
                          <td key={ind.no} className="px-0.5 py-1 border border-gray-200 text-center">
                            <select value={val} onChange={e => setPerKelasForm(f => ({ ...f, [m.id]: { ...(f[m.id] || {}), [ind.no]: parseInt(e.target.value) } }))} className={`text-xs w-10 px-0 py-1 rounded border text-center outline-none ${cls}`}>
                              <option value={0} className="text-gray-400">-</option>
                              <option value={4}>4</option><option value={3}>3</option><option value={2}>2</option><option value={1}>1</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {perKelasKelas && muridDiKelas.length === 0 && <div className="text-center py-8 text-gray-400">Tidak ada murid di kelas ini</div>}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={() => setPerKelasMode(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button>
            <button onClick={savePerKelas} disabled={!perKelasKelas} className="px-6 py-2 bg-[#2fa295] text-white rounded-lg text-sm font-medium hover:bg-[#248a7d] disabled:opacity-50 flex items-center gap-2"><Save className="w-4 h-4" /> Simpan Semua</button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // LIST VIEW
  // ===========================================
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Observasi Tumbuh Kembang Nilai Karakter Murid</h2>
        <p className="text-sm text-gray-500 mt-1">Pantau perkembangan karakter siswa berdasarkan instrumen Panca Cinta secara komprehensif</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[#102a4d]/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-[#102a4d]" /></div><div><p className="text-2xl font-bold text-gray-800">{stats.total}</p><p className="text-xs text-gray-500">Total Observasi</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 border-l-[#2fa295]"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-[#2fa295]" /></div><div><p className="text-2xl font-bold text-[#2fa295]">{stats.sudahTerbiasa}</p><p className="text-xs text-gray-500">Sudah Terbiasa</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 border-l-blue-500"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-blue-700">{stats.berkembangBaik}</p><p className="text-xs text-gray-500">Berkembang Baik</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 border-l-yellow-500"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-yellow-600" /></div><div><p className="text-2xl font-bold text-yellow-700">{stats.sedangBelajar}</p><p className="text-xs text-gray-500">Sedang Belajar</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 border-l-red-500"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-700">{stats.mulaiBertumbuh}</p><p className="text-xs text-gray-500">Mulai Bertumbuh</p></div></div></div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Cari nama murid..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" /></div>
        <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Semua Kelas</option>{kelasList.filter(k => { if (user.role === 'kepala_madrasah') return k.madrasahId === user.madrasahId; return true; }).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
        <select value={filterPancaCinta} onChange={e => setFilterPancaCinta(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option value="">Semua Panca Cinta</option>{NILAI_PANCA_CINTA.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <div className="flex-1" />
        <button onClick={openAdd} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Plus className="w-4 h-4" /> Tambah Observasi</button>
        <button onClick={startPerKelas} className="px-4 py-2 bg-[#2fa295] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#248a7d]"><Users className="w-4 h-4" /> Observasi Per Kelas</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('daftar')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'daftar' ? 'border-[#102a4d] text-[#102a4d]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Daftar Observasi</button>
        <button onClick={() => setActiveTab('riwayat')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-[#102a4d] text-[#102a4d]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Riwayat Per Murid</button>
        <button onClick={() => setActiveTab('grafik')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'grafik' ? 'border-[#102a4d] text-[#102a4d]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Grafik Perkembangan</button>
      </div>

      {/* Tab: Daftar Observasi */}
      {activeTab === 'daftar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Murid</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Instrumen</th>
                <th className="px-4 py-3 text-center">Skor</th>
                <th className="px-4 py-3 text-center">Nilai</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((o, idx) => {
                const inst = instrumenList.find(i => i.id === o.instrumenId) || instrumenList[0];
                const s = calcSkor(o.skor || {}, inst);
                const inisial = ((o.muridNama || '').match(/\b\w/g) || []).slice(0, 2).join('');
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(o.tanggal)}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#102a4d]/10 text-[#102a4d] flex items-center justify-center text-xs font-bold">{inisial}</span><span className="font-medium text-gray-800">{o.muridNama}</span></div></td>
                    <td className="px-4 py-3 text-gray-600">{o.kelasNama}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{o.pancaCinta?.replace('Cinta ', '')}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-800">{s.total} / {s.max}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{s.nilai}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${katColor(s.kategori)}`}>{s.kategori}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[o.status] || STATUS_BADGE.Draft}`}>{o.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openDetail(o)} title="Lihat" className="p-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(o)} title="Edit" className="p-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del(o.id)} title="Hapus" className="p-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Belum ada data observasi karakter</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Riwayat Per Murid */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          {muridObservasi.length === 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">Belum ada data riwayat</div>}
          {muridObservasi.map(m => {
            const avgNilai = m.observasi.reduce((sum, o) => sum + (o._skor?.nilai || 0), 0) / m.observasi.length;
            const pct = Math.min(avgNilai, 100);
            return (
              <div key={m.muridId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMurid(m)}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#102a4d]/10 text-[#102a4d] flex items-center justify-center text-sm font-bold">{(m.muridNama || '').match(/\b\w/g)?.slice(0, 2).join('') || '?'}</span>
                    <div><p className="font-semibold text-gray-800">{m.muridNama}</p><p className="text-xs text-gray-500">{m.nisn} &middot; {m.kelasNama} &middot; {m.observasi.length} observasi</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-[#2fa295]" style={{ width: `${pct}%` }} /></div>
                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{Math.round(avgNilai)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Riwayat Modal */}
          {selectedMurid && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMurid(null)}>
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                  <h3 className="font-semibold">Riwayat Observasi: {selectedMurid.muridNama}</h3>
                  <button onClick={() => setSelectedMurid(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 space-y-4">
                  {selectedMurid.observasi.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={selectedMurid.observasi.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)).map(o => ({ date: formatDate(o.tanggal), nilai: o._skor?.nilai || 0, kategori: o._skor?.kategori || '' }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="nilai" stroke="#102a4d" strokeWidth={2} dot={{ fill: '#102a4d', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-2">
                    {selectedMurid.observasi.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)).map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <div><p className="text-sm font-medium text-gray-800">{formatDate(o.tanggal)}</p><p className="text-xs text-gray-500">{o.pancaCinta}</p></div>
                        <div className="flex items-center gap-3"><span className="text-sm font-semibold text-gray-700">{o._skor?.nilai}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${katColor(o._skor?.kategori)}`}>{o._skor?.kategori}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Grafik Perkembangan */}
      {activeTab === 'grafik' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-700 mb-4">Distribusi Kategori</h4>
            {pieData.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, idx) => <Cell key={idx} fill={PIE_CLR[idx % 4]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="text-center py-12 text-gray-400">Belum ada data</div>}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-700 mb-4">Rata-rata Nilai per Panca Cinta</h4>
            {pancaCintaAvg.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pancaCintaAvg} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={115} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#102a4d" radius={[0, 4, 4, 0]} name="Rata-rata Nilai" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-center py-12 text-gray-400">Belum ada data</div>}
          </div>
        </div>
      )}

      {/* ====== FORM MODAL ====== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-20">
              <h3 className="font-semibold text-lg">{form.id ? 'Edit' : 'Tambah'} Observasi Karakter</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 space-y-4">
              {/* Identitas Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Identitas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Murid</label>
                    <select value={form.muridId || ''} onChange={e => onMuridSelect(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                      <option value="">-- Pilih Murid --</option>
                      {muridList.filter(m => { if (user.role === 'kepala_madrasah') return m.madrasahId === user.madrasahId; return true; }).map(m => <option key={m.id} value={m.id}>{m.nama} ({m.nisn || '-'})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
                    <input type="text" value={form.kelasNama || ''} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
                    <input type="date" value={form.tanggal || ''} onChange={e => setForm({ ...form, tanggal: e.target.value, bulan: new Date(e.target.value).getMonth() + 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bulan</label>
                    <input type="text" value={BULAN_NAMA[form.bulan - 1] || ''} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
                    <select value={form.semester || ''} onChange={e => setForm({ ...form, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                      <option>Ganjil</option><option>Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Pelajaran</label>
                    <input type="text" value={form.tahunPelajaran || ''} onChange={e => setForm({ ...form, tahunPelajaran: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Madrasah</label>
                    <input type="text" value={form.madrasahNama || ''} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jenjang</label>
                    <input type="text" value={form.jenjang || ''} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Guru</label>
                    <input type="text" value={form.guruNama || ''} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Pilih Instrumen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Instrumen</label>
                <select value={form.instrumenId || ''} onChange={e => onInstrumenChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none">
                  {instrumenList.map(inst => <option key={inst.id} value={inst.id}>{inst.judul}</option>)}
                </select>
              </div>

              {/* Aspek & Indikator Scoring */}
              <div className="space-y-4">
                {selectedInstrumen.aspek.map(asp => (
                  <div key={asp.kode} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-semibold text-sm text-gray-700 flex justify-between items-center">
                      <span>Aspek {asp.kode}: {asp.nama}</span>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Subtotal: {formCalc.perAspek[asp.kode]?.total || 0} / {formCalc.perAspek[asp.kode]?.max || 0}</span>
                    </div>
                    <div className="p-2 space-y-1">
                      {asp.indikator.map(ind => {
                        const v = form.skor?.[ind.no] || 0;
                        return (
                          <div key={ind.no} className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded">
                            <span className="w-6 text-center text-xs font-medium text-gray-500">{ind.no}</span>
                            <span className="flex-1 text-sm text-gray-700">{ind.teks}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map(skorVal => (
                                <label key={skorVal} className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium border-2 transition-all ${v === skorVal ? (skorVal === 4 ? 'bg-green-100 border-green-500 text-green-700 ring-2 ring-green-300' : skorVal === 3 ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300' : skorVal === 2 ? 'bg-yellow-100 border-yellow-500 text-yellow-700 ring-2 ring-yellow-300' : 'bg-red-100 border-red-500 text-red-700 ring-2 ring-red-300') : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'}`}>
                                  <input type="radio" name={`skor-${ind.no}`} value={skorVal} checked={v === skorVal} onChange={() => setSkor(ind.no, skorVal)} className="sr-only" />
                                  {skorVal}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-calculated Panel */}
              <div className="bg-gray-50 rounded-lg p-4 border space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Ringkasan Skor</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formCalc.perAspek).map(([kode, v]) => (
                    <span key={kode} className="px-3 py-1 bg-white border rounded-lg text-sm font-medium">
                      Aspek {kode}: <span className="font-bold">{v.total}/{v.max}</span>
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border"><p className="text-xs text-gray-500">Total Skor</p><p className="text-lg font-bold text-[#102a4d]">{formCalc.total} / {formCalc.max}</p></div>
                  <div className="bg-white rounded-lg p-3 text-center border"><p className="text-xs text-gray-500">Nilai Akhir</p><p className="text-lg font-bold text-[#102a4d]">{formCalc.nilai}</p></div>
                  <div className={`rounded-lg p-3 text-center border ${formCalc.kategori ? KAT_BG[formCalc.kategori] || 'bg-white' : 'bg-white'}`}><p className="text-xs text-gray-500">Kategori</p><span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${katColor(formCalc.kategori)}`}>{formCalc.kategori || '-'}</span></div>
                </div>
                {formCalc.kategori && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Rekomendasi (auto):</p>
                    <p className="text-xs text-yellow-600">{getRekomendasiKarakter(formCalc.kategori)}</p>
                  </div>
                )}
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label><textarea value={form.catatan || ''} onChange={e => setForm({ ...form, catatan: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Rencana Tindak Lanjut</label><textarea value={form.tindakLanjut || ''} onChange={e => setForm({ ...form, tindakLanjut: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Eviden</label><input type="text" value={form.eviden || ''} onChange={e => setForm({ ...form, eviden: e.target.value })} placeholder="URL atau deskripsi eviden" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status || 'Draft'} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"><option>Draft</option><option>Dikirim</option><option>Disetujui</option><option>Perlu Revisi</option></select></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white z-20">
              <button onClick={() => save('Draft')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan Draft</button>
              <button onClick={() => save('Dikirim')} className="flex-1 py-2.5 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b] flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Kirim Validasi</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
