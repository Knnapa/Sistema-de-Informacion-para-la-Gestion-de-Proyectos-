import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('miudes_user');
    return guardado ? JSON.parse(guardado) : null;
  });

  async function login(correo, password) {
    const { data } = await api.post('/auth/login', { correo, password });
    localStorage.setItem('miudes_token', data.token);
    localStorage.setItem('miudes_user', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem('miudes_token');
    localStorage.removeItem('miudes_user');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
