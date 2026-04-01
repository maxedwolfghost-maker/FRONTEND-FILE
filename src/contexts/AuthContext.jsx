import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) setUser({ username });
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    setUser({ username: res.data.username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
