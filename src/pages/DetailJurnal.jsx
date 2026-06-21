import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getData, formatDate } from '../lib/store';
import { ArrowLeft, Printer, Camera, FileText, CheckCircle } from 'lucide-react';

export default function DetailJurnal() {
  const { id } = useParams();
  const data = getData();
  const jurnal = data.jurnalHarian.find(j => j.id === id);
  const rencana = jurnal ? data.rencanaKBC.find(r => r.id === jurnal.rencanaId) : null;
  const evidenList = jurnal ? data.eviden.filter(e => e.jurnalId === jurnal.id) : [];
  const validasi = jurnal ? data.validasi.find(v => v.jurnalId === jurnal.id) : null;

  if (!jurnal) return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-500">Jurnal tidak ditemukan</h3>
      <Link to="/jurnal" className="text-[#102a4d] hover:underline text-sm mt-2 inline-block">Kembali ke daftar jurnal</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <Link to="/jurnal" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#102a4d]"><ArrowLeft className="w-4 h-4"/>Kembali</Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#102a4d] text-white rounded-lg text-sm font-medium"><Printer className="w-4 h-4"/>Cetak</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#102a4d] to-[#0f2640] p-6 text-white">
          <h1 className="text-xl font-bold">Jurnal Harian KBC</h1>
          <p className="text-blue-200 text-sm mt-1">{jurnal.madrasahNama}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${jurnal.status==='Disetujui'?'bg-green-500/20 text-green-200':jurnal.status==='Dikirim'?'bg-yellow-500/20 text-yellow-200':jurnal.status==='Perlu Revisi'?'bg-red-500/20 text-red-200':'bg-gray-500/20 text-gray-200'}`}>{jurnal.status}</span>
            <span className="text-sm text-blue-200">{formatDate(jurnal.tanggal)} &bull; {jurnal.jam}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Identitas Pembelajaran" icon={FileText}>
            <Grid>
              <Item label="Guru" value={jurnal.guruNama} />
              <Item label="Kelas" value={jurnal.kelasNama} />
              <Item label="Mata Pelajaran" value={jurnal.mapel} />
              <Item label="Materi" value={jurnal.materi} />
            </Grid>
          </Section>

          <Section title="Kegiatan Pembelajaran" icon={FileText}>
            <div className="space-y-3">
              <div><Label>Kegiatan Pembuka</Label><p className="text-sm text-gray-700">{jurnal.kegiatanPembuka}</p></div>
              <div><Label>Kegiatan Inti</Label><p className="text-sm text-gray-700">{jurnal.kegiatanInti}</p></div>
              <div><Label>Kegiatan Penutup</Label><p className="text-sm text-gray-700">{jurnal.kegiatanPenutup}</p></div>
            </div>
          </Section>

          <Section title="Panca Cinta & KBC" icon={FileText}>
            <div className="space-y-3">
              <div>
                <Label>Nilai yang Muncul</Label>
                <div className="flex flex-wrap gap-2 mt-1">{(jurnal.pancaCinta||[]).map(pc=><span key={pc} className="px-3 py-1 bg-[#eecb59]/20 text-[#102a4d] rounded-full text-xs font-medium">{pc}</span>)}</div>
              </div>
              <div><Label>Narasi Implementasi KBC</Label><p className="text-sm text-gray-700">{jurnal.narasiKBC}</p></div>
              <div><Label>Respon Siswa</Label><p className="text-sm text-gray-700">{jurnal.responSiswa}</p></div>
              <div><Label>Dampak Positif</Label><p className="text-sm text-gray-700">{jurnal.dampakPositif}</p></div>
            </div>
          </Section>

          <Section title="Refleksi & Tindak Lanjut" icon={FileText}>
            <div className="space-y-3">
              <div><Label>Kendala</Label><p className="text-sm text-gray-700">{jurnal.kendala || '-'}</p></div>
              <div><Label>Solusi Guru</Label><p className="text-sm text-gray-700">{jurnal.solusi || '-'}</p></div>
              <div><Label>Refleksi</Label><p className="text-sm text-gray-700">{jurnal.refleksi || '-'}</p></div>
              <div><Label>Rencana Tindak Lanjut</Label><p className="text-sm text-gray-700">{jurnal.rencanaTL || '-'}</p></div>
            </div>
          </Section>

          <Section title="Eviden Digital" icon={Camera}>
            {evidenList.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada eviden</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {evidenList.map(e => (
                  <div key={e.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2"><Camera className="w-6 h-6 text-gray-400"/></div>
                    <h4 className="text-xs font-medium text-gray-700 truncate">{e.judul}</h4>
                    <span className="text-xs text-gray-400">{e.jenis}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {validasi && (
            <Section title="Hasil Validasi" icon={CheckCircle}>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Validator: <span className="font-medium text-gray-800">{validasi.validatorNama}</span></p>
                    <p className="text-xs text-gray-500">Jabatan: {validasi.validatorRole} &bull; {formatDate(validasi.tanggal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{validasi.totalSkor}<span className="text-sm text-gray-400">/100</span></p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${validasi.totalSkor>=90?'bg-green-100 text-green-700':validasi.totalSkor>=75?'bg-blue-100 text-blue-700':validasi.totalSkor>=60?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{validasi.kategori}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded"><span className="text-gray-500">Kesesuaian Rencana</span><p className="font-bold">{validasi.skor.kesesuaianRencana}/20</p></div>
                  <div className="bg-white p-2 rounded"><span className="text-gray-500">Pelaksanaan Panca Cinta</span><p className="font-bold">{validasi.skor.pelaksanaanPancaCinta}/25</p></div>
                  <div className="bg-white p-2 rounded"><span className="text-gray-500">Bukti/Eviden</span><p className="font-bold">{validasi.skor.buktiEviden}/20</p></div>
                  <div className="bg-white p-2 rounded"><span className="text-gray-500">Dampak Siswa</span><p className="font-bold">{validasi.skor.dampakSiswa}/15</p></div>
                  <div className="bg-white p-2 rounded"><span className="text-gray-500">Refleksi Guru</span><p className="font-bold">{validasi.skor.refleksiGuru}/10</p></div>
                  <div className="bg-white p-2 rounded"><span className="text-gray-500">Kelengkapan</span><p className="font-bold">{validasi.skor.kelengkapan}/10</p></div>
                </div>

                {validasi.catatanApresiasi && <div className="mt-3"><Label>Catatan Apresiasi</Label><p className="text-sm text-green-700">{validasi.catatanApresiasi}</p></div>}
                {validasi.catatanPerbaikan && <div className="mt-2"><Label>Catatan Perbaikan</Label><p className="text-sm text-red-700">{validasi.catatanPerbaikan}</p></div>}
                {validasi.rekomendasi && <div className="mt-2"><Label>Rekomendasi</Label><p className="text-sm text-gray-700">{validasi.rekomendasi}</p></div>}
              </div>
            </Section>
          )}

          {rencana && (
            <Section title="Rencana Pembelajaran Terkait" icon={FileText}>
              <Grid>
                <Item label="Materi Pokok" value={rencana.materiPokok} />
                <Item label="Tujuan" value={rencana.tujuanPembelajaran} />
                <Item label="Metode" value={rencana.metode} />
                <Item label="Media" value={rencana.media} />
              </Grid>
            </Section>
          )}
        </div>
      </div>

      <style>{`@media print{body{font-size:12px}.no-print{display:none!important}}`}</style>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="border-t pt-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon className="w-4 h-4 text-[#102a4d]"/>{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>; }
function Item({ label, value }) { return <div><span className="text-xs text-gray-400">{label}</span><p className="text-sm text-gray-800 font-medium">{value || '-'}</p></div>; }
function Label({ children }) { return <span className="text-xs font-medium text-gray-500">{children}</span>; }