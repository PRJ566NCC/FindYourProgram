"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Global auth state: isAuthed, loading, and a refresh function
const AuthContext = createContext({
  isAuthed: false,
  loading: true,
  refresh: () => {},
});

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check login status from /api/me
  async function checkAuth() {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      setIsAuthed(!!data?.authenticated);
    } catch {
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  // Run once on first load
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed, loading, refresh: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth state
export const useAuth = () => useContext(AuthContext);
