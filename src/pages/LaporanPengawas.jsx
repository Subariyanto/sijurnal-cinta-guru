import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getData, formatDate, getKategoriSkor } from '../lib/store';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Printer, FileText } from 'lucide-react';

export default function LaporanPengawas() {
  const { user } = useAuth();
  const d = getData();
  const today = new Date();
  const [periodeDari, setPeriodeDari] = useState(() => { const dt = new Date(); dt.setDate(dt.getDate() - 30); return dt.toISOString().split('T')[0]; });
  const [periodeSampai, setPeriodeSampai] = useState(today.toISOString().split('T')[0]);
  const [catatanUmum, setCatatanUmum] = useState('');

  const madrasahBinaan = d.madrasah;
  const guruBinaan = d.guru.filter(g => madrasahBinaan.some(m => m.id === g.madrasahId));
  const jurnalPeriode = d.jurnalHarian.filter(j => {
    if (!madrasahBinaan.some(m => m.id === j.madrasahId)) return false;
    const t = new Date(j.tanggal);
    return t >= new Date(periodeDari) && t <= new Date(periodeSampai);
  });
  const validasiPeriode = d.validasi.filter(v => jurnalPeriode.some(j => j.id === v.jurnalId));

  const guruAktif = new Set(jurnalPeriode.map(j => j.guruId));
  const totalGuru = guruBinaan.length;
  const persentaseAktif = totalGuru > 0 ? Math.round((guruAktif.size / totalGuru) * 100) : 0;

  const pancaCount = {};
  jurnalPeriode.forEach(j => (j.pancaCinta || []).forEach(pc => { pancaCount[pc] = (pancaCount[pc] || 0) + 1; }));
  const pancaSorted = Object.entries(pancaCount).sort((a,b) => b[1] - a[1]);

  const madrasahStats = madrasahBinaan.map(m => {
    const guruM = guruBinaan.filter(g => g.madrasahId === m.id);
    const jurnalM = jurnalPeriode.filter(j => j.madrasahId === m.id);
    const aktif = new Set(jurnalM.map(j => j.guruId));
    const aktifPct = guruM.length > 0 ? Math.round((aktif.size / guruM.length) * 100) : 0;
    const validasiM = validasiPeriode.filter(v => jurnalM.some(j => j.id === v.jurnalId));
    const avgSkor = validasiM.length > 0 ? Math.round(validasiM.reduce((s, v) => s + v.totalSkor, 0) / validasiM.length) : 0;
    const disetujui = jurnalM.filter(j => j.status === 'Disetujui').length;
    const perluValidasi = jurnalM.filter(j => j.status === 'Dikirim' || j.status === 'Perlu Revisi').length;
    let kategori = 'Cukup';
    if (aktifPct >= 75 && (avgSkor === 0 || avgSkor >= 75)) kategori = 'Baik';
    else if (aktifPct < 50 || jurnalM.length === 0 || (avgSkor > 0 && avgSkor < 60)) kategori = 'Perlu Pendampingan Intensif';
    return { ...m, jmlGuru: guruM.length, jmlGuruAktif: aktif.size, jmlJurnal: jurnalM.length, aktifPct, avgSkor, disetujui, perluValidasi, kategori };
  });

  const perluPendampingan = madrasahStats.filter(m => m.kategori === 'Perlu Pendampingan Intensif');
  const baik = madrasahStats.filter(m => m.kategori === 'Baik');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#102a4d]"><ArrowLeft className="w-4 h-4"/>Kembali ke Dashboard</Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f3b]"><Printer className="w-4 h-4"/>Cetak Laporan</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 no-print">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-[#102a4d]"/>Pengaturan Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Periode Dari</label><input type="date" value={periodeDari} onChange={e=>setPeriodeDari(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Periode Sampai</label><input type="date" value={periodeSampai} onChange={e=>setPeriodeSampai(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Catatan Umum</label><input type="text" value={catatanUmum} onChange={e=>setCatatanUmum(e.target.value)} placeholder="Tambahkan catatan singkat (opsional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#102a4d] outline-none"/></div>
        </div>
      </div>

      {/* Printable Report */}
      <div id="laporan-pengawas" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-0 print:p-12 print:rounded-none">
        {/* KOP */}
        <div className="border-b-4 border-double border-[#102a4d] pb-4 mb-6 text-center">
          <p className="text-sm font-bold">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
          <p className="text-sm font-bold">KANTOR KEMENTERIAN AGAMA KABUPATEN JEMBER</p>
          <p className="text-base font-bold">POKJAWAS MADRASAH</p>
          <p className="text-xs text-gray-600 mt-1">Jl. Imam Bonjol No. 50, Jember, Jawa Timur • Telp. (0331) 484-471</p>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-lg font-bold underline">LAPORAN MONITORING DAN EVALUASI</h1>
          <h2 className="text-base font-bold underline">IMPLEMENTASI KURIKULUM BERBASIS CINTA (KBC)</h2>
          <p className="text-sm mt-1">Periode: {formatDate(periodeDari)} s.d. {formatDate(periodeSampai)}</p>
        </div>

        {/* Identitas Pengawas */}
        <div className="mb-6 text-sm">
          <table className="w-full">
            <tbody>
              <tr><td className="py-1 w-40">Nama Pengawas</td><td className="py-1">: <span className="font-medium">{user?.nama || 'Subariyanto, S.Pd, M.Pd.I'}</span></td></tr>
              <tr><td className="py-1">NIP</td><td className="py-1">: 197002122005011004</td></tr>
              <tr><td className="py-1">Jabatan</td><td className="py-1">: Pengawas Madrasah</td></tr>
              <tr><td className="py-1">Wilayah Binaan</td><td className="py-1">: {madrasahBinaan.length} Madrasah (RA, MI, MTs, MA)</td></tr>
              <tr><td className="py-1">Tanggal Laporan</td><td className="py-1">: {formatDate(today.toISOString())}</td></tr>
            </tbody>
          </table>
        </div>

        {/* I. Pendahuluan */}
        <Section num="I" title="PENDAHULUAN">
          <p className="text-justify">Laporan ini disusun sebagai bukti pelaksanaan tugas monitoring dan evaluasi (monev) terhadap implementasi Kurikulum Berbasis Cinta (KBC) di madrasah binaan dalam wilayah Pokjawas Madrasah Kabupaten Jember. KBC merupakan implementasi pendidikan yang menanamkan lima nilai utama (Panca Cinta): Cinta Allah dan Rasul, Cinta Ilmu, Cinta Diri dan Sesama, Cinta Lingkungan, dan Cinta Tanah Air, sebagaimana yang dicanangkan oleh Kementerian Agama RI.</p>
        </Section>

        {/* II. Rekap Umum */}
        <Section num="II" title="REKAP UMUM IMPLEMENTASI KBC">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 print:grid-cols-4">
            <StatBox label="Madrasah Binaan" value={madrasahBinaan.length} />
            <StatBox label="Total Guru" value={totalGuru} />
            <StatBox label="Guru Aktif" value={`${guruAktif.size} (${persentaseAktif}%)`} />
            <StatBox label="Total Jurnal" value={jurnalPeriode.length} />
            <StatBox label="Jurnal Disetujui" value={jurnalPeriode.filter(j=>j.status==='Disetujui').length} />
            <StatBox label="Perlu Validasi" value={jurnalPeriode.filter(j=>j.status==='Dikirim'||j.status==='Perlu Revisi').length} />
            <StatBox label="Validasi Selesai" value={validasiPeriode.length} />
            <StatBox label="Rata-rata Skor" value={validasiPeriode.length > 0 ? Math.round(validasiPeriode.reduce((s,v)=>s+v.totalSkor,0)/validasiPeriode.length) : '-'} />
          </div>
        </Section>

        {/* III. Rekap per Madrasah */}
        <Section num="III" title="REKAP PER MADRASAH BINAAN">
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-400 py-2 px-2 text-left">No</th>
                <th className="border border-gray-400 py-2 px-2 text-left">Nama Madrasah</th>
                <th className="border border-gray-400 py-2 px-2">Jenjang</th>
                <th className="border border-gray-400 py-2 px-2">Guru</th>
                <th className="border border-gray-400 py-2 px-2">Jurnal</th>
                <th className="border border-gray-400 py-2 px-2">Aktif (%)</th>
                <th className="border border-gray-400 py-2 px-2">Avg Skor</th>
                <th className="border border-gray-400 py-2 px-2 text-left">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {madrasahStats.map((m, i) => (
                <tr key={m.id}>
                  <td className="border border-gray-400 py-1.5 px-2">{i+1}</td>
                  <td className="border border-gray-400 py-1.5 px-2">{m.nama}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{m.jenjang}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{m.jmlGuruAktif}/{m.jmlGuru}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{m.jmlJurnal}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{m.aktifPct}%</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{m.avgSkor || '-'}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-xs">{m.kategori}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* IV. Penerapan Panca Cinta */}
        <Section num="IV" title="ANALISIS PENERAPAN NILAI PANCA CINTA">
          <p className="mb-3 text-justify">Berikut frekuensi penerapan kelima nilai Panca Cinta dalam jurnal pembelajaran guru di seluruh madrasah binaan selama periode pelaporan:</p>
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-400 py-2 px-2">No</th>
                <th className="border border-gray-400 py-2 px-2 text-left">Nilai Panca Cinta</th>
                <th className="border border-gray-400 py-2 px-2">Frekuensi</th>
                <th className="border border-gray-400 py-2 px-2">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {pancaSorted.map(([nama, val], i) => {
                const total = pancaSorted.reduce((s,[,v]) => s+v, 0);
                const pct = total > 0 ? Math.round((val/total)*100) : 0;
                return (
                  <tr key={nama}>
                    <td className="border border-gray-400 py-1.5 px-2 text-center">{i+1}</td>
                    <td className="border border-gray-400 py-1.5 px-2">{nama}</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-center">{val}</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-center">{pct}%</td>
                  </tr>
                );
              })}
              {pancaSorted.length === 0 && <tr><td colSpan="4" className="border border-gray-400 py-3 text-center text-gray-400">Belum ada data penerapan Panca Cinta dalam periode ini</td></tr>}
            </tbody>
          </table>
          {pancaSorted.length > 0 && (
            <p className="mt-3 text-justify text-xs">
              Nilai paling banyak diterapkan: <strong>{pancaSorted[0][0]}</strong> ({pancaSorted[0][1]}x).
              {pancaSorted.length > 1 && pancaSorted[pancaSorted.length-1][1] < pancaSorted[0][1] / 2 && ` Sementara itu, nilai ${pancaSorted[pancaSorted.length-1][0]} masih perlu didorong penerapannya.`}
            </p>
          )}
        </Section>

        {/* V. Madrasah Berkinerja Baik */}
        <Section num="V" title="MADRASAH BERKINERJA BAIK">
          {baik.length === 0 ? <p className="text-gray-500">Belum ada madrasah dalam kategori ini pada periode pelaporan.</p> :
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              {baik.map(m => <li key={m.id}><strong>{m.nama}</strong> ({m.jenjang}, {m.kecamatan}) — {m.aktifPct}% guru aktif, {m.jmlJurnal} jurnal, rata-rata skor {m.avgSkor || '-'}</li>)}
            </ol>
          }
        </Section>

        {/* VI. Rekomendasi Pendampingan */}
        <Section num="VI" title="REKOMENDASI MADRASAH PERLU PENDAMPINGAN">
          {perluPendampingan.length === 0 ? <p className="text-green-700">Tidak ada madrasah yang masuk kategori perlu pendampingan intensif pada periode pelaporan ini.</p> :
            <>
              <p className="mb-2 text-justify">Madrasah berikut direkomendasikan untuk mendapatkan supervisi dan pendampingan intensif terkait implementasi KBC:</p>
              <ol className="list-decimal pl-6 space-y-2 text-sm">
                {perluPendampingan.map(m => (
                  <li key={m.id}>
                    <strong>{m.nama}</strong> ({m.jenjang}, {m.kecamatan})
                    <ul className="list-disc pl-5 mt-1 text-xs text-gray-700">
                      {m.jmlJurnal === 0 && <li>Belum ada jurnal sama sekali pada periode ini</li>}
                      {m.aktifPct < 50 && m.jmlJurnal > 0 && <li>Hanya {m.aktifPct}% guru ({m.jmlGuruAktif} dari {m.jmlGuru}) aktif mengisi jurnal</li>}
                      {m.avgSkor > 0 && m.avgSkor < 60 && <li>Rata-rata skor validasi {m.avgSkor} (kategori {getKategoriSkor(m.avgSkor)})</li>}
                      <li className="text-[#102a4d] font-medium">Rekomendasi tindak lanjut: penjadwalan supervisi akademik & pendampingan KBC oleh pengawas dalam 2 minggu ke depan</li>
                    </ul>
                  </li>
                ))}
              </ol>
            </>
          }
        </Section>

        {/* VII. Catatan & Kesimpulan */}
        <Section num="VII" title="CATATAN DAN KESIMPULAN">
          <p className="text-justify mb-2">
            Berdasarkan data monev di atas, implementasi KBC di {madrasahBinaan.length} madrasah binaan menunjukkan tingkat keaktifan guru sebesar <strong>{persentaseAktif}%</strong> pada periode pelaporan.
            {baik.length > 0 && ` Sebanyak ${baik.length} madrasah menunjukkan kinerja baik dan dapat dijadikan rujukan praktik baik (good practice).`}
            {perluPendampingan.length > 0 && ` Sementara itu, ${perluPendampingan.length} madrasah masih memerlukan pendampingan intensif.`}
          </p>
          {catatanUmum && <p className="mt-3 text-justify italic">{catatanUmum}</p>}
        </Section>

        {/* VIII. Penutup */}
        <Section num="VIII" title="PENUTUP">
          <p className="text-justify">Demikian laporan monitoring dan evaluasi ini disusun sebagai bukti pelaksanaan tugas pengawasan dan sebagai bahan tindak lanjut implementasi Kurikulum Berbasis Cinta di madrasah binaan. Atas perhatian dan kerja sama semua pihak, kami sampaikan terima kasih.</p>
        </Section>

        {/* TTD */}
        <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
          <div></div>
          <div className="text-center">
            <p>Jember, {formatDate(today.toISOString())}</p>
            <p>Pengawas Madrasah,</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{user?.nama || 'SUBARIYANTO, S.Pd, M.Pd.I'}</p>
            <p>NIP. 197002122005011004</p>
          </div>
        </div>
      </div>

      <style>{`@media print { body { font-size: 11px } .no-print { display: none !important } #laporan-pengawas { box-shadow: none !important; border: 0 !important } @page { size: A4; margin: 1.5cm } }`}</style>
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-sm mb-2">{num}. {title}</h3>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="border border-gray-300 rounded-lg p-3 text-center">
      <p className="text-[10px] text-gray-500 uppercase">{label}</p>
      <p className="text-base font-bold text-[#102a4d]">{value}</p>
    </div>
  );
}