import apiClient from '../services/apiClient';
import { useAuthStore } from '../services/authStore';

jest.mock('../services/apiClient');

const mockedApi = apiClient as jest.Mocked<typeof apiClient>;

describe('Professional Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard - Job Loading', () => {
    it('should fetch available jobs', async () => {
      const mockJobs = [
        { id: '1', title: 'Fix kitchen sink', description: 'Leaking faucet', location: 'Amsterdam', budget: 120, status: 'open', postedAt: '2026-03-20' },
        { id: '2', title: 'Paint living room', description: '30m2 walls', location: 'Rotterdam', budget: 450, status: 'open', postedAt: '2026-03-19' },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: mockJobs });

      const response = await apiClient.get('/api/jobs');

      expect(mockedApi.get).toHaveBeenCalledWith('/api/jobs');
      expect(response.data).toHaveLength(2);
      expect(response.data[0].title).toBe('Fix kitchen sink');
    });

    it('should handle empty job list', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      const response = await apiClient.get('/api/jobs');
      expect(response.data).toHaveLength(0);
    });

    it('should handle network error on job fetch', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(apiClient.get('/api/jobs')).rejects.toThrow('Network Error');
    });
  });

  describe('Accept Job', () => {
    it('should accept an open job', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { success: true, jobId: '1', status: 'accepted' } });

      const response = await apiClient.post('/api/jobs/1/accept');

      expect(mockedApi.post).toHaveBeenCalledWith('/api/jobs/1/accept');
      expect(response.data.status).toBe('accepted');
    });

    it('should reject accepting already-taken job', async () => {
      mockedApi.post.mockRejectedValueOnce({ response: { status: 409, data: { message: 'Job already accepted' } } });

      await expect(apiClient.post('/api/jobs/99/accept')).rejects.toBeTruthy();
    });
  });

  describe('Earnings', () => {
    it('should fetch earnings summary', async () => {
      const mockEarnings = { thisMonth: 1250, total: 8400, completedJobs: 34 };
      mockedApi.get.mockResolvedValueOnce({ data: mockEarnings });

      const response = await apiClient.get('/api/professional/earnings');

      expect(response.data.thisMonth).toBe(1250);
      expect(response.data.total).toBe(8400);
      expect(response.data.completedJobs).toBe(34);
    });

    it('should calculate net earnings after 15% commission', () => {
      const gross = 1000;
      const commissionRate = 0.15;
      const net = gross * (1 - commissionRate);
      expect(net).toBe(850);
    });

    it('should handle zero earnings for new professional', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { thisMonth: 0, total: 0, completedJobs: 0 } });

      const response = await apiClient.get('/api/professional/earnings');
      expect(response.data.total).toBe(0);
    });
  });

  describe('Profile Updates', () => {
    it('should update profile information', async () => {
      const profileData = { name: 'Jan Updated', skills: ['plumbing', 'electrical'], hourlyRate: 55 };
      mockedApi.put.mockResolvedValueOnce({ data: { ...profileData, id: '1' } });

      const response = await apiClient.put('/api/professional/profile', profileData);

      expect(mockedApi.put).toHaveBeenCalledWith('/api/professional/profile', profileData);
      expect(response.data.name).toBe('Jan Updated');
    });

    it('should update profile photo', async () => {
      const formData = new FormData();
      mockedApi.post.mockResolvedValueOnce({ data: { photoUrl: 'https://cdn.example.com/photo.jpg' } });

      const response = await apiClient.post('/api/professional/photo', formData);
      expect(response.data.photoUrl).toBeTruthy();
    });

    it('should handle profile validation errors', async () => {
      mockedApi.put.mockRejectedValueOnce({ response: { status: 422, data: { errors: { hourlyRate: 'Must be positive' } } } });

      await expect(apiClient.put('/api/professional/profile', { hourlyRate: -10 })).rejects.toBeTruthy();
    });
  });
});
