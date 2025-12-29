import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem("currentUser", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);