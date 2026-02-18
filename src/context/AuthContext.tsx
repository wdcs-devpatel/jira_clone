import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, AuthContextType } from "../interfaces";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT payload without a library
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem("token");
    return (savedToken && savedToken !== "undefined") ? savedToken : null;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      if (!savedUser || savedUser === "undefined") return null;
      return JSON.parse(savedUser) as User;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token_expiry");
    setToken(null);
    setUser(null);
  };

  const login = (newToken: string, userData: User) => {
    // Safety check to prevent storing "undefined"
    if (!newToken || newToken === "undefined") return;

    const decoded = parseJwt(newToken);

    if (decoded?.exp) {
      const expiry = decoded.exp * 1000; // Convert to milliseconds
      localStorage.setItem("token_expiry", expiry.toString());
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
  };

  // AUTO-LOGOUT EFFECT
  useEffect(() => {
    const expiry = localStorage.getItem("token_expiry");
    if (!expiry || !token) return;

    const timeout = Number(expiry) - Date.now();

    if (timeout <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(logout, timeout);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}