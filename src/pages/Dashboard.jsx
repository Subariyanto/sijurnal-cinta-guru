import React from 'react';
import { getData, formatDate } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const COLORS = ['#eecb59','#2fa295','#102a4d','#ef4444','#3b82f6'];

export default function Dashboard() {
  const { user } = useAuth();
  const d = getData();
  let jurnalList = d.jurnalHarian;
  if (user.role === 'guru') { const g = d.guru.find(x => x.id === user.guruId); jurnalList = d.jurnalHarian.filter(j => j.guruId === user.guruId); }
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