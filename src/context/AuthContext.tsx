import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, AuthContextType } from "../interfaces";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem("currentUser");
    try {
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  // Keep state in sync across tabs or after profile updates
  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("accessToken"));
      const u = localStorage.getItem("currentUser");
      try {
        setUser(u ? JSON.parse(u) : null);
      } catch (e) {
        setUser(null);
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const login = (
    tokens: { accessToken: string; refreshToken: string },
    userData: User
  ) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    // Explicitly map all fields including position to ensure dashboard permissions work
    const safeUser: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      position: userData.position, // Critical for role-based button visibility
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    };

    localStorage.setItem("currentUser", JSON.stringify(safeUser));
    setToken(tokens.accessToken);
    setUser(safeUser);

    // FIX: Manually trigger storage event so Dashboard re-calculates permissions immediately
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    
    // Merge updates and save to local storage
    const newUser = { ...user, ...updated };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);

    // Notify other parts of the app (like Dashboard) that storage has changed
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}