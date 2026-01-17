# 🏥 MediChain AI

A decentralized healthcare records management system built on blockchain technology with AI-powered features.

## ✨ Features

- **🔐 Blockchain Security**: Immutable medical records stored on Ethereum
- **📁 IPFS Storage**: Encrypted file storage using Pinata
- **👤 Patient Portal**: Upload, manage, and share medical records
- **👨‍⚕️ Doctor Access**: Request and view authorized patient records
- **🔒 Encryption**: End-to-end encryption for all medical files
- **📊 Admin Dashboard**: Verify doctors and monitor system activity
- **🎯 Access Control**: Smart contract-based permission management

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- MetaMask browser extension
- Pinata account (for IPFS)

### Installation

**Linux/macOS:**
```bash
git clone <your-repo-url>
cd MediChain
chmod +x setup.sh start.sh
./setup.sh
```

**Windows:**
```powershell
git clone <your-repo-url>
cd MediChain
.\setup.ps1
```

### Configuration

1. Get Pinata API keys from [pinata.cloud](https://pinata.cloud/)
2. Update `backend/.env`:
   ```env
   PINATA_API_KEY=your_api_key
   PINATA_SECRET_API_KEY=your_secret_key
   ```

### Running

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```powershell
.\start.ps1
```

Access the application at **http://localhost:5173**

## 📖 Documentation

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 🏗️ Architecture

```
MediChain/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Node.js + Express API
├── contracts/         # Solidity smart contracts
├── setup.sh/.ps1      # Setup scripts
└── start.sh/.ps1      # Start scripts
```

## 🔑 Key Technologies

- **Frontend**: React, Vite, Wagmi, RainbowKit, TailwindCSS
- **Backend**: Node.js, Express, Ethers.js
- **Blockchain**: Solidity, Hardhat
- **Storage**: IPFS (Pinata), Encrypted files
- **Authentication**: MetaMask wallet connection

## 🎯 Usage

### As a Patient
1. Connect MetaMask wallet
2. Register as patient
3. Upload encrypted medical records
4. Manage doctor access permissions

### As a Doctor
1. Get verified by admin
2. Request access to patient records
3. View and download authorized files

### As an Admin
1. Use admin secret to access panel
2. Verify doctor registrations
3. Monitor system activity

## 🔐 Security

- All files are encrypted before upload
- Smart contract-based access control
- Blockchain audit trail
- Immutable record keeping

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using blockchain technology
