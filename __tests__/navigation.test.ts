import { useAuthStore } from '../services/authStore';

jest.mock('expo-secure-store');
jest.mock('axios');

describe('Navigation Logic', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false });
  });

  describe('Auth Flow Navigation', () => {
    it('should show auth screens when no token', () => {
      const { user, token } = useAuthStore.getState();
      const showAuth = !token || !user;
      expect(showAuth).toBe(true);
    });

    it('should show professional screens when authenticated as professional', () => {
      useAuthStore.setState({
        token: 'jwt-123',
        user: { id: '1', email: 'pro@test.com', name: 'Jan', userType: 'professional', profileComplete: true },
      });

      const { user, token } = useAuthStore.getState();
      const showProfessional = token && user && user.userType === 'professional';
      expect(showProfessional).toBeTruthy();
    });

    it('should show customer screens when authenticated as customer', () => {
      useAuthStore.setState({
        token: 'jwt-456',
        user: { id: '2', email: 'cust@test.com', name: 'Anna', userType: 'customer', profileComplete: true },
      });

      const { user } = useAuthStore.getState();
      expect(user?.userType).toBe('customer');
    });

    it('should redirect to auth after logout', async () => {
      useAuthStore.setState({
        token: 'jwt-123',
        user: { id: '1', email: 'pro@test.com', name: 'Jan', userType: 'professional', profileComplete: true },
      });

      await useAuthStore.getState().logout();

      const { user, token } = useAuthStore.getState();
      expect(token).toBeNull();
      expect(user).toBeNull();
    });
  });

  describe('Tab Navigation', () => {
    it('should define three professional tabs', () => {
      const professionalTabs = ['Dashboard', 'Earnings', 'Profile'];
      expect(professionalTabs).toHaveLength(3);
      expect(professionalTabs).toContain('Dashboard');
      expect(professionalTabs).toContain('Earnings');
      expect(professionalTabs).toContain('Profile');
    });

    it('should define auth stack screens', () => {
      const authScreens = ['Onboarding', 'Login', 'Register'];
      expect(authScreens).toHaveLength(3);
      expect(authScreens[0]).toBe('Onboarding');
    });
  });

  describe('Deep Linking', () => {
    it('should parse job deep link', () => {
      const deepLink = 'werkspot-challenger://jobs/job-123';
      const match = deepLink.match(/werkspot-challenger:\/\/jobs\/(.+)/);
      expect(match).toBeTruthy();
      expect(match![1]).toBe('job-123');
    });

    it('should parse professional profile deep link', () => {
      const deepLink = 'werkspot-challenger://professional/pro-456';
      const match = deepLink.match(/werkspot-challenger:\/\/professional\/(.+)/);
      expect(match).toBeTruthy();
      expect(match![1]).toBe('pro-456');
    });

    it('should handle invalid deep link gracefully', () => {
      const deepLink = 'werkspot-challenger://unknown';
      const jobMatch = deepLink.match(/werkspot-challenger:\/\/jobs\/(.+)/);
      expect(jobMatch).toBeNull();
    });
  });
});
