import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const persist = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password, portal) => {
    const { data } = await api.post('/auth/login', { email, password, portal });
    return persist(data);
  };

  const adminLogin = async (email, password, accessCode) => {
    const { data } = await api.post('/auth/admin-login', { email, password, accessCode });
    return persist(data);
  };

  const updateUser = (patch) => {
    const u = { ...user, ...patch };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}