import type { UserDTO } from "./user.types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  locale?: string;
}

export interface AuthResult {
  user: UserDTO;
  tokens: AuthTokens;
}
