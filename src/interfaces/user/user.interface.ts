
export type UserId = string | number;

export interface User {
  id: UserId;

  username?: string;
  email?: string;

  firstName?: string;
  lastName?: string;

  avatar?: string;
  image?: string;

  phone?: string; 

  [key: string]: any;
}
