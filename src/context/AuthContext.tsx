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

    /* Sync state if tokens change (important for interceptor refresh) */
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

    /* LOGIN - FIXED VERSION */
    const login = (
      tokens: { accessToken: string; refreshToken: string },
      userData: User
    ) => {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      /* IMPORTANT FIX: Construct a safe user object to ensure consistency in storage */
      const safeUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email
      };

      localStorage.setItem("currentUser", JSON.stringify(safeUser));
      setToken(tokens.accessToken);
      setUser(safeUser);
    };

    /* LOGOUT */
    const logout = () => {
      localStorage.clear();
      setToken(null);
      setUser(null);
      window.location.href = "/";
    };

    /* UPDATE USER */
    const updateUser = (updated: Partial<User>) => {
      if (!user) return;

      const newUser = { ...user, ...updated };
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      setUser(newUser);
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