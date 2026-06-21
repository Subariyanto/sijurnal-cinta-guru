import React, { createContext, useContext, useState, useEffect } from 'react';
import { getData } from './store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('sijurnal_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) sessionStorage.setItem('sijurnal_user', JSON.stringify(user));
    else sessionStorage.removeItem('sijurnal_user');
  }, [user]);

  const login = (username, password) => {
    const d = getData();
    const found = d.pengguna.find(u => u.username === username && u.password === password);
    if (!found) return null;
    setUser(found);
    return found;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}