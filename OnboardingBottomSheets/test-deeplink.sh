#!/bin/bash

# Test Deep Link Script
# This script tests the deep link by simulating a magic link click

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔗 Testing Deep Link${NC}"

# Get a test token (you can replace this with a real token from requesting a magic link)
TOKEN="${1:-test-token-12345}"

# The deep link URL
DEEP_LINK="onboardingapp://auth/verify?token=$TOKEN"

echo -e "${GREEN}📱 Opening app with deep link:${NC}"
echo "$DEEP_LINK"
echo ""

# Open the deep link on iOS simulator
xcrun simctl openurl booted "$DEEP_LINK"

echo -e "${GREEN}✅ Deep link opened!${NC}"
echo ""
echo "Check the React Native logs to see if the token was parsed correctly."
echo "You should see: 🔗 Parsing token from deep link: $TOKEN"
