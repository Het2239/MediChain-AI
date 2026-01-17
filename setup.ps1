# MediChain Setup Script for Windows
# Run this script in PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🏥 MediChain AI - Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Blue
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js v18 or higher from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
Write-Host ""

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

# Contracts dependencies
Write-Host "Installing smart contract dependencies..." -ForegroundColor Blue
Set-Location contracts
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install contract dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Contract dependencies installed" -ForegroundColor Green
Set-Location ..

# Setup environment files
Write-Host ""
Write-Host "📝 Setting up environment files..." -ForegroundColor Blue

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env file..." -ForegroundColor Blue
    @"
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
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
} else {
    Write-Host "✅ backend\.env already exists" -ForegroundColor Green
}

# Frontend .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend\.env file..." -ForegroundColor Blue
    @"
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api

# Blockchain Configuration (Local Hardhat)
VITE_CHAIN_ID=31337

# Smart Contract Addresses (will be updated after deployment)
VITE_PATIENT_REGISTRY_ADDRESS=
VITE_DOCTOR_REGISTRY_ADDRESS=
VITE_ACCESS_CONTROL_ADDRESS=
"@ | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Created frontend\.env" -ForegroundColor Green
} else {
    Write-Host "✅ frontend\.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Update PINATA_API_KEY and PINATA_SECRET_API_KEY in backend\.env"
Write-Host "2. Run '.\start.ps1' to start all services"
Write-Host "3. Deploy contracts and update addresses in .env files"
Write-Host ""
Write-Host "For detailed instructions, see SETUP.md" -ForegroundColor Blue
Write-Host ""
