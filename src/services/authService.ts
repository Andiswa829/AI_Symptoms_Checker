import { ApiService } from '../utils/api';
import { endpoints } from '../config/env';
import { User } from '../types/outbreaks';


interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | null;
    gender?: string;
    picture?: string | null;
  };
  externalProvider?:string;
}

export class AuthService {
  static async loginWithEmail(payload: { email: string; password: string; }): Promise<User> {
    const resp = await ApiService.post(endpoints.auth.login, payload) as AuthResponse;
    ApiService.setToken(resp.token);
    return map(resp);
  }

  static async registerWithEmail(payload: {
    email: string;
    password: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | null;
    gender?: string;
  }): Promise<User> {
    const resp = await ApiService.post(endpoints.auth.register, payload) as AuthResponse;
    ApiService.setToken(resp.token);
    return map(resp);
  }

  static async loginWithGoogle(idToken: string, accessToken?: string): Promise<User> {
    const resp = await ApiService.post(endpoints.auth.google, { idToken, accessToken }) as AuthResponse;
    ApiService.setToken(resp.token);
    return map(resp);
  }

  static logout() {
    ApiService.clearToken();
  }

  static isAuthenticated() {
    return !!ApiService.getToken();
  }
}

function map(resp: AuthResponse): User {
  const u = resp.user;
  return {
    id: u.id,
    name: (u.firstName || u.lastName) ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : undefined,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    avatar: u.picture ?? undefined,
    externalProvider: resp.externalProvider,
    provider: "email",
    accessToken: resp.token,
    dateOfBirth: u.dateOfBirth ?? null,
    gender: u.gender ?? undefined,
    preferences: { notifications: true, outbreakAlerts: true, location: true },
    createdAt: new Date(),
    lastLogin: new Date(),
  } as User;
}