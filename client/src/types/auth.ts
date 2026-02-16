import type { User } from "./user";

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

export interface SignUpResponse {
  uid: string;
  email: string;
  message: string;
}
