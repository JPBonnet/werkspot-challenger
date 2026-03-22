import { create } from 'zustand';
import { apiClient } from './apiClient';
import { Job, Professional, Conversation, Message } from '../models/Job';
import { Review, ReviewInput } from '../models/Review';

interface JobStore {
  jobs: Job[];
  professionals: Professional[];
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;

  searchProfessionals: (query: string, location: string, filters?: { rating?: number; priceMax?: number }) => Promise<void>;
  fetchProfessional: (id: string) => Promise<Professional>;
  bookJob: (data: { professionalId: string; serviceId: string; date: string; location: string; budget: number }) => Promise<Job>;
  fetchMyJobs: () => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  submitReview: (review: ReviewInput) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
}

// Mock data for development
const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1', name: 'Jan de Vries', email: 'jan@example.com', rating: 4.8, reviewCount: 124,
    bio: 'Licensed plumber with 15 years of experience in residential and commercial plumbing.',
    location: 'Amsterdam', services: [
      { id: 's1', name: 'Pipe Repair', description: 'Fix leaking or broken pipes', priceFrom: 60, priceTo: 150, duration: '1-3 hours' },
      { id: 's2', name: 'Drain Cleaning', description: 'Unclog and clean drains', priceFrom: 40, priceTo: 100, duration: '1-2 hours' },
    ], portfolio: [],
  },
  {
    id: '2', name: 'Sophie Bakker', email: 'sophie@example.com', rating: 4.9, reviewCount: 89,
    bio: 'Professional electrician certified for all residential electrical work.',
    location: 'Rotterdam', services: [
      { id: 's3', name: 'Wiring Installation', description: 'New wiring and outlets', priceFrom: 80, priceTo: 250, duration: '2-5 hours' },
      { id: 's4', name: 'Light Fixture Install', description: 'Mount and wire light fixtures', priceFrom: 30, priceTo: 80, duration: '30-60 min' },
    ], portfolio: [],
  },
  {
    id: '3', name: 'Pieter Jansen', email: 'pieter@example.com', rating: 4.6, reviewCount: 56,
    bio: 'Interior and exterior painter. Quality finish guaranteed.',
    location: 'Utrecht', services: [
      { id: 's5', name: 'Room Painting', description: 'Full room painting service', priceFrom: 150, priceTo: 400, duration: '4-8 hours' },
      { id: 's6', name: 'Exterior Painting', description: 'House exterior painting', priceFrom: 500, priceTo: 2000, duration: '2-5 days' },
    ], portfolio: [],
  },
];

const MOCK_JOBS: Job[] = [
  {
    id: 'j1', customerId: 'c1', professionalId: '1', professionalName: 'Jan de Vries',
    serviceType: 'Pipe Repair', description: 'Fix kitchen sink pipe', location: 'Amsterdam',
    scheduledDate: '2026-04-01', budget: 100, tax: 21, total: 121,
    status: 'confirmed', createdAt: '2026-03-20', updatedAt: '2026-03-20',
  },
  {
    id: 'j2', customerId: 'c1', professionalId: '2', professionalName: 'Sophie Bakker',
    serviceType: 'Light Fixture Install', description: 'Install 3 ceiling lights', location: 'Amsterdam',
    scheduledDate: '2026-03-25', budget: 60, tax: 12.6, total: 72.6,
    status: 'in_progress', createdAt: '2026-03-18', updatedAt: '2026-03-22',
  },
];

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  professionals: [],
  conversations: [],
  messages: [],
  isLoading: false,

  searchProfessionals: async (query, location, filters) => {
    set({ isLoading: true });
    try {
      // const { data } = await apiClient.get('/api/professionals/search', { params: { query, location, ...filters } });
      let results = MOCK_PROFESSIONALS;
      if (query) results = results.filter(p => p.services.some(s => s.name.toLowerCase().includes(query.toLowerCase())));
      if (location) results = results.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
      if (filters?.rating) results = results.filter(p => p.rating >= filters.rating!);
      set({ professionals: results, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProfessional: async (id) => {
    // const { data } = await apiClient.get(`/api/professionals/${id}`);
    return MOCK_PROFESSIONALS.find(p => p.id === id) || MOCK_PROFESSIONALS[0];
  },

  bookJob: async (data) => {
    set({ isLoading: true });
    try {
      // const { data: job } = await apiClient.post('/api/jobs', data);
      const job: Job = {
        id: `j${Date.now()}`, customerId: 'c1', professionalId: data.professionalId,
        professionalName: MOCK_PROFESSIONALS.find(p => p.id === data.professionalId)?.name || '',
        serviceType: data.serviceId, description: '', location: data.location,
        scheduledDate: data.date, budget: data.budget, tax: data.budget * 0.21,
        total: data.budget * 1.21, status: 'pending',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      set(s => ({ jobs: [...s.jobs, job], isLoading: false }));
      return job;
    } catch {
      set({ isLoading: false });
      throw new Error('Failed to book job');
    }
  },

  fetchMyJobs: async () => {
    set({ isLoading: true });
    try {
      // const { data } = await apiClient.get('/api/jobs/my');
      set({ jobs: MOCK_JOBS, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  cancelJob: async (jobId) => {
    // await apiClient.patch(`/api/jobs/${jobId}`, { status: 'cancelled' });
    set(s => ({ jobs: s.jobs.map(j => j.id === jobId ? { ...j, status: 'cancelled' as const } : j) }));
  },

  submitReview: async (_review) => {
    // await apiClient.post('/api/reviews', review);
  },

  fetchConversations: async () => {
    // const { data } = await apiClient.get('/api/conversations');
    set({ conversations: [
      { id: 'conv1', professionalId: '1', professionalName: 'Jan de Vries', lastMessage: 'I\'ll be there at 10am', lastMessageAt: '2026-03-22T09:00:00Z', unread: 1 },
      { id: 'conv2', professionalId: '2', professionalName: 'Sophie Bakker', lastMessage: 'Job completed, thanks!', lastMessageAt: '2026-03-21T15:00:00Z', unread: 0 },
    ]});
  },

  fetchMessages: async (_conversationId) => {
    // const { data } = await apiClient.get(`/api/conversations/${conversationId}/messages`);
    set({ messages: [
      { id: 'm1', senderId: '1', receiverId: 'c1', text: 'Hi, I can help with that!', createdAt: '2026-03-22T08:00:00Z' },
      { id: 'm2', senderId: 'c1', receiverId: '1', text: 'Great, when are you available?', createdAt: '2026-03-22T08:30:00Z' },
      { id: 'm3', senderId: '1', receiverId: 'c1', text: 'I\'ll be there at 10am', createdAt: '2026-03-22T09:00:00Z' },
    ]});
  },

  sendMessage: async (conversationId, text) => {
    // await apiClient.post(`/api/conversations/${conversationId}/messages`, { text });
    const msg: Message = { id: `m${Date.now()}`, senderId: 'c1', receiverId: '1', text, createdAt: new Date().toISOString() };
    set(s => ({ messages: [...s.messages, msg] }));
  },
}));
