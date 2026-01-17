# MediChain AI 🏥⛓️🤖

**Privacy-Preserving Unified Health Records with AI Intelligence**

A decentralized healthcare record management platform integrating Blockchain, IPFS, and AI-based Retrieval-Augmented Generation (RAG) to provide secure, patient-controlled access to medical data with intelligent summarization and insights.

---

## 🌟 Features

- 🔐 **Patient-Controlled Access**: Blockchain-based access control with wallet authentication
- 📦 **Decentralized Storage**: Encrypted medical records stored on IPFS via Pinata
- 🤖 **AI-Powered Insights**: RAG pipeline for medical summarization and semantic search
- 👨‍⚕️ **Doctor Verification**: Admin-verified healthcare providers
- 📊 **Smart Dashboards**: Separate interfaces for patients, doctors, and admins
- 🔍 **Audit Trail**: Complete blockchain-based access logging

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Patient   │      │    Doctor    │      │    Admin    │
│  Dashboard  │      │  Dashboard   │      │  Dashboard  │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘
       │                    │                      │
       └────────────────────┼──────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  React Frontend │
                    │ (Wagmi/Rainbow) │
                    └───────┬─────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼──────┐    ┌────────▼────────┐   ┌──────▼──────┐
│  Blockchain │    │  Backend API    │   │  IPFS/Pinata│
│  (Sepolia)  │    │  (Express.js)   │   │  (Storage)  │
└─────────────┘    └────────┬────────┘   └─────────────┘
                            │
                    ┌───────▼────────┐
                    │  AI/RAG Engine │
                    │ (Groq + FAISS) │
                    └────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Solidity, Hardhat, Ethers.js |
| **Storage** | IPFS, Pinata |
| **Backend** | Node.js, Express |
| **Encryption** | AES-256-CBC |
| **AI/RAG** | Groq API, FAISS |
| **Frontend** | React, Wagmi, RainbowKit, TailwindCSS |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Pinata account (for IPFS)
- Groq API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediChain
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Deploy smart contracts**
   ```bash
   npm run contracts:deploy
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on `http://localhost:3001`
   - Frontend on `http://localhost:5173`

---

## 📁 Project Structure

```
MediChain/
├── contracts/           # Smart contracts
│   ├── contracts/
│   │   ├── PatientRegistry.sol
│   │   ├── DoctorRegistry.sol
│   │   └── AccessControl.sol
│   ├── scripts/
│   └── test/
├── backend/            # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── encryption.service.js
│   │   │   ├── ipfs.service.js
│   │   │   └── rag/
│   │   └── middleware/
│   └── package.json
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── config/
│   └── package.json
└── docs/              # Documentation
```

---

## 📖 Usage

### For Patients

1. **Connect Wallet**: Click "Connect Wallet" and authenticate
2. **Upload Records**: Drag and drop medical documents (they'll be encrypted automatically)
3. **Manage Access**: Approve or revoke doctor access requests
4. **View AI Summary**: See intelligent insights from your medical history

### For Doctors

1. **Get Verified**: Request verification from admin
2. **Request Access**: Enter patient wallet address to request access
3. **View Records**: Access approved patient records
4. **Use AI Analysis**: Get AI-powered summaries and semantic search

### For Admins

1. **Verify Doctors**: Review and approve doctor verification requests
2. **Monitor System**: View system statistics and audit logs
3. **Manage Users**: Revoke access when needed

---

## 🔒 Security

- **Encryption**: All files encrypted with AES-256 before IPFS upload
- **Access Control**: Blockchain-enforced permission system
- **Key Management**: Encryption keys derived from wallet + password (never stored)
- **Audit Trail**: All access events logged on-chain

---

## 🧪 Testing

```bash
# Test smart contracts
npm run contracts:test

# Test backend
npm run backend:test

# Run all tests
npm test
```

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

## 📧 Contact

For questions or support, please open an issue.

---

**Built with ❤️ for secure, patient-controlled healthcare**
