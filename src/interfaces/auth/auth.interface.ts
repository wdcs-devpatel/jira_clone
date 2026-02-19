import { User } from "../user/user.interface";

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface AuthContextType extends AuthState {
  login: (
    tokens: { accessToken: string; refreshToken: string },
    user: User
  ) => void;

  logout: () => void;

  updateUser: (updatedData: Partial<User>) => void;
}
