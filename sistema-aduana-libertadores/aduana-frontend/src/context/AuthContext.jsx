import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aduana_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('aduana_token', data.token);
    localStorage.setItem('aduana_user', JSON.stringify(data));
    setUser(data);
    toast.success(`Bienvenido, ${data.nombreCompleto}`);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aduana_token');
    localStorage.removeItem('aduana_user');
    setUser(null);
    toast('Sesión cerrada correctamente.');
  }, []);

  const tieneRol = useCallback((...roles) => {
    return user && roles.includes(user.rol);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, tieneRol, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
