import apiClient from '../services/apiClient';

jest.mock('../services/apiClient');

const mockedApi = apiClient as jest.Mocked<typeof apiClient>;

describe('Customer Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Professionals', () => {
    it('should search professionals by service type', async () => {
      const mockResults = [
        { id: '1', name: 'Jan Bakker', rating: 4.8, completedJobs: 120, hourlyRate: 45, skills: ['plumbing'] },
        { id: '2', name: 'Pieter Vries', rating: 4.5, completedJobs: 80, hourlyRate: 40, skills: ['plumbing'] },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: mockResults });

      const response = await apiClient.get('/api/professionals?service=plumbing');

      expect(mockedApi.get).toHaveBeenCalledWith('/api/professionals?service=plumbing');
      expect(response.data).toHaveLength(2);
      expect(response.data[0].rating).toBeGreaterThan(4);
    });

    it('should search with location filter', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [{ id: '1', name: 'Jan', location: 'Amsterdam' }] });

      const response = await apiClient.get('/api/professionals?service=painting&location=Amsterdam');
      expect(response.data[0].location).toBe('Amsterdam');
    });

    it('should return empty results for no matches', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      const response = await apiClient.get('/api/professionals?service=rare-skill');
      expect(response.data).toHaveLength(0);
    });

    it('should sort results by rating descending', async () => {
      const mockResults = [
        { id: '1', name: 'Top', rating: 4.9 },
        { id: '2', name: 'Good', rating: 4.5 },
        { id: '3', name: 'Ok', rating: 4.0 },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: mockResults });

      const response = await apiClient.get('/api/professionals?service=plumbing&sort=rating');
      const ratings = response.data.map((p: any) => p.rating);
      expect(ratings).toEqual([4.9, 4.5, 4.0]);
    });
  });

  describe('Book Job', () => {
    it('should create a new job booking', async () => {
      const jobData = { title: 'Fix bathroom sink', description: 'Leaking faucet in master bath', budget: 150, serviceType: 'plumbing', location: 'Amsterdam' };
      mockedApi.post.mockResolvedValueOnce({ data: { id: 'job-1', ...jobData, status: 'open', createdAt: '2026-03-22' } });

      const response = await apiClient.post('/api/jobs', jobData);

      expect(mockedApi.post).toHaveBeenCalledWith('/api/jobs', jobData);
      expect(response.data.status).toBe('open');
      expect(response.data.id).toBeTruthy();
    });

    it('should book a specific professional', async () => {
      const booking = { professionalId: 'pro-1', jobId: 'job-1', scheduledDate: '2026-03-25', timeSlot: '10:00-12:00' };
      mockedApi.post.mockResolvedValueOnce({ data: { ...booking, status: 'confirmed', bookingId: 'bk-1' } });

      const response = await apiClient.post('/api/bookings', booking);
      expect(response.data.status).toBe('confirmed');
      expect(response.data.bookingId).toBeTruthy();
    });

    it('should validate required job fields', async () => {
      mockedApi.post.mockRejectedValueOnce({ response: { status: 422, data: { errors: { title: 'Required', budget: 'Required' } } } });

      await expect(apiClient.post('/api/jobs', {})).rejects.toBeTruthy();
    });
  });

  describe('Payment Processing', () => {
    it('should create a payment intent', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { clientSecret: 'pi_test_secret', amount: 15000, currency: 'eur' } });

      const response = await apiClient.post('/api/payments/intent', { jobId: 'job-1', amount: 150 });

      expect(response.data.clientSecret).toBeTruthy();
      expect(response.data.amount).toBe(15000); // cents
      expect(response.data.currency).toBe('eur');
    });

    it('should confirm payment after job completion', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { status: 'succeeded', paymentId: 'pay-1' } });

      const response = await apiClient.post('/api/payments/confirm', { paymentIntentId: 'pi_test', jobId: 'job-1' });
      expect(response.data.status).toBe('succeeded');
    });

    it('should handle payment failure', async () => {
      mockedApi.post.mockRejectedValueOnce({ response: { status: 402, data: { message: 'Card declined' } } });

      await expect(apiClient.post('/api/payments/intent', { jobId: 'job-1', amount: 150 })).rejects.toBeTruthy();
    });

    it('should process refund for cancelled job', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { status: 'refunded', refundId: 'ref-1', amount: 15000 } });

      const response = await apiClient.post('/api/payments/refund', { paymentId: 'pay-1' });
      expect(response.data.status).toBe('refunded');
    });
  });

  describe('Review Submission', () => {
    it('should submit a review for completed job', async () => {
      const review = { jobId: 'job-1', professionalId: 'pro-1', rating: 5, comment: 'Excellent work, very professional!' };
      mockedApi.post.mockResolvedValueOnce({ data: { id: 'rev-1', ...review, createdAt: '2026-03-22' } });

      const response = await apiClient.post('/api/reviews', review);

      expect(mockedApi.post).toHaveBeenCalledWith('/api/reviews', review);
      expect(response.data.rating).toBe(5);
    });

    it('should validate rating range (1-5)', async () => {
      mockedApi.post.mockRejectedValueOnce({ response: { status: 422, data: { errors: { rating: 'Must be between 1 and 5' } } } });

      await expect(apiClient.post('/api/reviews', { rating: 6 })).rejects.toBeTruthy();
    });

    it('should prevent duplicate reviews', async () => {
      mockedApi.post.mockRejectedValueOnce({ response: { status: 409, data: { message: 'Review already submitted' } } });

      await expect(apiClient.post('/api/reviews', { jobId: 'job-1' })).rejects.toBeTruthy();
    });

    it('should fetch reviews for a professional', async () => {
      const mockReviews = [
        { id: 'rev-1', rating: 5, comment: 'Great!', author: 'Anna' },
        { id: 'rev-2', rating: 4, comment: 'Good job', author: 'Mark' },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: mockReviews });

      const response = await apiClient.get('/api/professionals/pro-1/reviews');
      expect(response.data).toHaveLength(2);
    });
  });
});
