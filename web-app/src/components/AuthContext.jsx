import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
  const [user, setUser] = useState(() => safeParse(localStorage.getItem('userData')));

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthed: Boolean(token && user),
      setSession: ({ token: nextToken, user: nextUser }) => {
        localStorage.setItem('authToken', nextToken);
        localStorage.setItem('userData', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      clearSession: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setToken('');
        setUser(null);
      },
      updateUser: (patch) => {
        setUser((prev) => {
          const updated = { ...(prev || {}), ...(patch || {}) };
          localStorage.setItem('userData', JSON.stringify(updated));
          return updated;
        });
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
