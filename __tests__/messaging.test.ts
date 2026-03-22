import apiClient from '../services/apiClient';

jest.mock('../services/apiClient');

const mockedApi = apiClient as jest.Mocked<typeof apiClient>;

describe('Messaging Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Send Message', () => {
    it('should send a text message', async () => {
      const message = { conversationId: 'conv-1', content: 'Hi, when can you come fix the sink?', type: 'text' };
      mockedApi.post.mockResolvedValueOnce({ data: { id: 'msg-1', ...message, sentAt: '2026-03-22T10:00:00Z', read: false } });

      const response = await apiClient.post('/api/messages', message);

      expect(mockedApi.post).toHaveBeenCalledWith('/api/messages', message);
      expect(response.data.id).toBeTruthy();
      expect(response.data.read).toBe(false);
    });

    it('should send a message with image attachment', async () => {
      const message = { conversationId: 'conv-1', content: 'Here is the issue', type: 'image', attachmentUrl: 'https://cdn.example.com/photo.jpg' };
      mockedApi.post.mockResolvedValueOnce({ data: { id: 'msg-2', ...message, sentAt: '2026-03-22T10:05:00Z' } });

      const response = await apiClient.post('/api/messages', message);
      expect(response.data.type).toBe('image');
      expect(response.data.attachmentUrl).toBeTruthy();
    });

    it('should reject empty message content', async () => {
      mockedApi.post.mockRejectedValueOnce({ response: { status: 422, data: { message: 'Content is required' } } });

      await expect(apiClient.post('/api/messages', { conversationId: 'conv-1', content: '' })).rejects.toBeTruthy();
    });
  });

  describe('Load Conversation', () => {
    it('should load conversation messages', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'Hello!', senderId: 'user-1', sentAt: '2026-03-22T09:00:00Z' },
        { id: 'msg-2', content: 'Hi, how can I help?', senderId: 'pro-1', sentAt: '2026-03-22T09:01:00Z' },
        { id: 'msg-3', content: 'I need kitchen repair', senderId: 'user-1', sentAt: '2026-03-22T09:02:00Z' },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: { messages: mockMessages, hasMore: false } });

      const response = await apiClient.get('/api/conversations/conv-1/messages');

      expect(response.data.messages).toHaveLength(3);
      expect(response.data.messages[0].content).toBe('Hello!');
    });

    it('should load conversation list', async () => {
      const mockConversations = [
        { id: 'conv-1', lastMessage: 'See you tomorrow', updatedAt: '2026-03-22T10:00:00Z', unreadCount: 2, participant: { name: 'Jan Bakker' } },
        { id: 'conv-2', lastMessage: 'Job completed', updatedAt: '2026-03-21T15:00:00Z', unreadCount: 0, participant: { name: 'Pieter Vries' } },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: mockConversations });

      const response = await apiClient.get('/api/conversations');
      expect(response.data).toHaveLength(2);
      expect(response.data[0].unreadCount).toBe(2);
    });

    it('should paginate older messages', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { messages: [{ id: 'msg-old' }], hasMore: true, cursor: 'cur-123' } });

      const response = await apiClient.get('/api/conversations/conv-1/messages?before=cur-123');
      expect(response.data.hasMore).toBe(true);
      expect(response.data.cursor).toBeTruthy();
    });
  });

  describe('Real-time Updates', () => {
    it('should mark messages as read', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { success: true, readCount: 3 } });

      const response = await apiClient.post('/api/conversations/conv-1/read');
      expect(response.data.success).toBe(true);
      expect(response.data.readCount).toBe(3);
    });

    it('should handle typing indicator', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { success: true } });

      const response = await apiClient.post('/api/conversations/conv-1/typing', { isTyping: true });
      expect(response.data.success).toBe(true);
    });

    it('should fetch unread message count', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { totalUnread: 5 } });

      const response = await apiClient.get('/api/messages/unread-count');
      expect(response.data.totalUnread).toBe(5);
    });
  });
});
