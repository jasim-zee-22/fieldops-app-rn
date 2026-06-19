import { api } from './client';
import type { ApiEnvelope, User } from '@/types';

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post<ApiEnvelope<{ token: string; user: User }>>('/auth/login', {
    email,
    password,
  });
  return data.data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<ApiEnvelope<User>>('/auth/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function updateProfile(payload: Partial<Pick<User, 'name' | 'email' | 'phone'>>): Promise<User> {
  const { data } = await api.put<ApiEnvelope<User>>('/auth/profile', payload);
  return data.data;
}
