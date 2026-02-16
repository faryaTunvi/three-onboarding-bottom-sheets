#!/bin/bash
# Startup script to run both backend and React Native app

echo "🚀 Starting Onboarding App Development Environment"
echo "---------------------------------------------------"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists go; then
    echo -e "${RED}❌ Go is not installed. Please install Go 1.22 or higher.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend server
echo -e "\n${YELLOW}Starting Go backend server...${NC}"
cd "$SCRIPT_DIR/backend"

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo -e "${RED}❌ go.mod not found in backend directory${NC}"
    exit 1
fi

# Install Go dependencies if needed
go mod download

# Start backend in background
echo -e "${GREEN}✅ Starting backend on http://localhost:8080${NC}"
go run main.go &
BACKEND_PID=$!

# Give backend time to start
sleep 2

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend running (PID: $BACKEND_PID)${NC}"

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo -e "\n${YELLOW}📱 Important: Update your API endpoint!${NC}"
echo -e "   Update ${GREEN}src/services/apiService.ts${NC}"
echo -e "   Use: ${GREEN}http://${LOCAL_IP}:8080${NC}"

# Start React Native Metro bundler
echo -e "\n${YELLOW}Starting React Native Metro bundler...${NC}"
cd "$SCRIPT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi

echo -e "\n${GREEN}✅ Development environment ready!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. In a new terminal, run: ${GREEN}npm run ios${NC} or ${GREEN}npm run android${NC}"
echo -e "2. Update API endpoint in src/services/apiService.ts to: ${GREEN}http://${LOCAL_IP}:8080${NC}"
echo -e "3. Test magic link with: ${GREEN}onboardingapp://auth/verify?token=YOUR_TOKEN${NC}"

# Start Metro
npm start

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Backend stopped${NC}"
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
