import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Firestore rules are authoritative. These filters also keep reads query-compatible.
export function scopedQuery(collectionName, profile) {
  const ref = collection(db, collectionName);
  if (profile.role === 'admin') return query(ref);
  if (profile.role === 'guru') return query(ref, where('ownerId', '==', profile.id));
  if (profile.role === 'kamad') return query(ref, where('madrasahId', '==', profile.madrasahId));
  if (profile.role === 'pengawas') return query(ref, where('madrasahId', 'in', profile.madrasahBinaanIds?.slice(0, 30) || ['__none__']));
  throw new Error('Role tidak dikenal');
}

export async function listScoped(collectionName, profile) {
  const snap = await getDocs(scopedQuery(collectionName, profile));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createScoped(collectionName, data, profile, id) {
  const payload = {
    ...data,
    ownerId: profile.role === 'guru' ? profile.id : data.ownerId,
    madrasahId: profile.role === 'kamad' ? profile.madrasahId : data.madrasahId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
  await setDoc(ref, payload);
  return ref.id;
}

export async function updateScoped(collectionName, id, patch) {
  // ownerId/madrasahId immutable by rules.
  const { ownerId: _ownerId, madrasahId: _madrasahId, ...safePatch } = patch;
  await updateDoc(doc(db, collectionName, id), { ...safePatch, updatedAt: serverTimestamp() });
}

export function deleteScoped(collectionName, id) {
  return deleteDoc(doc(db, collectionName, id));
}
