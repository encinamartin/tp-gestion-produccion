/* eslint-disable react-refresh/only-export-components */
// ==========================================
// 1. IMPORTACIONES Y DEFINICIÓN DE TIPOS
// ==========================================
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'planificador' | 'operario';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para obtener y validar credenciales iniciales de localStorage
const getInitialAuth = () => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!savedToken || !savedUser) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }

  try {
    const parsedUser = JSON.parse(savedUser) as User;
    return { token: savedToken, user: parsedUser };
  } catch (error) {
    console.error('Error al parsear el usuario del localStorage:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
};

// ==========================================
// 2. PROVEEDOR DEL CONTEXTO (AUTHPROVIDER)
// ==========================================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Estado inicial saneado síncronamente
  const [authState, setAuthState] = useState(getInitialAuth);
  const [isLoading] = useState<boolean>(false);

  // Función para iniciar sesión
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setAuthState({ token: newToken, user: newUser });
  };

  // Función para cerrar sesión y limpiar el almacenamiento local
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ token: null, user: null });
  };

  // Validación estricta: requiere AMBOS elementos para considerar autenticado al usuario
  const isAuthenticated = Boolean(authState.token && authState.user);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// 3. HOOK PERSONALIZADO (USEAUTH)
// ==========================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};