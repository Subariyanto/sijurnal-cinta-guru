import React from 'react';
import { Link } from 'react-router-dom';
import { getData, formatDate } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, FileText, CheckCircle, AlertTriangle, TrendingUp, AlertCircle, Eye, Printer, Heart } from 'lucide-react';

const COLORS = ['#eecb59','#2fa295','#102a4d','#ef4444','#3b82f6'];

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'pengawas') return <DashboardPengawas user={user} />;
  return <DashboardUmum user={user} />;
}

function DashboardUmum({ user }) {
  const d = getData();
  let jurnalList = d.jurnalHarian;
  if (user.role === 'guru') jurnalList = d.jurnalHarian.filter(j => j.guruId === user.guruId);
  else if (user.role === 'kepala_madrasah') jurnalList = d.jurnalHarian.filter(j => j.madrasahId === user.madrasahId);

  const stats = [
    { icon: Users, label: 'Total Guru', value: d.guru.length, color: 'bg-blue-500' },
    { icon: Building2, label: 'Total Madrasah', value: d.madrasah.length, color: 'bg-[#2fa295]' },
    { icon: FileText, label: 'Total Jurnal', value: jurnalList.length, color: 'bg-[#102a4d]' },
    { icon: CheckCircle, label: 'Disetujui', value: jurnalList.filter(j => j.status === 'Disetujui').length, color: 'bg-green-500' },
    { icon: AlertTriangle, label: 'Perlu Tindakan', value: jurnalList.filter(j => j.status === 'Dikirim' || j.status === 'Perlu Revisi').length, color: 'bg-yellow-500' },
  ];

  const gStats = {}; jurnalList.forEach(j => { gStats[j.guruNama] = (gStats[j.guruNama] || 0) + 1; });
  const barData = Object.entries(gStats).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value }));
  const statusData = [{ name: 'Disetujui', value: jurnalList.filter(j => j.status === 'Disetujui').length }, { name: 'Dikirim', value: jurnalList.filter(j => j.status === 'Dikirim').length }, { name: 'Draft', value: jurnalList.filter(j => j.status === 'Draft').length }, { name: 'Revisi', value: jurnalList.filter(j => j.status === 'Perlu Revisi').length }].filter(x => x.value > 0);
  const pancaCount = {}; jurnalList.forEach(j => (j.pancaCinta || []).forEach(pc => { pancaCount[pc.replace('Cinta ', '')] = (pancaCount[pc.replace('Cinta ', '')] || 0) + 1; }));
  const pancaData = Object.entries(pancaCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5 text-white" /></div><div><p className="text-xs text-gray-500">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><h3 className="text-sm font-semibold text-gray-800 mb-4">Jurnal per Guru</h3><ResponsiveContainer width="100%" height={220}>{barData.length > 0 ? <BarChart data={barData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize: 10}}/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#102a4d" radius={[4,4,0,0]}/></BarChart> : <p className="text-gray-400 text-sm">Belum ada data</p>}</ResponsiveContainer></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><h3 className="text-sm font-semibold text-gray-800 mb-4">Status Jurnal</h3><div className="flex items-center justify-center"><ResponsiveContainer width="100%" height={220}>{statusData.length > 0 ? <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,value}) => `${name}: ${value}`}><Tooltip/>{(statusData || []).map((_,i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}</Pie></PieChart> : <p className="text-gray-400 text-sm">Belum ada data</p>}</ResponsiveContainer></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><h3 className="text-sm font-semibold text-gray-800 mb-3">Guru Paling Aktif</h3><div className="space-y-2">{barData.slice(0, 5).map((g, i) => <div key={i} className="flex items-center justify-between text-sm"><span>{i + 1}. {g.name}</span><span className="font-medium">{g.value} jurnal</span></div>)}</div></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><h3 className="text-sm font-semibold text-gray-800 mb-3">Penerapan Panca Cinta</h3><div className="space-y-2">{pancaData.map((pc, i) => <div key={i} className="flex items-center gap-2"><span className="text-xs w-28 truncate">{pc.name}</span><div className="flex-1 h-2 bg-gray-100 rounded-full"><div className="h-2 bg-[#eecb59] rounded-full" style={{ width: `${Math.min(100, pc.value / Math.max(...pancaData.map(x => x.value)) * 100)}%` }} /></div><span className="text-xs font-medium w-6">{pc.value}</span></div>)}</div></div>
      </div>
    </div>
  );
}

function DashboardPengawas({ user }) {
  const d = getData();
  // Pengawas binaan = semua madrasah (atau filter by user.pengawasNama if assigned)
  const madrasahBinaan = d.madrasah; // kalau ada field pengawas, bisa di-filter di sini
  const guruBinaan = d.guru.filter(g => madrasahBinaan.some(m => m.id === g.madrasahId));
  const jurnalBinaan = d.jurnalHarian.filter(j => madrasahBinaan.some(m => m.id === j.madrasahId));

  // 30 hari terakhir
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const jurnal30Hari = jurnalBinaan.filter(j => new Date(j.tanggal) >= cutoff);
  const guruAktifIds = new Set(jurnal30Hari.map(j => j.guruId));
  const persentaseAktif = guruBinaan.length > 0 ? Math.round((guruAktifIds.size / guruBinaan.length) * 100) : 0;
  const guruBelumIsi = guruBinaan.filter(g => !guruAktifIds.has(g.id));
  const jurnalBelumValid = jurnalBinaan.filter(j => j.status === 'Dikirim' || j.status === 'Perlu Revisi');

  // Panca Cinta frequency
  const pancaCount = {}; jurnalBinaan.forEach(j => (j.pancaCinta || []).forEach(pc => { pancaCount[pc] = (pancaCount[pc] || 0) + 1; }));
  const pancaData = Object.entries(pancaCount).map(([name, value]) => ({ name: name.replace('Cinta ', ''), value })).sort((a,b) => b.value - a.value);

  // Per-madrasah rekap
  const madrasahStats = madrasahBinaan.map(m => {
    const guruM = guruBinaan.filter(g => g.madrasahId === m.id);
    const jurnalM = jurnalBinaan.filter(j => j.madrasahId === m.id);
    const aktifIds = new Set(jurnalM.filter(j => new Date(j.tanggal) >= cutoff).map(j => j.guruId));
    const aktifPct = guruM.length > 0 ? Math.round((aktifIds.size / guruM.length) * 100) : 0;
    const validasi = d.validasi.filter(v => jurnalM.some(j => j.id === v.jurnalId));
    const avgSkor = validasi.length > 0 ? Math.round(validasi.reduce((s, v) => s + v.totalSkor, 0) / validasi.length) : 0;
    const disetujui = jurnalM.filter(j => j.status === 'Disetujui').length;
    return { ...m, jmlGuru: guruM.length, jmlJurnal: jurnalM.length, aktifPct, avgSkor, disetujui, perluValidasi: jurnalM.filter(j => j.status === 'Dikirim').length };
  });

  // Rekomendasi pendampingan: madrasah dengan aktifPct < 50% atau avgSkor < 75
  const rekomendasiPendampingan = madrasahStats.filter(m => m.aktifPct < 50 || (m.avgSkor > 0 && m.avgSkor < 75) || m.jmlJurnal === 0);

  const stats = [
    { icon: Building2, label: 'Madrasah Binaan', value: madrasahBinaan.length, color: 'bg-[#2fa295]' },
    { icon: Users, label: 'Total Guru', value: guruBinaan.length, color: 'bg-blue-500' },
    { icon: TrendingUp, label: 'Guru Aktif (30hr)', value: `${persentaseAktif}%`, color: 'bg-green-500', sub: `${guruAktifIds.size}/${guruBinaan.length}` },
    { icon: FileText, label: 'Total Jurnal', value: jurnalBinaan.length, color: 'bg-[#102a4d]' },
    { icon: AlertCircle, label: 'Perlu Validasi', value: jurnalBelumValid.length, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard Pengawas</h2>
          <p className="text-sm text-gray-500">Monitoring & evaluasi implementasi KBC di {madrasahBinaan.length} madrasah binaan</p>
        </div>
        <Link to="/laporan-pengawas" className="inline-flex items-center gap-2 px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b]"><Printer className="w-4 h-4"/>Cetak Laporan Monev</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-lg font-bold">{s.value}</p>{s.sub && <p className="text-[10px] text-gray-400">{s.sub}</p>}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#102a4d]"/>Rekap per Madrasah Binaan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="py-2.5 px-3">Madrasah</th>
                <th className="py-2.5 px-3">Jenjang</th>
                <th className="py-2.5 px-3">Guru</th>
                <th className="py-2.5 px-3">Jurnal</th>
                <th className="py-2.5 px-3">Disetujui</th>
                <th className="py-2.5 px-3">Aktif</th>
                <th className="py-2.5 px-3">Avg Skor</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {madrasahStats.map(m => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 px-3 font-medium text-xs">{m.nama}</td>
                  <td className="py-2 px-3 text-xs">{m.jenjang}</td>
                  <td className="py-2 px-3 text-xs">{m.jmlGuru}</td>
                  <td className="py-2 px-3 text-xs">{m.jmlJurnal}</td>
                  <td className="py-2 px-3 text-xs text-green-600">{m.disetujui}</td>
                  <td className="py-2 px-3 text-xs"><span className={`px-2 py-0.5 rounded-full ${m.aktifPct >= 75 ? 'bg-green-100 text-green-700' : m.aktifPct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{m.aktifPct}%</span></td>
                  <td className="py-2 px-3 text-xs">{m.avgSkor || '-'}</td>
                  <td className="py-2 px-3 text-xs">
                    {m.aktifPct >= 75 && m.avgSkor >= 75 ? <span className="text-green-600">✓ Baik</span> : m.aktifPct < 50 || m.jmlJurnal === 0 ? <span className="text-red-600">⚠ Perlu Pendampingan</span> : <span className="text-yellow-600">○ Cukup</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" fill="currentColor"/>Penerapan Nilai Panca Cinta</h3>
          <ResponsiveContainer width="100%" height={250}>
            {pancaData.length > 0 ? <BarChart data={pancaData} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" allowDecimals={false}/><YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}}/><Tooltip/><Bar dataKey="value" fill="#eecb59" radius={[0,4,4,0]}/></BarChart> : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data</div>}
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-500"/>Jurnal Belum Divalidasi <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{jurnalBelumValid.length}</span></h3>
          <div className="space-y-2 max-h-[230px] overflow-y-auto">
            {jurnalBelumValid.length === 0 ? <p className="text-sm text-gray-400">Semua jurnal sudah divalidasi 👍</p> :
              jurnalBelumValid.slice(0, 10).map(j => (
                <Link key={j.id} to={`/jurnal/${j.id}`} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{j.guruNama}</p>
                    <p className="text-[10px] text-gray-500 truncate">{j.materi} • {formatDate(j.tanggal)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${j.status === 'Dikirim' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{j.status}</span>
                </Link>
              ))
            }
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500"/>Guru Belum Mengisi Jurnal (30 hari) <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{guruBelumIsi.length}</span></h3>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {guruBelumIsi.length === 0 ? <p className="text-sm text-gray-400">Semua guru aktif mengisi jurnal 👍</p> :
              guruBelumIsi.map(g => (
                <div key={g.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{g.nama}</p>
                    <p className="text-[10px] text-gray-500 truncate">{g.mapel || '-'} • {g.madrasahNama || '-'}</p>
                  </div>
                  <span className="text-[10px] text-gray-400">{g.nip || ''}</span>
                </div>
              ))
            }
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 bg-red-50/30">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500"/>Rekomendasi Madrasah Perlu Pendampingan <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{rekomendasiPendampingan.length}</span></h3>
          {rekomendasiPendampingan.length === 0 ? <p className="text-sm text-green-600">Semua madrasah binaan dalam kondisi baik 🎉</p> :
            <div className="space-y-2">
              {rekomendasiPendampingan.map(m => (
                <div key={m.id} className="py-2.5 px-3 bg-white border border-red-100 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">{m.nama}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{m.kecamatan || ''}</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {m.jmlJurnal === 0 ? '• Belum ada jurnal sama sekali' :
                     m.aktifPct < 50 ? `• Hanya ${m.aktifPct}% guru aktif` : ''}
                    {m.avgSkor > 0 && m.avgSkor < 75 ? ` • Rata-rata skor validasi ${m.avgSkor}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">→ Rekomendasi: jadwalkan supervisi & pendampingan KBC</p>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}