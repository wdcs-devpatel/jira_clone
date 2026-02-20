export type UserId = string | number;

export interface User {
  id: UserId;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  image?: string;
  phone?: string; 
  position?: string; // Added position
  name?: string;     // Computed field for UI display
  [key: string]: any; 
}