import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPatch, apiPost, setAuthTokenGetter } from './api.js';

const STORAGE_KEY = 'volna_auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    apiGet('/api/auth/me')
      .then((payload) => {
        if (!cancelled) setUser(payload.user);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload) => {
    const result = await apiPost('/api/auth/register', payload);
    persistSession(result.token, result.user);
    return result.user;
  }, [persistSession]);

  const login = useCallback(async (payload) => {
    const result = await apiPost('/api/auth/login', payload);
    persistSession(result.token, result.user);
    return result.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const result = await apiPatch('/api/auth/me', payload);
    setUser((current) => (current ? { ...current, ...result.user } : result.user));
    return result.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.isAdmin),
      register,
      login,
      logout,
      updateProfile,
    }),
    [user, token, loading, register, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
