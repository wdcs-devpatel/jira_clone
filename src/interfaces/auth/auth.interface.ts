import { User } from "../user/user.interface"; 

/* =======================
   API Response Types
======================= */

export interface LoginResponse {
  id: string | number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  accessToken: string;
}

/* =======================
   Auth State
======================= */

export interface AuthState {
  token: string | null;
  user: User | null;
}

/* =======================
   Auth Context Contract
======================= */

export interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}
