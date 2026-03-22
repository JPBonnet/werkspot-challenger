import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../services/authStore';

// Mock dependencies
jest.mock('axios');
jest.mock('expo-secure-store');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAuthStore.setState({ user: null, token: null, isLoading: false });
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockUser = { id: '1', email: 'pro@test.com', name: 'Jan', userType: 'professional', profileComplete: true };
      mockedAxios.post.mockResolvedValueOnce({ data: { token: 'jwt-123', user: mockUser } });

      await useAuthStore.getState().login('pro@test.com', 'password123');

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', { email: 'pro@test.com', password: 'password123' });
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('authToken', 'jwt-123');
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().token).toBe('jwt-123');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should throw on invalid credentials', async () => {
      mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });

      await expect(useAuthStore.getState().login('bad@test.com', 'wrong')).rejects.toBeTruthy();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new professional and store token', async () => {
      const mockUser = { id: '2', email: 'new@test.com', name: 'Pieter', userType: 'professional', profileComplete: false };
      mockedAxios.post.mockResolvedValueOnce({ data: { token: 'jwt-456', user: mockUser } });

      const data = { name: 'Pieter', email: 'new@test.com', password: 'secure123', userType: 'professional' };
      await useAuthStore.getState().register(data);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/register', data);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('authToken', 'jwt-456');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should throw on duplicate email', async () => {
      mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } });

      await expect(useAuthStore.getState().register({ email: 'dup@test.com' })).rejects.toBeTruthy();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear user, token, and secure storage', async () => {
      useAuthStore.setState({ user: { id: '1', email: 'a@b.com', name: 'X', userType: 'professional', profileComplete: true }, token: 'jwt-123' });

      await useAuthStore.getState().logout();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('authToken');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should verify stored token and restore session', async () => {
      const mockUser = { id: '1', email: 'pro@test.com', name: 'Jan', userType: 'professional', profileComplete: true };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

      await useAuthStore.getState().initialize('stored-jwt');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me', { headers: { Authorization: 'Bearer stored-jwt' } });
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().token).toBe('stored-jwt');
    });

    it('should clear token on expired/invalid token', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

      await useAuthStore.getState().initialize('expired-jwt');

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('authToken');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });
  });
});
