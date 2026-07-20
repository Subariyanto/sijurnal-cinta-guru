import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const ROLE_LABELS = { guru: 'Guru', kamad: 'Kepala Madrasah', pengawas: 'Pengawas' };

export function generateActivationCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let raw = '';
  while (raw.length < 12) {
    const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < 256 - (256 % alphabet.length)) raw += alphabet[byte % alphabet.length];
      if (raw.length === 12) break;
    }
  }
  return `KBC-${raw.slice(0,4)}-${raw.slice(4,8)}-${raw.slice(8)}`;
}
export const activationCodeId = code => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
export async function listActivationCodes() {
  const snap = await getDocs(query(collection(db, 'activationCodes'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function createActivationCode({ role, email='', madrasahId='', madrasahBinaanIds=[], expiresDays=30, createdBy }) {
  const code = generateActivationCode(); const id = activationCodeId(code);
  await setDoc(doc(db, 'activationCodes', id), { code, role, email: email.trim().toLowerCase(), madrasahId, madrasahBinaanIds, active:true, used:false, usedBy:'', createdBy, createdAt:serverTimestamp(), expiresAt:Timestamp.fromDate(new Date(Date.now()+expiresDays*86400000)) });
  return code;
}
export const revokeActivationCode = id => updateDoc(doc(db,'activationCodes',id), { active:false, revokedAt:serverTimestamp() });
export const deleteActivationCode = id => deleteDoc(doc(db,'activationCodes',id));
