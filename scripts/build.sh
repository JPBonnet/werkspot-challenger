#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-preview}"
PLATFORM="${2:-all}"

echo "=== Werkspot Challenger Build ==="
echo "Profile: $PROFILE"
echo "Platform: $PLATFORM"
echo ""

# Verify EAS CLI is installed
if ! command -v eas &> /dev/null; then
  echo "Error: EAS CLI not found. Install with: npm install -g eas-cli"
  exit 1
fi

# Verify logged in
eas whoami || { echo "Error: Not logged in. Run: eas login"; exit 1; }

build_ios() {
  echo "--- Building iOS ($PROFILE) ---"
  eas build --platform ios --profile "$PROFILE" --non-interactive
}

build_android() {
  echo "--- Building Android ($PROFILE) ---"
  eas build --platform android --profile "$PROFILE" --non-interactive
}

case "$PLATFORM" in
  ios)
    build_ios
    ;;
  android)
    build_android
    ;;
  all)
    build_ios
    build_android
    ;;
  *)
    echo "Usage: ./scripts/build.sh [development|preview|production] [ios|android|all]"
    exit 1
    ;;
esac

echo ""
echo "=== Build submitted ==="
echo "Check status: eas build:list"
