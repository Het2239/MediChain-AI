#!/bin/bash

# Script to add contract addresses to .env file
# Run with: bash update-env.sh

ENV_FILE="/media/het/New Volume/Projects/MediChain/.env"

echo "Adding contract addresses to .env file..."

# Check if addresses already exist
if grep -q "PATIENT_REGISTRY_ADDRESS=0x" "$ENV_FILE"; then
  echo "✓ Addresses already configured!"
  exit 0
fi

# Add backend contract addresses
sed -i 's/PATIENT_REGISTRY_ADDRESS=.*/PATIENT_REGISTRY_ADDRESS=0x52f1c40755a47915A93B131405a2C95eA904A6Db/' "$ENV_FILE"
sed -i 's/DOCTOR_REGISTRY_ADDRESS=.*/DOCTOR_REGISTRY_ADDRESS=0xBEdf65e08498639B7b0000fCA892f28fa3d15021/' "$ENV_FILE"
sed -i 's/ACCESS_CONTROL_ADDRESS=.*/ACCESS_CONTROL_ADDRESS=0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD/' "$ENV_FILE"

# Add admin address if not present
if ! grep -q "ADMIN_ADDRESS=" "$ENV_FILE"; then
  echo "" >> "$ENV_FILE"
  echo "# Admin Configuration" >> "$ENV_FILE"
  echo "ADMIN_ADDRESS=0xD3dc27A44A84a9DdcF86804556FE601503903a51" >> "$ENV_FILE"
fi

# Add frontend addresses
sed -i 's/VITE_PATIENT_REGISTRY_ADDRESS=.*/VITE_PATIENT_REGISTRY_ADDRESS=0x52f1c40755a47915A93B131405a2C95eA904A6Db/' "$ENV_FILE"
sed -i 's/VITE_DOCTOR_REGISTRY_ADDRESS=.*/VITE_DOCTOR_REGISTRY_ADDRESS=0xBEdf65e08498639B7b0000fCA892f28fa3d15021/' "$ENV_FILE"
sed -i 's/VITE_ACCESS_CONTROL_ADDRESS=.*/VITE_ACCESS_CONTROL_ADDRESS=0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD/' "$ENV_FILE"

# Add admin secret if not present
if ! grep -q "VITE_ADMIN_SECRET=" "$ENV_FILE"; then
  echo "VITE_ADMIN_SECRET=medichain-admin-2026" >> "$ENV_FILE"
fi

echo "✓ Contract addresses added successfully!"
echo ""
echo "Contract addresses configured:"
echo "  PatientRegistry:  0x52f1c40755a47915A93B131405a2C95eA904A6Db"
echo "  DoctorRegistry:   0xBEdf65e08498639B7b0000fCA892f28fa3d15021"
echo "  AccessControl:    0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD"
echo ""
echo "⚠️  IMPORTANT: Restart your backend and frontend servers!"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
