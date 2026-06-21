import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getData, formatDate, getKategoriSkor, getKategoriPembiasaan, getKategoriKarakter, BULAN_NAMA, NILAI_PANCA_CINTA, TAHAPAN_PEMBIASAAN, TOTAL_KEGIATAN_HARIAN, getDaysInMonth } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { Printer, Download, Search, BarChart3, FileText, Filter, ChevronRight, Users, Heart, BookOpen, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

function showToast(msg, type) {
  const el = document.createElement('div');
  el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function downloadCSV(rows, filename) {
  const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const PIE_COLORS = ['#2fa295', '#102a4d', '#eecb59', '#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c'];

const STATUS_COLORS = {
  'Disetujui': 'bg-green-100 text-green-700',
  'Dikirim': 'bg-yellow-100 text-yellow-700',
  'Perlu Revisi': 'bg-red-100 text-red-700',
  'Draft': 'bg-gray-100 text-gray-700',
};

const KATEGORI_KARAKTER_COLORS = {
  'Sudah Terbiasa': 'bg-green-100 text-green-700',
  'Berkembang Baik': 'bg-blue-100 text-blue-700',
  'Sedang Belajar': 'bg-yellow-100 text-yellow-700',
  'Mulai Bertumbuh': 'bg-red-100 text-red-700',
};

const KATEGORI_PEMBIASAAN_COLORS = {
  'Sangat Konsisten': 'bg-green-100 text-green-700',
  'Konsisten': 'bg-blue-100 text-blue-700',
  'Mulai Konsisten': 'bg-yellow-100 text-yellow-700',
  'Perlu Pembiasaan': 'bg-red-100 text-red-700',
};

const TABS = [
  { key: 'jurnal-pembelajaran', label: 'Jurnal Pembelajaran' },
  { key: 'pembiasaan-harian', label: 'Pembiasaan Harian' },
  { key: 'observasi-karakter', label: 'Observasi Karakter' },
  { key: 'panca-cinta', label: 'Panca Cinta' },
  { key: 'eviden', label: 'Eviden' },
  { key: 'validasi-kepala', label: 'Validasi Kepala' },
  { key: 'validasi-pengawas', label: 'Validasi Pengawas' },
  { key: 'semester', label: 'Laporan Semester' },
];

export default function RekapInstrumen() {
  const { user } = useAuth();
  const data = getData();
  const [jenis, setJenis] = useState('jurnal-pembelajaran');
  const [filters, setFilters] = useState({
    bulan: '', semester: '', tahunPelajaran: '', guruId: '', kelasId: '', muridId: '',
    madrasahId: '', jenjang: '', pancaCinta: '', statusValidasi: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const guruList = data.guru || [];
  const kelasList = data.kelas || [];
  const muridList = data.murid || [];
  const madrasahList = data.madrasah || [];

  // role-scoped
  const jurnalHarian = useMemo(() => {
    let l = data.jurnalHarian || [];
    if (user.role === 'guru') l = l.filter(j => j.guruId === user.guruId);
    else if (user.role === 'kepala_madrasah') l = l.filter(j => j.madrasahId === user.madrasahId);
    return l;
  }, [data.jurnalHarian, user]);

  const pembiasaanHarian = useMemo(() => {
    let l = data.pembiasaanHarian || [];
    if (user.role === 'guru') l = l.filter(p => p.guruId === user.guruId);
    else if (user.role === 'kepala_madrasah') l = l.filter(p => p.madrasahId === user.madrasahId);
    return l;
  }, [data.pembiasaanHarian, user]);

  const observasiKarakter = useMemo(() => {
    let l = data.observasiKarakter || [];
    if (user.role === 'guru') l = l.filter(o => o.guruId === user.guruId);
    else if (user.role === 'kepala_madrasah') l = l.filter(o => o.madrasahId === user.madrasahId);
    return l;
  }, [data.observasiKarakter, user]);

  const eviden = useMemo(() => {
    let l = data.eviden || [];
    if (user.role === 'guru' || user.role === 'kepala_madrasah') {
      const myJurnal = jurnalHarian.map(j => j.id);
      l = l.filter(e => !e.jurnalId || myJurnal.includes(e.jurnalId));
    }
    return l;
  }, [data.eviden, jurnalHarian, user]);

  const validasi = useMemo(() => {
    let l = data.validasi || [];
    if (user.role === 'guru' || user.role === 'kepala_madrasah') {
      const myJurnal = jurnalHarian.map(j => j.id);
      l = l.filter(v => myJurnal.includes(v.jurnalId));
    }
    return l;
  }, [data.validasi, jurnalHarian, user]);

  // apply user filters
  const applyFilter = (arr) => {
    let res = arr;
    if (filters.guruId) res = res.filter(x => x.guruId === filters.guruId);
    if (filters.kelasId) res = res.filter(x => x.kelasId === filters.kelasId);
    if (filters.madrasahId) res = res.filter(x => x.madrasahId === filters.madrasahId);
    if (filters.jenjang) res = res.filter(x => x.jenjang === filters.jenjang || (madrasahList.find(m => m.id === x.madrasahId)?.jenjang === filters.jenjang));
    return res;
  };

  const filteredJurnal = useMemo(() => {
    let l = jurnalHarian;
    if (filters.bulan) l = l.filter(j => new Date(j.tanggal).getMonth() + 1 === Number(filters.bulan));
    if (filters.semester) l = l.filter(j => j.semester === filters.semester);
    if (filters.tahunPelajaran) l = l.filter(j => j.tahunPelajaran === filters.tahunPelajaran);
    if (filters.pancaCinta) l = l.filter(j => (j.pancaCinta || []).includes(filters.pancaCinta));
    if (filters.statusValidasi) l = l.filter(j => j.status === filters.statusValidasi);
    return applyFilter(l);
  }, [jurnalHarian, filters, madrasahList]);

  const filteredPembiasaan = useMemo(() => {
    let l = pembiasaanHarian;
    if (filters.bulan) l = l.filter(p => p.bulan === Number(filters.bulan));
    if (filters.semester) l = l.filter(p => p.semester === filters.semester);
    if (filters.tahunPelajaran) l = l.filter(p => p.tahunPelajaran === filters.tahunPelajaran);
    if (filters.statusValidasi) l = l.filter(p => p.status === filters.statusValidasi);
    return applyFilter(l);
  }, [pembiasaanHarian, filters, madrasahList]);

  const filteredObservasi = useMemo(() => {
    let l = observasiKarakter;
    if (filters.bulan) l = l.filter(o => o.bulan === Number(filters.bulan));
    if (filters.semester) l = l.filter(o => o.semester === filters.semester);
    if (filters.tahunPelajaran) l = l.filter(o => o.tahunPelajaran === filters.tahunPelajaran);
    if (filters.pancaCinta) l = l.filter(o => o.pancaCinta === filters.pancaCinta);
    if (filters.muridId) l = l.filter(o => o.muridId === filters.muridId);
    return applyFilter(l);
  }, [observasiKarakter, filters, madrasahList]);

  const filteredEviden = useMemo(() => {
    let l = eviden;
    if (filters.bulan) l = l.filter(e => new Date(e.tanggal).getMonth() + 1 === Number(filters.bulan));
    return applyFilter(l);
  }, [eviden, filters, madrasahList]);

  const filteredValidasi = useMemo(() => applyFilter(validasi), [validasi, filters, madrasahList]);

  // --- computed stats ---
  const jurnalGuruStats = useMemo(() => {
    const stats = {};
    guruList.forEach(g => { stats[g.id] = { id: g.id, nama: g.nama, madrasahId: g.madrasahId, total: 0, disetujui: 0, dikirim: 0, draft: 0, revisi: 0 }; });
    filteredJurnal.forEach(j => {
      const s = stats[j.guruId];
      if (!s) return;
      s.total++;
      if (j.status === 'Disetujui') s.disetujui++;
      else if (j.status === 'Dikirim') s.dikirim++;
      else if (j.status === 'Draft') s.draft++;
      else if (j.status === 'Perlu Revisi') s.revisi++;
    });
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [filteredJurnal, guruList]);

  const pembiasaanStats = useMemo(() => {
    const rows = [];
    const grouped = {};
    filteredPembiasaan.forEach(p => {
      const key = `${p.guruId}-${p.bulan}-${p.tahun}`;
      if (!grouped[key]) grouped[key] = { ...p, checked: 0, total: 0 };
      const checklist = p.checklist || {};
      let checkedCount = 0, totalCount = 0;
      Object.keys(checklist).forEach(tId => {
        Object.keys(checklist[tId]).forEach(kIdx => {
          Object.keys(checklist[tId][kIdx]).forEach(day => {
            totalCount++;
            if (checklist[tId][kIdx][day]) checkedCount++;
          });
        });
      });
      grouped[key].checked += checkedCount;
      grouped[key].total += totalCount;
    });
    Object.values(grouped).forEach(row => {
      row.pct = row.total > 0 ? Math.round((row.checked / row.total) * 100) : 0;
      row.kategori = getKategoriPembiasaan(row.pct);
    });
    return Object.values(grouped).sort((a, b) => b.pct - a.pct);
  }, [filteredPembiasaan]);

  const observasiStats = useMemo(() => {
    return filteredObservasi.map(o => {
      const skorVals = Object.values(o.skor || {});
      const totalSkor = skorVals.reduce((a, b) => a + b, 0);
      const maxSkor = skorVals.length * 4;
      const nilaiAkhir = maxSkor > 0 ? Math.round((totalSkor / maxSkor) * 100) : 0;
      const kategori = getKategoriKarakter(nilaiAkhir);
      const kelas = kelasList.find(k => k.id === o.kelasId);
      const instrumen = (data.instrumenKarakter || []).find(i => i.id === o.instrumenId);
      return { ...o, nilaiAkhir, kategori, kelasNama: kelas?.nama || o.kelasNama, instrumenNama: instrumen?.judul || o.pancaCinta };
    });
  }, [filteredObservasi, kelasList, data.instrumenKarakter]);

  const pancaCintaStats = useMemo(() => {
    const counts = {};
    filteredJurnal.forEach(j => (j.pancaCinta || []).forEach(pc => { counts[pc] = (counts[pc] || 0) + 1; }));
    filteredObservasi.forEach(o => { if (o.pancaCinta) counts[o.pancaCinta] = (counts[o.pancaCinta] || 0) + 1; });
    return Object.entries(counts).map(([nama, jumlah]) => ({ nama, jumlah })).sort((a, b) => b.jumlah - a.jumlah);
  }, [filteredJurnal, filteredObservasi]);

  const validasiKepala = useMemo(() => filteredValidasi.filter(v => v.validatorRole === 'Kepala Madrasah'), [filteredValidasi]);
  const validasiPengawas = useMemo(() => filteredValidasi.filter(v => v.validatorRole === 'Pengawas'), [filteredValidasi]);

  const avgPembiasaanPct = useMemo(() => {
    if (pembiasaanStats.length === 0) return 0;
    return Math.round(pembiasaanStats.reduce((s, r) => s + r.pct, 0) / pembiasaanStats.length);
  }, [pembiasaanStats]);

  const guruAktifSet = useMemo(() => new Set(filteredPembiasaan.map(p => p.guruId)), [filteredPembiasaan]);
  const avgNilaiKarakter = useMemo(() => {
    if (observasiStats.length === 0) return 0;
    return Math.round(observasiStats.reduce((s, o) => s + o.nilaiAkhir, 0) / observasiStats.length);
  }, [observasiStats]);

  const observasiKategoriDist = useMemo(() => {
    const dist = { 'Sudah Terbiasa': 0, 'Berkembang Baik': 0, 'Sedang Belajar': 0, 'Mulai Bertumbuh': 0 };
    observasiStats.forEach(o => { dist[o.kategori] = (dist[o.kategori] || 0) + 1; });
    return Object.entries(dist).map(([nama, value]) => ({ nama, value })).filter(d => d.value > 0);
  }, [observasiStats]);

  const topGuru = useMemo(() => pembiasaanStats.sort((a, b) => b.pct - a.pct).slice(0, 5), [pembiasaanStats]);
  const topKelas = useMemo(() => {
    const kelasCount = {};
    filteredPembiasaan.forEach(p => {
      if (!kelasCount[p.kelasId]) kelasCount[p.kelasId] = { kelasId: p.kelasId, kelasNama: p.kelasNama, totalPct: 0, count: 0 };
      kelasCount[p.kelasId].totalPct += p.pct;
      kelasCount[p.kelasId].count++;
    });
    return Object.values(kelasCount).map(k => ({ ...k, avgPct: Math.round(k.totalPct / k.count) })).sort((a, b) => b.avgPct - a.avgPct).slice(0, 5);
  }, [filteredPembiasaan]);

  const topPancaCinta = useMemo(() => pancaCintaStats.slice(0, 5), [pancaCintaStats]);

  const muridPerluDampingan = useMemo(() => observasiStats.filter(o => o.kategori === 'Mulai Bertumbuh' || o.kategori === 'Sedang Belajar'), [observasiStats]);

  const uniqTahunPelajaran = useMemo(() => {
    const s = new Set();
    [...jurnalHarian, ...pembiasaanHarian, ...observasiKarakter].forEach(x => { if (x.tahunPelajaran) s.add(x.tahunPelajaran); });
    return [...s].sort();
  }, []);

  const uniqSemester = useMemo(() => {
    const s = new Set();
    [...jurnalHarian, ...pembiasaanHarian, ...observasiKarakter].forEach(x => { if (x.semester) s.add(x.semester); });
    return [...s].sort();
  }, []);

  // ---- CSV export ----
  const doExport = () => {
    let csvRows, fn;
    if (jenis === 'jurnal-pembelajaran') {
      csvRows = [['No', 'Nama Guru', 'Madrasah', 'Total', 'Disetujui', 'Dikirim', 'Draft', 'Revisi']];
      jurnalGuruStats.forEach((g, i) => { const m = madrasahList.find(x => x.id === g.madrasahId); csvRows.push([i + 1, g.nama, m?.nama || '-', g.total, g.disetujui, g.dikirim, g.draft, g.revisi]); });
      fn = 'rekap-jurnal-pembelajaran';
    } else if (jenis === 'pembiasaan-harian') {
      csvRows = [['No', 'Guru', 'Madrasah', 'Bulan-Tahun', 'Total Kegiatan', 'Tercentang', '% Keterlaksanaan', 'Kategori', 'Status Validasi']];
      pembiasaanStats.forEach((p, i) => { const m = madrasahList.find(x => x.id === p.madrasahId); csvRows.push([i + 1, p.guruNama, m?.nama || '-', `${BULAN_NAMA[(p.bulan || 1) - 1]} ${p.tahun}`, p.total, p.checked, p.pct + '%', p.kategori, p.status || '-']); });
      fn = 'rekap-pembiasaan-harian';
    } else if (jenis === 'observasi-karakter') {
      csvRows = [['No', 'Murid', 'Kelas', 'Instrumen', 'Nilai Akhir', 'Kategori', 'Guru', 'Tanggal', 'Status']];
      observasiStats.forEach((o, i) => csvRows.push([i + 1, o.muridNama, o.kelasNama, o.instrumenNama, o.nilaiAkhir + '/100', o.kategori, o.guruNama, formatDate(o.tanggal), o.status || '-']));
      fn = 'rekap-observasi-karakter';
    } else if (jenis === 'panca-cinta') {
      csvRows = [['Nilai Panca Cinta', 'Jumlah Penerapan']];
      pancaCintaStats.forEach(p => csvRows.push([p.nama, p.jumlah]));
      fn = 'rekap-panca-cinta';
    } else if (jenis === 'eviden') {
      csvRows = [['No', 'Judul', 'Jenis', 'Tanggal', 'Jurnal Terkait', 'Guru']];
      filteredEviden.forEach((e, i) => { const j = data.jurnalHarian.find(x => x.id === e.jurnalId); csvRows.push([i + 1, e.judul, e.jenis, formatDate(e.tanggal), j ? `${j.materi} - ${formatDate(j.tanggal)}` : '-', j?.guruNama || '-']); });
      fn = 'rekap-eviden';
    } else if (jenis === 'validasi-kepala') {
      csvRows = [['No', 'Validator', 'Guru', 'Total Skor', 'Kategori', 'Status', 'Tanggal', 'Catatan']];
      validasiKepala.forEach((v, i) => { const j = data.jurnalHarian.find(x => x.id === v.jurnalId); csvRows.push([i + 1, v.validatorNama, j?.guruNama || '-', v.totalSkor, v.kategori, v.status, formatDate(v.tanggal), v.catatanApresiasi || '']); });
      fn = 'rekap-validasi-kepala';
    } else if (jenis === 'validasi-pengawas') {
      csvRows = [['No', 'Validator', 'Guru', 'Total Skor', 'Kategori', 'Status', 'Tanggal', 'Catatan']];
      validasiPengawas.forEach((v, i) => { const j = data.jurnalHarian.find(x => x.id === v.jurnalId); csvRows.push([i + 1, v.validatorNama, j?.guruNama || '-', v.totalSkor, v.kategori, v.status, formatDate(v.tanggal), v.catatanApresiasi || '']); });
      fn = 'rekap-validasi-pengawas';
    } else { return; }
    downloadCSV(csvRows, `${fn}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // ---- tab content renderers ----
  const renderJurnalPembelajaran = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#102a4d]/10"><FileText className="w-5 h-5 text-[#102a4d]" /></div>
          <div><p className="text-xs text-gray-500">Total Jurnal</p><p className="text-xl font-bold text-[#102a4d]">{filteredJurnal.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50"><CheckCircle className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Disetujui</p><p className="text-xl font-bold text-green-600">{filteredJurnal.filter(j => j.status === 'Disetujui').length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-50"><BarChart3 className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-xs text-gray-500">Dikirim</p><p className="text-xl font-bold text-yellow-600">{filteredJurnal.filter(j => j.status === 'Dikirim').length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50"><FileText className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-gray-500">Perlu Revisi</p><p className="text-xl font-bold text-red-600">{filteredJurnal.filter(j => j.status === 'Perlu Revisi').length}</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Nama Guru</th>
              <th className="px-4 py-3">Madrasah</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center">Disetujui</th>
              <th className="px-4 py-3 text-center">Dikirim</th>
              <th className="px-4 py-3 text-center">Draft</th>
              <th className="px-4 py-3 text-center">Revisi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jurnalGuruStats.map((g, i) => {
              const m = madrasahList.find(x => x.id === g.madrasahId);
              return (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{g.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{m?.nama || '-'}</td>
                  <td className="px-4 py-3 text-center font-semibold">{g.total}</td>
                  <td className="px-4 py-3 text-center text-green-600">{g.disetujui}</td>
                  <td className="px-4 py-3 text-center text-yellow-600">{g.dikirim}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{g.draft}</td>
                  <td className="px-4 py-3 text-center text-red-600">{g.revisi}</td>
                </tr>
              );
            })}
            {jurnalGuruStats.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPembiasaanHarian = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#102a4d]/10"><Users className="w-5 h-5 text-[#102a4d]" /></div>
          <div><p className="text-xs text-gray-500">Guru Aktif</p><p className="text-xl font-bold text-[#102a4d]">{guruAktifSet.size} / {guruList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2fa295]/10"><BarChart3 className="w-5 h-5 text-[#2fa295]" /></div>
          <div><p className="text-xs text-gray-500">Rata-rata Keterlaksanaan</p><p className="text-xl font-bold text-[#2fa295]">{avgPembiasaanPct}%</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50"><CheckCircle className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Sangat Konsisten</p><p className="text-xl font-bold text-green-600">{pembiasaanStats.filter(p => p.kategori === 'Sangat Konsisten').length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50"><FileText className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-gray-500">Perlu Pembiasaan</p><p className="text-xl font-bold text-red-600">{pembiasaanStats.filter(p => p.kategori === 'Perlu Pembiasaan').length}</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Guru</th>
              <th className="px-4 py-3">Madrasah</th>
              <th className="px-4 py-3">Bulan - Tahun</th>
              <th className="px-4 py-3 text-center">Total Kegiatan</th>
              <th className="px-4 py-3 text-center">Tercentang</th>
              <th className="px-4 py-3 text-center">%</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pembiasaanStats.map((p, i) => {
              const m = madrasahList.find(x => x.id === p.madrasahId);
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.guruNama}</td>
                  <td className="px-4 py-3 text-gray-600">{m?.nama || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{BULAN_NAMA[(p.bulan || 1) - 1]} {p.tahun}</td>
                  <td className="px-4 py-3 text-center font-semibold">{p.total}</td>
                  <td className="px-4 py-3 text-center text-[#2fa295] font-semibold">{p.checked}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#102a4d]">{p.pct}%</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${KATEGORI_PEMBIASAAN_COLORS[p.kategori] || ''}`}>{p.kategori}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || STATUS_COLORS.Draft}`}>{p.status || '-'}</span></td>
                </tr>
              );
            })}
            {pembiasaanStats.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Belum ada data pembiasaan harian</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderObservasiKarakter = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#eecb59]/20"><Heart className="w-5 h-5 text-[#eecb59]" /></div>
          <div><p className="text-xs text-gray-500">Total Observasi</p><p className="text-xl font-bold text-[#eecb59]">{observasiStats.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2fa295]/10"><BarChart3 className="w-5 h-5 text-[#2fa295]" /></div>
          <div><p className="text-xs text-gray-500">Rata-rata Nilai</p><p className="text-xl font-bold text-[#2fa295]">{avgNilaiKarakter}/100</p></div>
        </div>
        {['Sudah Terbiasa', 'Berkembang Baik', 'Sedang Belajar', 'Mulai Bertumbuh'].slice(0, 3).map(kat => (
          <div key={kat} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: kat === 'Sudah Terbiasa' ? '#16a34a15' : kat === 'Berkembang Baik' ? '#2563eb15' : '#eecb5915' }}>
              <Users className="w-5 h-5" style={{ color: kat === 'Sudah Terbiasa' ? '#16a34a' : kat === 'Berkembang Baik' ? '#2563eb' : '#eecb59' }} />
            </div>
            <div><p className="text-xs text-gray-500">{kat}</p><p className="text-xl font-bold" style={{ color: kat === 'Sudah Terbiasa' ? '#16a34a' : kat === 'Berkembang Baik' ? '#2563eb' : '#eecb59' }}>{observasiStats.filter(o => o.kategori === kat).length}</p></div>
          </div>
        ))}
      </div>
      {/* Pie chart distribusi */}
      {observasiKategoriDist.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 no-print">
          <h3 className="font-semibold text-gray-800 mb-3">Distribusi Kategori Karakter</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={observasiKategoriDist} dataKey="value" nameKey="nama" cx="50%" cy="50%" outerRadius={100} label={({ nama, value }) => `${nama}: ${value}`}>
                  {observasiKategoriDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Murid</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3">Instrumen</th>
              <th className="px-4 py-3 text-center">Nilai Akhir</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Guru</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {observasiStats.map((o, i) => (
              <tr key={o.id || i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{o.muridNama}</td>
                <td className="px-4 py-3 text-gray-600">{o.kelasNama}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{o.instrumenNama}</td>
                <td className="px-4 py-3 text-center font-bold text-[#102a4d]">{o.nilaiAkhir}/100</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${KATEGORI_KARAKTER_COLORS[o.kategori] || ''}`}>{o.kategori}</span></td>
                <td className="px-4 py-3 text-gray-600">{o.guruNama}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(o.tanggal)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || STATUS_COLORS.Draft}`}>{o.status || '-'}</span></td>
              </tr>
            ))}
            {observasiStats.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Belum ada data observasi karakter</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPancaCinta = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#eecb59]/20"><Heart className="w-5 h-5 text-[#eecb59]" /></div>
          <div><p className="text-xs text-gray-500">Total Penerapan</p><p className="text-xl font-bold text-[#eecb59]">{pancaCintaStats.reduce((s, p) => s + p.jumlah, 0)}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#102a4d]/10"><BarChart3 className="w-5 h-5 text-[#102a4d]" /></div>
          <div><p className="text-xs text-gray-500">Nilai Terpopuler</p><p className="text-lg font-bold text-[#102a4d]">{pancaCintaStats[0]?.nama || '-'}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2fa295]/10"><FileText className="w-5 h-5 text-[#2fa295]" /></div>
          <div><p className="text-xs text-gray-500">Sumber Data</p><p className="text-lg font-bold text-[#2fa295]">Jurnal + Observasi</p></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Frekuensi Penerapan Panca Cinta</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={pancaCintaStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="nama" width={170} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#102a4d" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top 5 Nilai Panca Cinta</h3>
          {topPancaCinta.length > 0 ? (
            <div className="space-y-2">
              {topPancaCinta.map((p, i) => (
                <div key={p.nama} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{p.nama}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full" style={{ width: `${topPancaCinta[0] ? (p.jumlah / topPancaCinta[0].jumlah) * 100 : 0}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#102a4d]">{p.jumlah}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Belum ada data</p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Nilai Panca Cinta</th><th className="px-4 py-3 text-right">Jumlah Penerapan</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {pancaCintaStats.map(p => (<tr key={p.nama}><td className="px-4 py-3 text-gray-800">{p.nama}</td><td className="px-4 py-3 text-right font-semibold text-[#102a4d]">{p.jumlah}</td></tr>))}
            {pancaCintaStats.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEviden = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2fa295]/10"><BookOpen className="w-5 h-5 text-[#2fa295]" /></div>
          <div><p className="text-xs text-gray-500">Total Eviden</p><p className="text-xl font-bold text-[#2fa295]">{filteredEviden.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#eecb59]/20"><FileText className="w-5 h-5 text-[#eecb59]" /></div>
          <div><p className="text-xs text-gray-500">Jenis Eviden</p><p className="text-lg font-bold text-[#eecb59]">{new Set(filteredEviden.map(e => e.jenis)).size}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#102a4d]/10"><Users className="w-5 h-5 text-[#102a4d]" /></div>
          <div><p className="text-xs text-gray-500">Guru dengan Eviden</p><p className="text-lg font-bold text-[#102a4d]">{new Set(filteredEviden.map(e => (data.jurnalHarian.find(j => j.id === e.jurnalId))?.guruId).filter(Boolean)).size}</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Jurnal Terkait</th>
              <th className="px-4 py-3">Guru</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEviden.map((e, i) => {
              const j = data.jurnalHarian.find(x => x.id === e.jurnalId);
              return (
                <tr key={e.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.judul}</td>
                  <td className="px-4 py-3 text-gray-600">{e.jenis}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(e.tanggal)}</td>
                  <td className="px-4 py-3 text-gray-600">{j ? `${j.materi} - ${formatDate(j.tanggal)}` : '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{j?.guruNama || '-'}</td>
                </tr>
              );
            })}
            {filteredEviden.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada eviden</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderValidasi = (list, title) => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#102a4d]/10"><CheckCircle className="w-5 h-5 text-[#102a4d]" /></div>
          <div><p className="text-xs text-gray-500">Total Validasi</p><p className="text-xl font-bold text-[#102a4d]">{list.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50"><CheckCircle className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Disetujui</p><p className="text-xl font-bold text-green-600">{list.filter(v => v.status === 'Disetujui').length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2fa295]/10"><BarChart3 className="w-5 h-5 text-[#2fa295]" /></div>
          <div><p className="text-xs text-gray-500">Rata-rata Skor</p><p className="text-xl font-bold text-[#2fa295]">{list.length > 0 ? Math.round(list.reduce((s, v) => s + v.totalSkor, 0) / list.length) : 0}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-50"><FileText className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-xs text-gray-500">Perlu Revisi</p><p className="text-xl font-bold text-yellow-600">{list.filter(v => v.status === 'Perlu Revisi').length}</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Validator</th>
              <th className="px-4 py-3">Guru</th>
              <th className="px-4 py-3 text-center">Total Skor</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((v, i) => {
              const j = data.jurnalHarian.find(x => x.id === v.jurnalId);
              const katColors = { 'Sangat Baik': 'bg-green-100 text-green-700', 'Baik': 'bg-blue-100 text-blue-700', 'Mulai Berkembang': 'bg-yellow-100 text-yellow-700', 'Perlu Pendampingan': 'bg-red-100 text-red-700' };
              return (
                <tr key={v.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{v.validatorNama}</td>
                  <td className="px-4 py-3 text-gray-600">{j?.guruNama || '-'}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#102a4d]">{v.totalSkor}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${katColors[v.kategori] || ''}`}>{v.kategori}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v.status] || ''}`}>{v.status}</span></td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(v.tanggal)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{v.catatanApresiasi || v.catatanPerbaikan || '-'}</td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Belum ada data validasi</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLaporanSemester = () => (
    <div id="laporan-semester" className="bg-white rounded-xl shadow-sm p-6 md:p-10 print:shadow-none print:p-12 print:rounded-none">
      {/* KOP */}
      <div className="text-center border-b-2 border-[#102a4d] pb-4 mb-6">
        <p className="text-xs md:text-sm">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
        <p className="text-sm font-semibold">DIREKTORAT JENDERAL PENDIDIKAN ISLAM</p>
        <h1 className="text-lg font-bold text-[#102a4d] mt-2">LAPORAN SEMESTER</h1>
        <p className="text-sm">Implementasi Kurikulum Berbasis Cinta (KBC)</p>
        <p className="text-xs text-gray-500 mt-2">Periode: {filters.semester || data.pengaturan?.semester || '-'} • Tahun Pelajaran {filters.tahunPelajaran || data.pengaturan?.tahunPelajaran || '-'}</p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total Jurnal</p><p className="text-2xl font-bold text-[#102a4d]">{filteredJurnal.length}</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Disetujui</p><p className="text-2xl font-bold text-green-600">{filteredJurnal.filter(j => j.status === 'Disetujui').length}</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total Eviden</p><p className="text-2xl font-bold text-[#2fa295]">{filteredEviden.length}</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total Observasi</p><p className="text-2xl font-bold text-[#eecb59]">{observasiStats.length}</p></div>
      </div>

      {/* I. Pendahuluan */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">I. Pendahuluan</h3>
        <p className="text-sm text-gray-700 text-justify">
          Kurikulum Berbasis Cinta (KBC) merupakan inovasi pendidikan yang mengintegrasikan nilai-nilai Panca Cinta (Cinta Allah dan Rasul, Cinta Ilmu, Cinta Diri dan Sesama, Cinta Lingkungan, dan Cinta Tanah Air) ke dalam seluruh proses pembelajaran. Laporan ini menyajikan rekapitulasi pelaksanaan KBC pada semester {filters.semester || data.pengaturan?.semester || '-'} Tahun Pelajaran {filters.tahunPelajaran || data.pengaturan?.tahunPelajaran || '-'}, mencakup jurnal pembelajaran, pembiasaan harian guru, observasi karakter murid, penerapan nilai Panca Cinta, eviden kegiatan, dan hasil validasi.
        </p>
      </div>

      {/* II. Rekap Jurnal Pembelajaran */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">II. Rekap Jurnal Pembelajaran KBC</h3>
        <table className="w-full text-sm border border-gray-300 mb-2">
          <thead className="bg-gray-50"><tr><th className="border border-gray-300 px-3 py-2 text-left">No</th><th className="border border-gray-300 px-3 py-2 text-left">Nama Guru</th><th className="border border-gray-300 px-3 py-2 text-left">Madrasah</th><th className="border border-gray-300 px-3 py-2 text-center">Total</th><th className="border border-gray-300 px-3 py-2 text-center">Disetujui</th></tr></thead>
          <tbody>
            {jurnalGuruStats.map((g, i) => {
              const m = madrasahList.find(x => x.id === g.madrasahId);
              return (<tr key={g.id}><td className="border border-gray-300 px-3 py-2">{i + 1}</td><td className="border border-gray-300 px-3 py-2">{g.nama}</td><td className="border border-gray-300 px-3 py-2">{m?.nama || '-'}</td><td className="border border-gray-300 px-3 py-2 text-center">{g.total}</td><td className="border border-gray-300 px-3 py-2 text-center">{g.disetujui}</td></tr>);
            })}
            {jurnalGuruStats.length === 0 && <tr><td colSpan={5} className="border border-gray-300 px-3 py-2 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {/* III. Rekap Pembiasaan Harian Guru */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">III. Rekap Jurnal Pembiasaan Harian Guru</h3>
        {pembiasaanStats.length === 0 ? <p className="text-sm text-gray-400">Belum ada data pembiasaan harian.</p> : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="bg-gray-50 rounded p-2 text-center"><p className="text-xs text-gray-500">Guru Aktif</p><p className="text-lg font-bold text-[#102a4d]">{guruAktifSet.size}/{guruList.length}</p></div>
              <div className="bg-gray-50 rounded p-2 text-center"><p className="text-xs text-gray-500">Rata-rata Keterlaksanaan</p><p className="text-lg font-bold text-[#2fa295]">{avgPembiasaanPct}%</p></div>
              <div className="bg-gray-50 rounded p-2 text-center"><p className="text-xs text-gray-500">Top Kategori</p><p className="text-lg font-bold text-[#eecb59]">{pembiasaanStats.filter(p => p.kategori === 'Sangat Konsisten').length} Sangat Konsisten</p></div>
            </div>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-50"><tr><th className="border border-gray-300 px-3 py-2 text-left">No</th><th className="border border-gray-300 px-3 py-2 text-left">Guru</th><th className="border border-gray-300 px-3 py-2 text-left">Bulan</th><th className="border border-gray-300 px-3 py-2 text-center">%</th><th className="border border-gray-300 px-3 py-2 text-left">Kategori</th></tr></thead>
              <tbody>
                {pembiasaanStats.map((p, i) => (<tr key={i}><td className="border border-gray-300 px-3 py-2">{i + 1}</td><td className="border border-gray-300 px-3 py-2">{p.guruNama}</td><td className="border border-gray-300 px-3 py-2">{BULAN_NAMA[(p.bulan || 1) - 1]} {p.tahun}</td><td className="border border-gray-300 px-3 py-2 text-center font-bold">{p.pct}%</td><td className="border border-gray-300 px-3 py-2">{p.kategori}</td></tr>))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* IV. Rekap Observasi Karakter Murid */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">IV. Rekap Observasi Karakter Murid</h3>
        {observasiStats.length === 0 ? <p className="text-sm text-gray-400">Belum ada data observasi karakter.</p> : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-2">
              {['Sudah Terbiasa', 'Berkembang Baik', 'Sedang Belajar', 'Mulai Bertumbuh'].map(kat => (
                <div key={kat} className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-xs text-gray-500">{kat}</p>
                  <p className="text-lg font-bold" style={{ color: kat === 'Sudah Terbiasa' ? '#16a34a' : kat === 'Berkembang Baik' ? '#2563eb' : kat === 'Sedang Belajar' ? '#eecb59' : '#e74c3c' }}>{observasiStats.filter(o => o.kategori === kat).length}</p>
                </div>
              ))}
            </div>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-50"><tr><th className="border border-gray-300 px-3 py-2 text-left">No</th><th className="border border-gray-300 px-3 py-2 text-left">Murid</th><th className="border border-gray-300 px-3 py-2 text-left">Kelas</th><th className="border border-gray-300 px-3 py-2 text-center">Nilai</th><th className="border border-gray-300 px-3 py-2 text-left">Kategori</th></tr></thead>
              <tbody>
                {observasiStats.map((o, i) => (<tr key={o.id || i}><td className="border border-gray-300 px-3 py-2">{i + 1}</td><td className="border border-gray-300 px-3 py-2">{o.muridNama}</td><td className="border border-gray-300 px-3 py-2">{o.kelasNama}</td><td className="border border-gray-300 px-3 py-2 text-center font-bold">{o.nilaiAkhir}</td><td className="border border-gray-300 px-3 py-2">{o.kategori}</td></tr>))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* V. Rekap Panca Cinta */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">V. Rekap Penerapan Nilai Panca Cinta</h3>
        {pancaCintaStats.length === 0 ? <p className="text-sm text-gray-400">Belum ada data.</p> : (
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-50"><tr><th className="border border-gray-300 px-3 py-2 text-left">Nilai Panca Cinta</th><th className="border border-gray-300 px-3 py-2 text-center">Jumlah</th></tr></thead>
            <tbody>{pancaCintaStats.map(p => (<tr key={p.nama}><td className="border border-gray-300 px-3 py-2">{p.nama}</td><td className="border border-gray-300 px-3 py-2 text-center font-bold">{p.jumlah}</td></tr>))}</tbody>
          </table>
        )}
      </div>

      {/* VI. Rekap Eviden */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">VI. Rekap Eviden Kegiatan</h3>
        {filteredEviden.length === 0 ? <p className="text-sm text-gray-400">Belum ada eviden.</p> : (
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-50"><tr><th className="border border-gray-300 px-3 py-2 text-left">No</th><th className="border border-gray-300 px-3 py-2 text-left">Judul</th><th className="border border-gray-300 px-3 py-2 text-left">Jenis</th><th className="border border-gray-300 px-3 py-2 text-left">Guru</th></tr></thead>
            <tbody>{filteredEviden.map((e, i) => { const j = data.jurnalHarian.find(x => x.id === e.jurnalId); return (<tr key={e.id || i}><td className="border border-gray-300 px-3 py-2">{i + 1}</td><td className="border border-gray-300 px-3 py-2">{e.judul}</td><td className="border border-gray-300 px-3 py-2">{e.jenis}</td><td className="border border-gray-300 px-3 py-2">{j?.guruNama || '-'}</td></tr>); })}</tbody>
          </table>
        )}
      </div>

      {/* VII. Hasil Validasi */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">VII. Hasil Validasi &amp; Catatan Kepala/Pengawas</h3>
        {filteredValidasi.length === 0 ? <p className="text-sm text-gray-400">Belum ada data validasi.</p> : (
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-50"><tr><th className="border border-gray-300 px-3 py-2 text-left">No</th><th className="border border-gray-300 px-3 py-2 text-left">Validator</th><th className="border border-gray-300 px-3 py-2 text-left">Guru</th><th className="border border-gray-300 px-3 py-2 text-center">Skor</th><th className="border border-gray-300 px-3 py-2 text-left">Kategori</th></tr></thead>
            <tbody>{filteredValidasi.map((v, i) => { const j = data.jurnalHarian.find(x => x.id === v.jurnalId); return (<tr key={v.id || i}><td className="border border-gray-300 px-3 py-2">{i + 1}</td><td className="border border-gray-300 px-3 py-2">{v.validatorNama}</td><td className="border border-gray-300 px-3 py-2">{j?.guruNama || '-'}</td><td className="border border-gray-300 px-3 py-2 text-center font-bold">{v.totalSkor}</td><td className="border border-gray-300 px-3 py-2">{v.kategori}</td></tr>); })}</tbody>
          </table>
        )}
      </div>

      {/* VIII. Rekomendasi Tindak Lanjut + TTD */}
      <div className="mb-6">
        <h3 className="font-bold text-[#102a4d] mb-2">VIII. Rekomendasi Tindak Lanjut</h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>Meningkatkan konsistensi pengisian jurnal pembiasaan harian oleh seluruh guru.</li>
          <li>Memperluas cakupan observasi karakter murid untuk semua nilai Panca Cinta.</li>
          <li>Mengoptimalkan pengumpulan eviden digital sebagai bukti pelaksanaan KBC.</li>
          {avgPembiasaanPct < 75 && <li>Memberikan pendampingan khusus bagi guru dengan keterlaksanaan pembiasaan di bawah 75%.</li>}
          {muridPerluDampingan.length > 0 && <li>Memberikan perhatian dan program pendampingan bagi {muridPerluDampingan.length} murid yang masuk kategori "Sedang Belajar" atau "Mulai Bertumbuh".</li>}
          <li>Kepala madrasah dan pengawas melakukan monitoring dan evaluasi berkala setiap bulan.</li>
          <li>Menyusun rencana aksi perbaikan untuk semester berikutnya berdasarkan temuan dan rekomendasi.</li>
        </ol>
      </div>

      {/* TTD */}
      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="text-center">
          <p className="text-sm">Mengetahui,</p>
          <p className="text-sm font-semibold mt-1">Pengawas Madrasah</p>
          <div className="h-16"></div>
          <p className="text-sm font-semibold border-t border-gray-400 pt-1">({user.role === 'pengawas' ? user.nama : '______________________'})</p>
        </div>
        <div className="text-center">
          <p className="text-sm">Menyetujui,</p>
          <p className="text-sm font-semibold mt-1">Kepala Madrasah</p>
          <div className="h-16"></div>
          <p className="text-sm font-semibold border-t border-gray-400 pt-1">({user.role === 'kepala_madrasah' ? user.nama : '______________________'})</p>
        </div>
        <div className="text-center">
          <p className="text-sm">Dibuat oleh,</p>
          <p className="text-sm font-semibold mt-1">Petugas</p>
          <div className="h-16"></div>
          <p className="text-sm font-semibold border-t border-gray-400 pt-1">({user.role === 'admin' || user.role === 'operator' ? user.nama : '______________________'})</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap no-print">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Rekap Instrumen KBC</h2>
          <p className="text-sm text-gray-500">Gabungan rekap dari seluruh instrumen Kurikulum Berbasis Cinta</p>
        </div>
        <div className="flex gap-2">
          <button onClick={doExport} className="px-4 py-2 bg-[#2fa295] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#278f84]"><Download className="w-4 h-4" />Export CSV</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Printer className="w-4 h-4" />Cetak</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-gray-200 no-print">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setJenis(t.key)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ${jenis === t.key ? 'border-[#102a4d] text-[#102a4d]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="no-print">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#102a4d]">
          <Filter className="w-4 h-4" />{showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
          <ChevronRight className={`w-4 h-4 transition ${showFilters ? 'rotate-90' : ''}`} />
        </button>
        {showFilters && (
          <div className="mt-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bulan</label>
              <select value={filters.bulan} onChange={e => setFilters({ ...filters, bulan: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {BULAN_NAMA.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Semester</label>
              <select value={filters.semester} onChange={e => setFilters({ ...filters, semester: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {uniqSemester.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tahun Pelajaran</label>
              <select value={filters.tahunPelajaran} onChange={e => setFilters({ ...filters, tahunPelajaran: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {uniqTahunPelajaran.map(tp => <option key={tp} value={tp}>{tp}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Guru</label>
              <select value={filters.guruId} onChange={e => setFilters({ ...filters, guruId: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {guruList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kelas</label>
              <select value={filters.kelasId} onChange={e => setFilters({ ...filters, kelasId: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Madrasah</label>
              <select value={filters.madrasahId} onChange={e => setFilters({ ...filters, madrasahId: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {madrasahList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Jenjang</label>
              <select value={filters.jenjang} onChange={e => setFilters({ ...filters, jenjang: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {['RA', 'MI', 'MTs', 'MA'].map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Panca Cinta</label>
              <select value={filters.pancaCinta} onChange={e => setFilters({ ...filters, pancaCinta: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {NILAI_PANCA_CINTA.map(pc => <option key={pc} value={pc}>{pc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status Validasi</label>
              <select value={filters.statusValidasi} onChange={e => setFilters({ ...filters, statusValidasi: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#102a4d] outline-none">
                <option value="">Semua</option>
                {['Draft', 'Dikirim', 'Disetujui', 'Perlu Revisi'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(filters.bulan || filters.semester || filters.tahunPelajaran || filters.guruId || filters.kelasId || filters.madrasahId || filters.jenjang || filters.pancaCinta || filters.statusValidasi) && (
              <div className="col-span-full">
                <button onClick={() => setFilters({ bulan: '', semester: '', tahunPelajaran: '', guruId: '', kelasId: '', muridId: '', madrasahId: '', jenjang: '', pancaCinta: '', statusValidasi: '' })} className="text-xs text-red-600 hover:text-red-800 font-medium">✕ Reset Semua Filter</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab content */}
      {jenis === 'jurnal-pembelajaran' && renderJurnalPembelajaran()}
      {jenis === 'pembiasaan-harian' && renderPembiasaanHarian()}
      {jenis === 'observasi-karakter' && renderObservasiKarakter()}
      {jenis === 'panca-cinta' && renderPancaCinta()}
      {jenis === 'eviden' && renderEviden()}
      {jenis === 'validasi-kepala' && renderValidasi(validasiKepala, 'Kepala Madrasah')}
      {jenis === 'validasi-pengawas' && renderValidasi(validasiPengawas, 'Pengawas')}
      {jenis === 'semester' && renderLaporanSemester()}
    </div>
  );
}
