"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fitzone_user");
      if (saved) setUser(JSON.parse(saved));
    } catch (_) {}
    setLoaded(true);
  }, []);

  const loginUser = (data) => {
    setUser(data);
    localStorage.setItem("fitzone_user", JSON.stringify(data));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("fitzone_user");
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
