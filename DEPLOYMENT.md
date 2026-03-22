# Deployment Guide

## Prerequisites

- Node.js 20+
- EAS CLI: `npm install -g eas-cli`
- Expo account: `eas login`
- Apple Developer account (iOS)
- Google Play Console access (Android)

## Build Commands

```bash
# Development build (simulator/emulator)
./scripts/build.sh development ios
./scripts/build.sh development android

# Preview build (internal testing)
./scripts/build.sh preview all

# Production build
./scripts/build.sh production all
```

## App Store Submission (iOS)

1. Ensure `eas.json` has correct `appleId`, `ascAppId`, and `appleTeamId`
2. Build production: `eas build --platform ios --profile production`
3. Submit: `eas submit --platform ios --profile production`
4. In App Store Connect:
   - Add screenshots (6.7", 6.5", 5.5" iPhone + iPad)
   - Fill description, keywords, support URL
   - Set pricing (free with in-app payments)
   - Submit for review

## Google Play Submission (Android)

1. Place `google-services-key.json` in project root (service account key)
2. Build production: `eas build --platform android --profile production`
3. Submit: `eas submit --platform android --profile production`
4. In Google Play Console:
   - Complete store listing (title, description, screenshots)
   - Set content rating questionnaire
   - Set pricing & distribution
   - Create internal test track first, then promote to production

## Version Bumping

Version is managed via `app.config.ts` and EAS:

```bash
# Bump version in app.config.ts
APP_VERSION=0.2.0 eas build --platform all --profile production

# Build numbers auto-increment with autoIncrement: true in eas.json
```

## Release Checklist

- [ ] All tests passing (`npm test`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Tested on physical iOS device
- [ ] Tested on physical Android device
- [ ] API endpoints are production-ready
- [ ] Environment variables set for production
- [ ] Stripe keys switched to live mode
- [ ] Firebase config points to production
- [ ] Privacy policy URL configured
- [ ] App icons and splash screen finalized
- [ ] Version number bumped
- [ ] Git tag created: `git tag v0.x.0`
- [ ] Build submitted to stores
- [ ] Store listing screenshots updated

## OTA Updates

Using EAS Update for JS-only changes (no native code changes):

```bash
# Push update to preview channel
eas update --branch preview --message "Fix job listing display"

# Push update to production
eas update --branch production --message "Hotfix: payment flow"
```

## Rollback

```bash
# List recent updates
eas update:list

# Roll back by publishing a previous update
eas update:republish --group <update-group-id>
```
