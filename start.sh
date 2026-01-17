#!/bin/bash

# MediChain Start Script for Linux/macOS
# Starts all services (Hardhat, Backend, Frontend)

set -e

echo "============================================"
echo "🏥 Starting MediChain AI"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Hardhat Node
echo -e "${BLUE}Starting Hardhat blockchain...${NC}"
cd contracts
npx hardhat node &
HARDHAT_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✅ Hardhat running on http://127.0.0.1:8545${NC}"

# Deploy contracts if not already deployed
if [ -z "$VITE_PATIENT_REGISTRY_ADDRESS" ]; then
    echo -e "${BLUE}Deploying smart contracts...${NC}"
    cd contracts
    npx hardhat run scripts/deploy.js --network localhost
    cd ..
    echo -e "${GREEN}✅ Contracts deployed${NC}"
    echo -e "${YELLOW}⚠️  Update contract addresses in .env files${NC}"
fi

# Start Backend
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
sleep 2
echo -e "${GREEN}✅ Backend running on http://localhost:3001${NC}"

# Start Frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 2
echo -e "${GREEN}✅ Frontend running on http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  Hardhat:  http://127.0.0.1:8545"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
wait
