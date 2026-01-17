#!/bin/bash

# MediChain Setup Script for Linux/macOS
# This script installs all dependencies and sets up the development environment

set -e  # Exit on error

echo "============================================"
echo "🏥 MediChain AI - Setup Script (Linux/macOS)"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js v18 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm ${NPM_VERSION} found${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
echo ""

# Backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ..

# Frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
cd ..

# Contracts dependencies
echo -e "${BLUE}Installing smart contract dependencies...${NC}"
cd contracts
npm install
echo -e "${GREEN}✅ Contract dependencies installed${NC}"
cd ..

# Setup environment files
echo ""
echo -e "${BLUE}📝 Setting up environment files...${NC}"

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${BLUE}Creating backend/.env file...${NC}"
    cat > backend/.env << 'EOF'
# Backend Environment Variables
PORT=3001
NODE_ENV=development

# Blockchain RPC (Local Hardhat)
SEPOLIA_RPC_URL=http://127.0.0.1:8545

# Smart Contract Addresses (will be updated after deployment)
PATIENT_REGISTRY_ADDRESS=
DOCTOR_REGISTRY_ADDRESS=
ACCESS_CONTROL_ADDRESS=

# IPFS/Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_key_here

# Admin Configuration
ADMIN_SECRET=medichain-admin-2026

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
EOF
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# Check if .env exists in frontend
if [ ! -f "frontend/.env" ]; then
    echo -e "${BLUE}Creating frontend/.env file...${NC}"
    cat > frontend/.env << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api

# Blockchain Configuration (Local Hardhat)
VITE_CHAIN_ID=31337

# Smart Contract Addresses (will be updated after deployment)
VITE_PATIENT_REGISTRY_ADDRESS=
VITE_DOCTOR_REGISTRY_ADDRESS=
VITE_ACCESS_CONTROL_ADDRESS=
EOF
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✅ frontend/.env already exists${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update PINATA_API_KEY and PINATA_SECRET_API_KEY in backend/.env"
echo "2. Run './start.sh' to start all services"
echo "3. Deploy contracts and update addresses in .env files"
echo ""
echo -e "${BLUE}For detailed instructions, see SETUP.md${NC}"
echo ""
