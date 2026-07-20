import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { activationCodeId } from './activationCodes';
import { getUserProfile } from './firestore';
import { connectStore, subscribeStore } from './store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setRevision] = useState(0);
  const registrationInProgress = useRef(false);

  useEffect(() => subscribeStore(() => setRevision(x => x + 1)), []);

  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (!firebaseUser) { connectStore(null); return setUser(null); }
      // createUserWithEmailAndPassword fires this observer before the profile batch
      // is committed. Registration itself will finish the profile setup.
      if (registrationInProgress.current) return;
      const profile = await getUserProfile(firebaseUser.uid);
      if (!profile) {
        await signOut(auth);
        throw new Error('Profil pengguna belum dibuat oleh admin.');
      }
      if (profile.aktif === false) {
        await signOut(auth);
        throw new Error('Akun dinonaktifkan. Hubungi admin.');
      }
      // Compatibility with existing UI naming.
      const appUser = { ...profile, uid: firebaseUser.uid, email: firebaseUser.email };
      setUser(appUser);
      connectStore(appUser);
    } catch (error) {
      console.error('Gagal memuat profil pengguna', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }), []);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const profile = await getUserProfile(credential.user.uid);
    if (!profile) {
      await signOut(auth);
      throw new Error('Profil pengguna belum dibuat oleh admin.');
    }
    if (profile.aktif === false) {
      await signOut(auth);
      throw new Error('Akun dinonaktifkan. Hubungi admin.');
    }
    return { ...profile, uid: credential.user.uid, email: credential.user.email };
  };

  const register = async ({ email, password, nama, code, role, madrasahId, madrasahBinaanIds }) => {
    registrationInProgress.current = true;
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const uid = credential.user.uid; const codeId = activationCodeId(code);
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid), { email: credential.user.email, nama: nama.trim(), role, madrasahId: madrasahId.trim(), madrasahBinaanIds, aktif:true, activationCodeId:codeId, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
      batch.update(doc(db, 'activationCodes', codeId), { used:true, usedBy:uid, usedAt:serverTimestamp() });
      await batch.commit();
      // End registration in a predictable signed-out state; user then logs in normally.
      await signOut(auth);
      return credential.user;
    } catch (error) {
      if (credential?.user) await deleteUser(credential.user).catch(() => {});
      throw error;
    } finally {
      registrationInProgress.current = false;
    }
  };
  const logout = () => signOut(auth);
  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
