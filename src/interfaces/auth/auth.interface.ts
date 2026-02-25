import { User } from "../user/user.interface";

export interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[]; // Stored at top level for easy access
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  permissions: string[];
  
  login: (
    tokens: { accessToken: string; refreshToken: string },
    user: User
  ) => void;

  logout: () => void;

  updateUser: (updatedData: Partial<User>) => void;
}