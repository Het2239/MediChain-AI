# 🏥 MediChain AI — Decentralized AI-Powered Healthcare Record System

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8+-363636?style=flat&logo=solidity)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Hardhat-3C3C3D?style=flat&logo=ethereum)](https://hardhat.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5_Flash-8E75B2?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![IPFS](https://img.shields.io/badge/Storage-IPFS-65C2CB?style=flat&logo=ipfs)](https://ipfs.tech/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> *A secure, decentralized medical record exchange platform that leverages Blockchain for immutable access control and Generative AI (Gemini 1.5) for intelligent health insights and summarization.*

---

## 🎯 Problem Statement

The modern healthcare ecosystem faces critical data challenges:

### The Data Silo Crisis
Medical records are scattered across various hospitals and clinics, making it impossible for patients to have a unified view of their health history.

### Key Challenges
❌ **Fragmentation**: Records are locked in isolated hospital databases.  
❌ **Lack of Ownership**: Patients do not truly own or control their medical data.  
❌ **Privacy Risks**: Centralized servers are vulnerable to massive data breaches.  
❌ **Information Overload**: Doctors spend valuable time digging through hundreds of pages of unstructured PDF reports.  
❌ **Interoperability**: Sharing records between different providers is slow and bureaucratic.

---

## ✨ Our Solution: Blockchain + GenAI

**MediChain AI** bridges the gap between security and utility by combining:
1.  **Blockchain (Ethereum/Polygon)** for decentralized identity and immutable access control.
2.  **IPFS (InterPlanetary File System)** for secure, distributed storage of encrypted medical files.
3.  **Google Gemini 1.5 AI** for instant analysis, summarization, and trend detection in medical reports.

### 🚀 Core Features

#### 🛡️ Secure & Decentralized
- **Patient Sovereignty**: Patients grant and revoke doctor access via Smart Contracts.
- **End-to-End Encryption**: Files are encrypted before IPFS upload; only authorized private keys can decrypt them.
- **Immutable Audit Logs**: Every access request and file upload is recorded on-chain.

#### 🧠 AI-Powered Insights (Gemini 1.5)
- **Instant Summarization**: Converts complex lab reports (PDF/Images) into simple, readable summaries.
- **Trend Analysis**: Automatically tracks vitals (e.g., Blood Pressure, Glucose) over time from uploaded history.
- **Doctor Copilot**: Provides doctors with "At a Glance" patient health overviews, saving review time.

#### 👥 Role-Based Ecosystem
- **Patient Portal**: Upload records, manage permissions, view AI health trends.
- **Doctor Dashboard**: Verify credentials, request patient access, view clinical insights.
- **Admin Panel**: Verify doctor licenses, monitor network health.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│           React + Vite + Tailwind (Opella Theme)            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Patient   │  │    Doctor    │  │     Admin    │       │
│  │   Dashboard  │  │   Dashboard  │  │     Panel    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                          │
│               Node.js + Express (REST API)                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  AI Service  │  │ IPFS Service │  │  Auth & BAM  │       │
│  │ (Gemini 1.5) │  │   (Pinata)   │  │  (Middleware)│       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    DECENTRALIZED LAYER                      │
│                                                             │
│   ┌──────────────┐           ┌──────────────────────┐       │
│   │   Ethereum   │           │         IPFS         │       │
│   │ Smart Contract│◄────────►│  (Encrypted Storage) │       │
│   └──────────────┘           └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Blockchain & Storage
| Technology | Description |
|-----------|-------------|
| **Solidity** | Smart Contract development |
| **Hardhat** | Development environment & local blockchain |
| **Ethers.js / Wagmi** | Blockchain interaction hooks |
| **IPFS (Pinata)** | Decentralized file storage |
| **AES-256** | File encryption standard |

### Backend & AI
| Technology | Description |
|-----------|-------------|
| **Node.js / Express** | RESTful API server |
| **Google Gemini 1.5** | Generative AI for medical insights |
| **Multer** | File handling middleware |
| **PDF-Parse/Tesseract** | Document parsing & OCR |

### Frontend
| Technology | Description |
|-----------|-------------|
| **React 18** | UI Library |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling (Custom Opella Theme) |
| **Lucide React** | Iconography |
| **Recharts** | Data visualization for health trends |

---

## 📂 Project Structure

```
MediChain-AI/
│
├─ contracts/                 # Solidity Smart Contracts
│   ├── MediChain.sol         # Main logic (Access Control, Records)
│   └── deploy.js             # Deployment scripts
│
├─ backend/                   # Node.js API Server
│   ├── src/
│   │   ├── services/         # AI, IPFS, Blockchain services
│   │   ├── routes/           # API Endpoints (Patient, Doctor, Admin)
│   │   ├── controllers/      # Request handlers
│   │   └── server.js         # Entry point
│   └── .env                  # Secrets (Private Keys, API Keys)
│
└── frontend/                 # React Application
    ├── src/
    │   ├── pages/            # Role-based pages (Patient, Doctor, Admin)
    │   ├── components/       # Reusable UI (Modals, Cards, Charts)
    │   ├── styles/           # Tailwind & Opella design tokens
    │   └── context/          # Auth & Blockchain contexts
    └── .env                  # Frontend config (Contract Address)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MetaMask** wallet installed
- **Pinata** account (for IPFS)
- **Google AI Studio** key (for Gemini)

### 1. 🔗 Blockchain Setup
```bash
cd contracts
npm install

# Start local hardhat node
npx hardhat node

# Deploy contract (in new terminal)
npx hardhat run scripts/deploy.js --network localhost
# Copy the deployed Contract Address!
```

### 2. ⚙️ Backend Setup
```bash
cd backend
npm install

# Create .env
cp .env.example .env
# Add: PINATA_KEYS, GEMINI_API_KEY, PRIVATE_KEY (for admin actions)

# Start Server
npm run dev
```

### 3. 🎨 Frontend Setup
```bash
cd frontend
npm install

# Create .env
# Add: VITE_CONTRACT_ADDRESS=<Address from Step 1>

# Start Frontend
npm run dev
```
**App running at:** `http://localhost:5173`

---

## 📡 API Reference

### Patient Routes
- `POST /api/patient/register` - Register new patient on-chain.
- `POST /api/file/upload` - Encrypt & upload record to IPFS + Blockchain.
- `GET /api/patient/insights` - Get AI-generated health summary.

### Doctor Routes
- `POST /api/doctor/verify` - Submit license for admin verification.
- `POST /api/doctor/access-request` - Request access to a patient.
- `GET /api/doctor/patient/:id/records` - View decrypted records (if authorized).

---

## 👥 Team

**Sparsh Agarwal** - Full Stack Blockchain Developer
- *Frontend Architecture & Opella UI Design*
- *Smart Contract Engineering*
- *AI Integration & Backend Logic*

---

## 📝 License

This project is licensed under the **MIT License**.

Built for a safer, smarter healthcare future. 🏥✨
