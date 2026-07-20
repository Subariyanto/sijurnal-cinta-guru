import React, { useState, useMemo } from 'react';
import { getData, formatDate, getKategoriSkor } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { FileText, Printer, Download, Search, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  { key: 'jurnalGuru', label: 'Jurnal per Guru' },
  { key: 'pancaCinta', label: 'Penerapan Panca Cinta' },
  { key: 'validasi', label: 'Hasil Validasi' },
  { key: 'observasi', label: 'Observasi Siswa' },
  { key: 'eviden', label: 'Eviden Digital' },
  { key: 'semester', label: 'Laporan Semester' },
];

const KATEGORI_COLORS = {
  'Sangat Baik': 'bg-green-100 text-green-700',
  'Baik': 'bg-blue-100 text-blue-700',
  'Mulai Berkembang': 'bg-yellow-100 text-yellow-700',
  'Perlu Pendampingan': 'bg-red-100 text-red-700',
};

export default function Laporan() {
  const { user } = useAuth();
  const data = getData();
  const [jenis, setJenis] = useState('jurnalGuru');
  const [filters, setFilters] = useState({ madrasahId: '', semester: '' });

  let jurnalList = data.jurnalHarian;
  if (user.role === 'guru') jurnalList = jurnalList.filter(j => j.guruId === user.guruId);
  else if (user.role === 'kamad') jurnalList = jurnalList.filter(j => j.madrasahId === user.madrasahId);

  const guruStats = useMemo(() => {
    const stats = {};
    data.guru.forEach(g => {
      stats[g.id] = { id: g.id, nama: g.nama, madrasahId: g.madrasahId, total: 0, disetujui: 0, draft: 0, revisi: 0 };
    });
    jurnalList.forEach(j => {
      const s = stats[j.guruId];
      if (!s) return;
      s.total++;
      if (j.status === 'Disetujui') s.disetujui++;
      else if (j.status === 'Draft') s.draft++;
      else if (j.status === 'Perlu Revisi') s.revisi++;
    });
    return Object.values(stats);
  }, [jurnalList, data.guru]);

  const pancaCintaStats = useMemo(() => {
    const counts = {};
    jurnalList.forEach(j => {
      (j.pancaCinta||[]).forEach(pc => { counts[pc] = (counts[pc]||0) + 1; });
    });
    return Object.entries(counts).map(([nama, jumlah]) => ({ nama, jumlah })).sort((a,b)=>b.jumlah-a.jumlah);
  }, [jurnalList]);

  const validasiList = data.validasi.filter(v => jurnalList.some(j => j.id === v.jurnalId));
  const observasiList = useMemo(() => {
    let l = data.observasiSiswa;
    if (user.role === 'guru') l = l.filter(o => o.guruId === user.guruId);
    else if (user.role === 'kamad') {
      const myKelas = data.kelas.filter(k => k.madrasahId === user.madrasahId).map(k => k.id);
      l = l.filter(o => myKelas.includes(o.kelasId));
    }
    return l;
  }, [data.observasiSiswa, data.kelas, user]);

  const evidenList = useMemo(() => {
    const myJurnal = jurnalList.map(j => j.id);
    return data.eviden.filter(e => !e.jurnalId || myJurnal.includes(e.jurnalId));
  }, [data.eviden, jurnalList]);

  const exportCSV = () => {
    const rows = [['No','Nama Guru','Madrasah','Total','Disetujui','Draft','Revisi']];
    guruStats.forEach((g, i) => {
      const m = data.madrasah.find(x => x.id === g.madrasahId);
      rows.push([i+1, g.nama, m?.nama||'-', g.total, g.disetujui, g.draft, g.revisi]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rekap-jurnal-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Rekap dan Laporan</h2>
          <p className="text-sm text-gray-500">Analisis dan cetak laporan pelaksanaan KBC</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2 bg-[#2fa295] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#278f84]"><Download className="w-4 h-4"/>Export CSV</button>
          <button onClick={()=>window.print()} className="px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a1f3b]"><Printer className="w-4 h-4"/>Cetak</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-gray-200 print:hidden">
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setJenis(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${jenis===t.key?'border-[#102a4d] text-[#102a4d]':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {jenis === 'jurnalGuru' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Guru</th>
                <th className="px-4 py-3">Madrasah</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Disetujui</th>
                <th className="px-4 py-3 text-center">Draft</th>
                <th className="px-4 py-3 text-center">Revisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {guruStats.map((g, i) => {
                const m = data.madrasah.find(x => x.id === g.madrasahId);
                return (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{i+1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{g.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{m?.nama||'-'}</td>
                    <td className="px-4 py-3 text-center font-semibold">{g.total}</td>
                    <td className="px-4 py-3 text-center text-green-600">{g.disetujui}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{g.draft}</td>
                    <td className="px-4 py-3 text-center text-red-600">{g.revisi}</td>
                  </tr>
                );
              })}
              {guruStats.length===0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {jenis === 'pancaCinta' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/>Frekuensi Penerapan Panca Cinta</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={pancaCintaStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={80}/>
                  <YAxis allowDecimals={false}/>
                  <Tooltip />
                  <Bar dataKey="jumlah" fill="#102a4d" radius={[8,8,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Nilai Panca Cinta</th><th className="px-4 py-3 text-right">Jumlah Penerapan</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {pancaCintaStats.map(p => (<tr key={p.nama}><td className="px-4 py-3 text-gray-800">{p.nama}</td><td className="px-4 py-3 text-right font-semibold text-[#102a4d]">{p.jumlah}</td></tr>))}
                {pancaCintaStats.length===0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {jenis === 'validasi' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Validator</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3 text-center">Total Skor</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {validasiList.map(v => {
                const j = data.jurnalHarian.find(x => x.id === v.jurnalId);
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{v.validatorNama}</td>
                    <td className="px-4 py-3 text-gray-600">{j?.guruNama||'-'}</td>
                    <td className="px-4 py-3 text-center font-semibold">{v.totalSkor}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${KATEGORI_COLORS[v.kategori]||''}`}>{v.kategori}</span></td>
                    <td className="px-4 py-3 text-gray-600">{v.status}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(v.tanggal)}</td>
                  </tr>
                );
              })}
              {validasiList.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada data validasi</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {jenis === 'observasi' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Perilaku</th>
                <th className="px-4 py-3">Panca Cinta</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {observasiList.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{o.inisial}</td>
                  <td className="px-4 py-3 text-gray-600">{o.indikatorPerilaku}</td>
                  <td className="px-4 py-3 text-gray-600">{o.pancaCinta}</td>
                  <td className="px-4 py-3 text-gray-600">{o.kategori}</td>
                  <td className="px-4 py-3 text-gray-600">{o.guruNama}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(o.tanggal)}</td>
                </tr>
              ))}
              {observasiList.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada observasi</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {jenis === 'eviden' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jurnal Terkait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evidenList.map(e => {
                const j = data.jurnalHarian.find(x => x.id === e.jurnalId);
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{e.judul}</td>
                    <td className="px-4 py-3 text-gray-600">{e.jenis}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(e.tanggal)}</td>
                    <td className="px-4 py-3 text-gray-600">{j ? `${j.materi} - ${formatDate(j.tanggal)}` : '-'}</td>
                  </tr>
                );
              })}
              {evidenList.length===0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada eviden</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {jenis === 'semester' && (
        <div id="laporan-semester" className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-12">
          <div className="text-center border-b-2 border-[#102a4d] pb-4 mb-6">
            <p className="text-xs">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
            <p className="text-sm font-semibold">DIREKTORAT JENDERAL PENDIDIKAN ISLAM</p>
            <h1 className="text-lg font-bold text-[#102a4d] mt-2">LAPORAN SEMESTER</h1>
            <p className="text-sm">Pelaksanaan Kurikulum Berbasis Cinta (KBC)</p>
            <p className="text-xs text-gray-500 mt-2">Tahun Pelajaran {data.pengaturan?.tahunPelajaran || '-'} • Semester {data.pengaturan?.semester || '-'}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total Jurnal</p><p className="text-2xl font-bold text-[#102a4d]">{jurnalList.length}</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Disetujui</p><p className="text-2xl font-bold text-green-600">{jurnalList.filter(j=>j.status==='Disetujui').length}</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total Eviden</p><p className="text-2xl font-bold text-[#2fa295]">{evidenList.length}</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total Observasi</p><p className="text-2xl font-bold text-[#eecb59]">{observasiList.length}</p></div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-2">Rekap Jurnal per Guru</h3>
          <table className="w-full text-sm border border-gray-300 mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">No</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Nama Guru</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Madrasah</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Total</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Disetujui</th>
              </tr>
            </thead>
            <tbody>
              {guruStats.map((g, i) => {
                const m = data.madrasah.find(x => x.id === g.madrasahId);
                return (
                  <tr key={g.id}>
                    <td className="border border-gray-300 px-3 py-2">{i+1}</td>
                    <td className="border border-gray-300 px-3 py-2">{g.nama}</td>
                    <td className="border border-gray-300 px-3 py-2">{m?.nama||'-'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{g.total}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{g.disetujui}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Catatan</h3>
            <p className="text-sm text-gray-700">Pelaksanaan Kurikulum Berbasis Cinta berjalan dengan capaian yang baik. Mayoritas guru telah mengisi jurnal harian dan memperoleh validasi dari kepala madrasah/pengawas.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <p className="text-sm">Mengetahui,</p>
              <p className="text-sm font-semibold">Pengawas Madrasah</p>
              <div className="h-16"></div>
              <p className="text-sm font-semibold border-t border-gray-400 pt-1">(______________________)</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Yang membuat laporan,</p>
              <p className="text-sm font-semibold">Kepala Madrasah</p>
              <div className="h-16"></div>
              <p className="text-sm font-semibold border-t border-gray-400 pt-1">(______________________)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
