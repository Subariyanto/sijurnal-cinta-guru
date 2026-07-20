import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile } from './firestore';
import { connectStore, subscribeStore } from './store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setRevision] = useState(0);

  useEffect(() => subscribeStore(() => setRevision(x => x + 1)), []);

  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (!firebaseUser) { connectStore(null); return setUser(null); }
      const profile = await getUserProfile(firebaseUser.uid);
      if (!profile) {
        await signOut(auth);
        throw new Error('Profil pengguna belum dibuat oleh admin.');
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
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(credential.user.uid);
    if (!profile) {
      await signOut(auth);
      throw new Error('Profil pengguna belum dibuat oleh admin.');
    }
    return { ...profile, uid: credential.user.uid, email: credential.user.email };
  };

  const logout = () => signOut(auth);
  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
