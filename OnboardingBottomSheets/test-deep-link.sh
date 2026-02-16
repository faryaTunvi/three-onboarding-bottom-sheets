#!/bin/bash

# Deep Link Testing Script
# This script helps test the magic link authentication flow

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Deep Link Testing Script${NC}\n"

# Check if backend is running
echo -e "${YELLOW}Checking if backend is running...${NC}"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}\n"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo -e "${YELLOW}Please start the backend first:${NC}"
    echo -e "  cd backend && ./start-with-email.sh\n"
    exit 1
fi

# Get email from user or use default
read -p "Enter email address (or press Enter for test@example.com): " EMAIL
EMAIL=${EMAIL:-test@example.com}

echo -e "\n${BLUE}1. Requesting magic link for ${EMAIL}...${NC}"

# Request magic link
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")

# Extract token
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to get token${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Magic link generated${NC}"
echo -e "${BLUE}Token:${NC} $TOKEN"

# Create deep link
DEEP_LINK="onboardingapp://auth/verify?token=$TOKEN"
echo -e "${BLUE}Deep Link:${NC} $DEEP_LINK\n"

# Detect platform
echo -e "${YELLOW}Select platform to test:${NC}"
echo "1) iOS Simulator"
echo "2) Android Emulator"
echo "3) Android Device (via ADB)"
echo "4) Copy link only (manual testing)"
echo "5) Test verification endpoint directly"
read -p "Enter choice (1-5): " CHOICE

case $CHOICE in
    1)
        echo -e "\n${BLUE}2. Opening deep link in iOS Simulator...${NC}"
        xcrun simctl openurl booted "$DEEP_LINK"
        echo -e "${GREEN}✓ Deep link sent to simulator${NC}"
        echo -e "${YELLOW}Check the simulator - app should open and verify automatically${NC}"
        ;;
    2)
        echo -e "\n${BLUE}2. Opening deep link in Android Emulator...${NC}"
        adb shell am start -W -a android.intent.action.VIEW -d "$DEEP_LINK"
        echo -e "${GREEN}✓ Deep link sent to emulator${NC}"
        echo -e "${YELLOW}Check the emulator - app should open and verify automatically${NC}"
        ;;
    3)
        echo -e "\n${BLUE}2. Checking connected devices...${NC}"
        adb devices
        echo -e "\n${BLUE}Opening deep link on Android device...${NC}"
        adb shell am start -W -a android.intent.action.VIEW -d "$DEEP_LINK"
        echo -e "${GREEN}✓ Deep link sent to device${NC}"
        echo -e "${YELLOW}Check your device - app should open and verify automatically${NC}"
        ;;
    4)
        echo -e "\n${GREEN}Copy this deep link and paste it on your device:${NC}"
        echo -e "${BLUE}$DEEP_LINK${NC}"
        echo -e "\n${YELLOW}On iOS:${NC} Paste into Notes app and tap"
        echo -e "${YELLOW}On Android:${NC} Paste into Chrome or Messages and tap"
        ;;
    5)
        echo -e "\n${BLUE}2. Testing verification endpoint directly...${NC}"
        VERIFY_RESPONSE=$(curl -s "http://localhost:8080/api/auth/verify?token=$TOKEN")
        echo -e "${GREEN}✓ Verification response:${NC}"
        echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}📋 Monitoring Tips:${NC}"
echo -e "  ${YELLOW}iOS logs:${NC}     npx react-native log-ios"
echo -e "  ${YELLOW}Android logs:${NC} npx react-native log-android"
echo -e "  ${YELLOW}Backend logs:${NC} Check the terminal where backend is running"

echo -e "\n${BLUE}🔍 Look for these log messages:${NC}"
echo -e "  - 🔗 Deep link received"
echo -e "  - 📧 VerifyEmailScreen mounted"
echo -e "  - Verifying token"
echo -e "  - Verification successful"

echo -e "\n${GREEN}✅ Test setup complete!${NC}"
