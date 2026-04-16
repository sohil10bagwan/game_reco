import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);
const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
};
const AUTH_SESSION_ENDED_EVENT = 'auth:session-ended';
const TOKEN_FIELD_NAMES = ['token', 'accessToken', 'access_token', 'jwt'];

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const looksLikeUser = (value) => {
  if (!isPlainObject(value)) {
    return false;
  }

  return ['_id', 'id', 'name', 'email', 'role'].some((key) => hasOwn(value, key));
};

const stripAuthFields = (value) => {
  if (!isPlainObject(value)) {
    return null;
  }

  const sanitizedUser = { ...value };

  TOKEN_FIELD_NAMES.forEach((fieldName) => {
    delete sanitizedUser[fieldName];
  });

  return sanitizedUser;
};

const traverseObjectTree = (source, visitor) => {
  const queue = [source];
  const seen = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object' || seen.has(current)) {
      continue;
    }

    seen.add(current);

    const match = visitor(current);

    if (match) {
      return match;
    }

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    queue.push(...Object.values(current));
  }

  return null;
};

const findAuthToken = (source) =>
  traverseObjectTree(source, (current) => {
    if (!isPlainObject(current)) {
      return null;
    }

    for (const fieldName of TOKEN_FIELD_NAMES) {
      const token = current[fieldName];

      if (typeof token === 'string' && token.trim()) {
        return token;
      }
    }

    return null;
  });

const findAuthUser = (source) =>
  traverseObjectTree(source, (current) => {
    if (!looksLikeUser(current)) {
      return null;
    }

    return stripAuthFields(current);
  });

const normalizeAuthPayload = (payload, { allowMissingToken = false } = {}) => {
  const token = findAuthToken(payload);
  const user = findAuthUser(payload);

  if (!user) {
    throw new Error('Authentication response is missing user data.');
  }

  if (!token && !allowMissingToken) {
    throw new Error('Authentication response is missing a token.');
  }

  return { token: token || null, user };
};

const clearStoredSession = () => {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
};

const readStoredSession = () => {
  try {
    const storedToken = localStorage.getItem(STORAGE_KEYS.token);
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const token = storedToken || findAuthToken(parsedUser);
    const user = findAuthUser(parsedUser);

    if (!token || !user) {
      if (storedToken || storedUser) {
        clearStoredSession();
      }
      return { token: null, user: null };
    }

    if (storedToken !== token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    }

    const normalizedUser = JSON.stringify(user);

    if (storedUser !== normalizedUser) {
      localStorage.setItem(STORAGE_KEYS.user, normalizedUser);
    }

    return { token, user };
  } catch {
    clearStoredSession();
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncSession = useCallback(() => {
    setSession(readStoredSession());
  }, []);

  const persistSession = useCallback(({ token, user }) => {
    if (!token) {
      throw new Error('Authentication response is missing a token.');
    }

    if (!user) {
      throw new Error('Authentication response is missing user data.');
    }

    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    setSession({ token, user });
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (!event.key || event.key === STORAGE_KEYS.token || event.key === STORAGE_KEYS.user) {
        syncSession();
      }
    };

    const handleSessionEnded = () => {
      syncSession();
      setError('Session expired. Please login again.');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(AUTH_SESSION_ENDED_EVENT, handleSessionEnded);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(AUTH_SESSION_ENDED_EVENT, handleSessionEnded);
    };
  }, [syncSession]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.login({ email, password });
      const authData = normalizeAuthPayload(res.data);

      persistSession(authData);
      return { success: true, user: authData.user, authenticated: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.register({ name, email, password });
      const authData = normalizeAuthPayload(res.data, { allowMissingToken: true });

      if (authData.token) {
        persistSession(authData);
      } else {
        const loginRes = await authAPI.login({ email, password });
        const loginAuthData = normalizeAuthPayload(loginRes.data);

        persistSession(loginAuthData);

        return {
          success: true,
          user: loginAuthData.user,
          authenticated: true,
        };
      }

      return {
        success: true,
        user: authData.user,
        authenticated: Boolean(authData.token),
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession({ token: null, user: null });
    setError(null);
  }, []);

  const user = session.user;
  const token = session.token;
  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';

  const hasRole = useCallback((roles = []) => {
    const roleList = Array.isArray(roles) ? roles : [roles];

    if (roleList.length === 0) {
      return true;
    }

    return roleList.includes(user?.role);
  }, [user]);

  const getDefaultRoute = useCallback((targetUser = user) => {
    if (targetUser?.role === 'admin') {
      return '/adminpanel';
    }

    return '/';
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    hasRole,
    getDefaultRoute,
    setError,
    syncSession,
  }), [
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    hasRole,
    getDefaultRoute,
    syncSession,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};
