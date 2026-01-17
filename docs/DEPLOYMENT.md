# Sepolia Testnet Deployment - MediChain AI

**Deployment Date**: January 15, 2026  
**Network**: Sepolia Testnet (Chain ID: 11155111)  
**Deployer Address**: 0xD3dc27A44A84a9DdcF86804556FE601503903a51

---

## Deployed Contracts

### 1. PatientRegistry
- **Address**: `0x52f1c40755a47915A93B131405a2C95eA904A6Db`
- **Purpose**: Patient registration and medical record management
- **Features**:
  - Patient registration
  - Medical record CID storage
  - Record categorization (reports, prescriptions, scans)
  - Patient-controlled access

**view on Etherscan**: https://sepolia.etherscan.io/address/0x52f1c40755a47915A93B131405a2C95eA904A6Db

---

### 2. DoctorRegistry
- **Address**: `0xBEdf65e08498639B7b0000fCA892f28fa3d15021`
- **Purpose**: Doctor verification and management
- **Features**:
  - Admin-controlled doctor verification
  - License number tracking
  - Specialty management
  - Verification status tracking

**View on Etherscan**: https://sepolia.etherscan.io/address/0xBEdf65e08498639B7b0000fCA892f28fa3d15021

---

### 3. AccessControl
- **Address**: `0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD`
- **Purpose**: Patient-doctor access permission management
- **Features**:
  - Access request system
  - Patient approval/denial
  - Permission revocation
  - Comprehensive audit trail
  - Access logging

**View on Etherscan**: https://sepolia.etherscan.io/address/0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD

---

## Environment Configuration

### Backend (.env)
```bash
PATIENT_REGISTRY_ADDRESS=0x52f1c40755a47915A93B131405a2C95eA904A6Db
DOCTOR_REGISTRY_ADDRESS=0xBEdf65e08498639B7b0000fCA892f28fa3d15021
ACCESS_CONTROL_ADDRESS=0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD
```

### Frontend (.env)
```bash
VITE_PATIENT_REGISTRY_ADDRESS=0x52f1c40755a47915A93B131405a2C95eA904A6Db
VITE_DOCTOR_REGISTRY_ADDRESS=0xBEdf65e08498639B7b0000fCA892f28fa3d15021
VITE_ACCESS_CONTROL_ADDRESS=0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD
VITE_CHAIN_ID=11155111
```

---

## Gas Usage

**Total Deployment Cost**: ~0.018 ETH

| Contract | Gas Used | Deployment Cost |
|----------|----------|-----------------|
| PatientRegistry | ~1.2M gas | ~0.006 ETH |
| DoctorRegistry | ~1.1M gas | ~0.005 ETH |
| AccessControl | ~1.5M gas | ~0.007 ETH |

---

## Deployment Files

- **JSON**: `/contracts/deployments/sepolia-1768469282299.json`
- **Latest**: `/contracts/deployments/sepolia-latest.json`

---

## Testing on Sepolia

### Get Testnet ETH
1. **Sepolia Faucet**: https://sepoliafaucet.com/
2. **Alchemy Faucet**: https://sepoliafaucet.com/
3. **Infura Faucet**: https://www.infura.io/faucet/sepolia

### Connecting to Sepolia
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- **Chain ID**: 11155111
- **Currency**: SepoliaETH (not real ETH)

---

## Next Steps

1. **Update .env files** - Add the contract addresses to both backend and frontend .env files
2. **Restart services** - Restart backend and frontend to load new addresses
3. **Test interactions** - Try registering as a patient/doctor
4. **Verify on Etherscan** - Check transactions on Sepolia Etherscan

---

## Contract Verification

⚠️ **Note**: Etherscan verification failed due to API V2 migration. This doesn't affect contract functionality, but source code won't be visible on Etherscan.

To manually verify (optional):
```bash
npx hardhat verify --network sepolia 0x52f1c40755a47915A93B131405a2C95eA904A6Db
npx hardhat verify --network sepolia 0xBEdf65e08498639B7b0000fCA892f28fa3d15021
npx hardhat verify --network sepolia 0x10b5cC443a0172fcc390Ef7831c79B063dbe3CCD 0x52f1c40755a47915A93B131405a2C95eA904A6Db 0xBEdf65e08498639B7b0000fCA892f28fa3d15021
```

---

## Admin Wallet

The deployer wallet `0xD3dc27A44A84a9DdcF86804556FE601503903a51` is the contract owner and can:
- Verify doctors in DoctorRegistry
- Revoke doctor verifications
- Transfer ownership (if needed)

---

**Status**: ✅ **Deployment Successful**

All contracts are live on Sepolia testnet and ready for integration testing!
