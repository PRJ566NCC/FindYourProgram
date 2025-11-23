"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Global auth state: isAuthed, loading, user, refresh
const AuthContext = createContext({
  isAuthed: false,
  user: null,
  loading: true,
  refresh: () => {},
});

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null); // ← store user info
  const [loading, setLoading] = useState(true);

  // Check login status from /api/me
  async function checkAuth() {
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      setIsAuthed(!!data?.authenticated);
      setUser(data?.user || null); // ← store the returned user object
    } catch {
      setIsAuthed(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Run once on first load
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed, user, loading, refresh: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth state
export const useAuth = () => useContext(AuthContext);
