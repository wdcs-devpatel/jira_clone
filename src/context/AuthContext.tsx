import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "../interfaces";

interface AuthContextType {
  token: string | null;
  user: User | null;
  permissions: string[]; // Added for direct access in components
  showTimeoutPrompt: boolean;
  triggerRefresh: () => Promise<void>;
  login: (  
    tokens: { accessToken: string; refreshToken: string },
    userData: User
  ) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

import { refreshToken as apiRefreshToken } from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem("currentUser");
    return u ? JSON.parse(u) : null;
  });

  const [showTimeoutPrompt, setShowTimeoutPrompt] = useState(false);

  // Derived state for easier permission checks throughout the app
  const [permissions, setPermissions] = useState<string[]>(user?.permissions || []);

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("accessToken"));
      const u = localStorage.getItem("currentUser");
      const parsedUser = u ? JSON.parse(u) : null;
      setUser(parsedUser);
      setPermissions(parsedUser?.permissions || []);
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // ⏰ Timeout Timer: Triggers Warning 5 minutes before 1 hour runs out.
  useEffect(() => {
    if (!token) return;

    const warningTime = 55 * 60 * 1000; // 55 minutes
    
    // FOR TESTING: 10 seconds (uncomment below for easy verified testing)
    // const warningTime = 10 * 1000; 

    const timer = setTimeout(() => {
      setShowTimeoutPrompt(true);
    }, warningTime);

    return () => clearTimeout(timer);
  }, [token]);

  /**
   * LOGIN
   * Properly maps the backend response into a safe RBAC-compliant user object.
   */
  const login = (
    tokens: { accessToken: string ; refreshToken: string },
    userData: User
  ) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    // 🔥 Explicitly mapping the new RBAC structure
    const safeUser: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role_id: userData.role_id, // Links to the Role ID
      Role: userData.Role,       // Structured Role object { id, name }
      permissions: userData.permissions || [] // Array of capability strings
    };

    localStorage.setItem("currentUser", JSON.stringify(safeUser));
    setToken(tokens.accessToken); 
    setUser(safeUser);
    setPermissions(safeUser.permissions);

    // Notify other components or tabs of the auth change
    window.dispatchEvent(new Event("storage"));
  };

  /**
   * LOGOUT
   * Clears all session data and redirects to the landing page.
   */
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setPermissions([]);
    window.location.href = "/";
  };

  /**
   * TRIGGER REFRESH
   * Manually refreshes token on user consent
   */
  const triggerRefresh = async () => {
    try {
      await apiRefreshToken();
      setShowTimeoutPrompt(false);
      
      // Update local token state to reset the timer effect bucket
      setToken(localStorage.getItem("accessToken"));
    } catch (err) {
      console.error("Manual refresh failed. Logging out...");
      logout();
    }
  };

  /**
   * UPDATE USER
   * Merges profile updates or permission changes into the current session.
   */
  const updateUser = (updated: Partial<User>) => {
    if (!user) return;

    const newUser = { ...user, ...updated };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
    
    // Ensure permission state stays in sync if permissions were part of the update
    if (updated.permissions) {
      setPermissions(updated.permissions);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, permissions, showTimeoutPrompt, triggerRefresh, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}