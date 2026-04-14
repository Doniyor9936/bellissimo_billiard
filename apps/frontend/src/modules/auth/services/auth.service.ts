import apiClient from '@/app/api/client';
import type {
  AuthData,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
  RefreshTokenRequest,
  User,
} from '../types';
import { AUTH_ENDPOINTS } from '@/app/api/endpoint';

export const authService = {
  async login(data: LoginRequest): Promise<AuthData> {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.login, data);
    return response.data.data;
  },

  async refresh(data: RefreshTokenRequest): Promise<AuthTokens> {
    const response = await apiClient.post<RefreshResponse>(AUTH_ENDPOINTS.refresh, data);
    return response.data.data;
  },

  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.post<LogoutResponse>(AUTH_ENDPOINTS.logout, data);
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<MeResponse>(AUTH_ENDPOINTS.me);
    return response.data.data;
  },
};
