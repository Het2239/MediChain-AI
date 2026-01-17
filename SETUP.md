# MediChain AI - Setup Guide

Complete guide for setting up and running MediChain AI on your local machine.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node -v` and `npm -v`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **MetaMask Browser Extension**
   - Install from [metamask.io](https://metamask.io/)
   - Required for blockchain interactions

### Optional but Recommended

- **VS Code** or your preferred code editor
- **Pinata Account** for IPFS file storage ([pinata.cloud](https://pinata.cloud/))

## 🚀 Quick Start

### Linux/macOS

```bash
# Clone the repository
git clone <your-repo-url>
cd MediChain

# Make scripts executable
chmod +x setup.sh start.sh

# Run setup
./setup.sh

# Configure Pinata keys in backend/.env
nano backend/.env  # or use your preferred editor

# Start all services
./start.sh
```

### Windows

```powershell
# Clone the repository
git clone <your-repo-url>
cd MediChain

# Run setup (in PowerShell as Administrator)
.\setup.ps1

# Configure Pinata keys in backend\.env
notepad backend\.env

# Start all services
.\start.ps1
```

## 📦 Detailed Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd MediChain
```

### Step 2: Run Setup Script

The setup script will:
- Check for Node.js and npm
- Install all dependencies (backend, frontend, contracts)
- Create environment files

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```powershell
.\setup.ps1
```

### Step 3: Get Pinata API Keys

1. Sign up at [pinata.cloud](https://pinata.cloud/)
2. Go to API Keys section
3. Create a new API key
4. Copy the API Key and Secret Key

### Step 4: Configure Environment Variables

#### Backend Configuration (`backend/.env`)

```env
# Backend Environment Variables
PORT=3001
NODE_ENV=development

# Blockchain RPC (Local Hardhat)
SEPOLIA_RPC_URL=http://127.0.0.1:8545

# IPFS/Pinata Configuration
PINATA_API_KEY=your_actual_pinata_api_key
PINATA_SECRET_API_KEY=your_actual_pinata_secret_key

# Admin Configuration
ADMIN_SECRET=medichain-admin-2026

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important:** Replace `your_actual_pinata_api_key` and `your_actual_pinata_secret_key` with your real Pinata credentials.

#### Frontend Configuration (`frontend/.env`)

The frontend `.env` will be automatically configured after contract deployment.

## 🎯 Running the Application

### Option 1: Using Start Scripts (Recommended)

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```powershell
.\start.ps1
```

This will start:
- Hardhat blockchain (port 8545)
- Backend server (port 3001)
- Frontend application (port 5173)

### Option 2: Manual Start

Open 3 separate terminals:

**Terminal 1 - Hardhat Blockchain:**
```bash
cd contracts
npx hardhat node
```

**Terminal 2 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Deploy Smart Contracts

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses and update both `.env` files:

**backend/.env:**
```env
PATIENT_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
DOCTOR_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ACCESS_CONTROL_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**frontend/.env:**
```env
VITE_PATIENT_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_DOCTOR_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_ACCESS_CONTROL_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### Step 6: Configure MetaMask

1. Open MetaMask
2. Add Hardhat Local Network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. Import test accounts (from Hardhat console):
   - Account #0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Account #1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

## 🌐 Access the Application

Once all services are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Hardhat Network:** http://127.0.0.1:8545

## 📱 Using the Application

### Register as Patient

1. Connect MetaMask (Account #0)
2. Click "Patient Dashboard"
3. Register as patient
4. Upload medical records

### Register as Doctor

1. Switch to Account #1 in MetaMask
2. Go to Admin Panel
3. Enter admin secret: `medichain-admin-2026`
4. Verify doctor with Account #1 address

### Request Access (Doctor)

1. As doctor, go to "Patients" page
2. Request access to patient
3. Switch to patient account
4. Approve access request

### View Patient Records (Doctor)

1. As doctor, view authorized patients
2. Click "View Records"
3. Download and decrypt files

## 🔧 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

**Linux/macOS:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8545
lsof -ti:8545 | xargs kill -9
```

**Windows:**
```powershell
# Kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Repeat for other ports (5173, 8545)
```

### MetaMask Connection Issues

1. Make sure Hardhat network is running
2. Reset MetaMask account (Settings → Advanced → Reset Account)
3. Reconnect to the application

### Contract Deployment Fails

1. Ensure Hardhat node is running
2. Check that no other blockchain is using port 8545
3. Restart Hardhat node and try again

### IPFS Upload Fails

1. Verify Pinata API keys in `backend/.env`
2. Check Pinata dashboard for quota limits
3. Ensure internet connection is stable

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Pinata Documentation](https://docs.pinata.cloud/)

## 🆘 Getting Help

If you encounter issues:

1. Check the console logs in browser (F12)
2. Check backend terminal for errors
3. Verify all environment variables are set correctly
4. Ensure all services are running

## 🔐 Security Notes

- Never commit `.env` files to version control
- Change default secrets in production
- Use secure passwords for file encryption
- Keep private keys safe

## 📝 License

[Your License Here]
