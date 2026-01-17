# MediChain Start Script for Windows
# Starts all services (Hardhat, Backend, Frontend)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🏥 Starting MediChain AI" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start Hardhat Node
Write-Host "Starting Hardhat blockchain..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd contracts; npx hardhat node"
Start-Sleep -Seconds 3
Write-Host "✅ Hardhat running on http://127.0.0.1:8545" -ForegroundColor Green

# Deploy contracts if needed
Write-Host "Deploying smart contracts..." -ForegroundColor Blue
Set-Location contracts
npx hardhat run scripts/deploy.js --network localhost
Set-Location ..
Write-Host "✅ Contracts deployed" -ForegroundColor Green
Write-Host "⚠️  Update contract addresses in .env files" -ForegroundColor Yellow

# Start Backend
Write-Host "Starting backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 2
Write-Host "✅ Backend running on http://localhost:3001" -ForegroundColor Green

# Start Frontend
Write-Host "Starting frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 2
Write-Host "✅ Frontend running on http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Blue
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  Backend:  http://localhost:3001"
Write-Host "  Hardhat:  http://127.0.0.1:8545"
Write-Host ""
Write-Host "Close the PowerShell windows to stop services" -ForegroundColor Yellow
Write-Host ""
