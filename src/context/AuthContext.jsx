import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    } catch {
      console.warn("Storage access blocked");
    }
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    try {
      localStorage.setItem("token", newToken);
    } catch {}
  };

  const logout = () => {
    setToken(null);
    try {
      localStorage.removeItem("token");
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
