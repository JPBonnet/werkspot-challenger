import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: 'professional' | 'customer';
  profileComplete: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  initialize: (token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  initialize: async (token: string) => {
    try {
      set({ isLoading: true, token });
      // Verify token is still valid
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, token: null });
      await SecureStore.deleteItemAsync('authToken');
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('authToken', token);
      set({ token, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/api/auth/register', data);
      const { token, user } = response.data;
      await SecureStore.setItemAsync('authToken', token);
      set({ token, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    set({ user: null, token: null });
  },
}));
