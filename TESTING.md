# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- __tests__/auth.test.ts

# Run in watch mode
npm test -- --watch
```

## Test Structure

```
__tests__/
  auth.test.ts         - Login, register, logout, token validation
  professional.test.ts - Dashboard, job accept, earnings, profile
  customer.test.ts     - Search, booking, payments, reviews
  messaging.test.ts    - Send/load messages, real-time updates
  navigation.test.ts   - Auth flow, tab nav, deep linking
```

## Unit Test Approach

Tests mock external dependencies (API calls, secure storage) to test business logic in isolation:

- **AuthStore**: Zustand store actions with mocked axios and SecureStore
- **API interactions**: Mock apiClient to verify correct endpoints and payloads
- **Navigation logic**: Test auth state determines which navigator renders
- **Calculations**: Earnings commission math tested without mocks

## E2E Testing (Future)

For end-to-end testing, use [Detox](https://wix.github.io/Detox/) or [Maestro](https://maestro.mobile.dev/):

```bash
# Maestro example
maestro test flows/login.yaml
maestro test flows/book-job.yaml
```

Key E2E flows to cover:
1. Onboarding -> Register -> Dashboard
2. Login -> Browse jobs -> Accept job
3. Customer search -> Book professional -> Pay
4. Send message -> Receive reply
5. Complete job -> Leave review

## Manual Testing Checklist

### Auth
- [ ] Register as professional
- [ ] Register as customer
- [ ] Login with valid credentials
- [ ] Login with wrong password (error shown)
- [ ] Logout clears session
- [ ] App restores session on relaunch

### Professional Flow
- [ ] Dashboard loads available jobs
- [ ] Job cards show title, location, budget
- [ ] Accept job updates status
- [ ] Earnings display correct totals
- [ ] Profile shows user info
- [ ] Logout from profile screen

### Customer Flow
- [ ] Search for professionals by service
- [ ] View professional profiles
- [ ] Create job listing
- [ ] Book a professional
- [ ] Payment flow completes
- [ ] Submit review after job

### Messaging
- [ ] Open conversation list
- [ ] Send text message
- [ ] Messages appear in order
- [ ] Unread badge updates

### Cross-Platform
- [ ] iOS: Test on iPhone 15 simulator
- [ ] iOS: Test on physical device
- [ ] Android: Test on Pixel emulator
- [ ] Android: Test on physical device
- [ ] Test on tablet layout
