# 🏥 MediChain AI — Decentralized AI-Powered Healthcare Record System

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Development-yellow?style=flat&logo=hardhat)](https://hardhat.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash_Lite-8E75B2?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![IPFS](https://img.shields.io/badge/Storage-IPFS_Pinata-65C2CB?style=flat&logo=ipfs)](https://ipfs.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> *A secure, decentralized medical record exchange platform that leverages Blockchain for immutable access control and Generative AI (Gemini 2.5) for intelligent health insights, predictive analytics, and automated clinical summaries.*


---

## 🎯 Problem Statement

The modern healthcare ecosystem confronts critical data challenges that impact patient care and data security:

### The Data Silo Crisis
Medical records are fragmented across isolated hospital databases, preventing a unified view of a patient's health history.

### Key Challenges
❌ **Fragmentation**: Records are locked in distinct provider systems, leading to redundant tests and delayed diagnoses.  
❌ **Lack of Ownership**: Patients do not truly own their data; accessing it requires bureaucracy and physical visits.  
❌ **Privacy Risks**: Centralized servers are single points of failure, vulnerable to massive data breaches (e.g., ransomware attacks).  
❌ **Information Overload**: Physicians spend 35% of their time reviewing unstructured PDF reports instead of treating patients.  
❌ **Interoperability Gap**: Sharing records between specialists or across borders is slow, insecure, and manual.

---

## ✨ Our Solution: The Triad of Trust & Intelligence

**MediChain AI** bridges the gap between security and utility by orchestrating three cutting-edge technologies:

1.  **Blockchain (Ethereum/Polygon)**: Ensures decentralized identity, immutable audit logs, and patient-sovereign access control via Smart Contracts.
2.  **IPFS (InterPlanetary File System)**: Provides secure, distributed, and encrypted storage for sensitive medical documents, eliminating central servers.
3.  **Google Gemini 2.5 AI**: Delivers instant analysis, summarization, and trend detection, turning raw data into actionable clinical insights.

### 🚀 Core Features

#### 🛡️ Secure & Decentralized
- **Patient Sovereignty**: Patients grant `requestAccess` and `revokeAccess` to doctors via Smart Contracts (`AccessControl.sol`).
- **End-to-End Encryption**: Files are encrypted (AES-256) client-side before IPFS upload; only authorized keys can decrypt them.
- **Immutable Audit Trail**: Every view, share, and upload is recorded on-chain, ensuring 100% transparency.

#### 🧠 AI-Powered Insights (Gemini 2.5 Flash-Lite)
- **Instant Summarization**: Converts complex lab reports (PDF/Images) into structured JSON summaries.
- **Trend Analysis**: Automatically tracks vitals (e.g., HbA1c, Blood Pressure) over time from uploaded history.
- **Clinical Dashboards**: Provides doctors with "At a Glance" patient health snapshots, highlighting critical changes since the last visit.
- **Privacy-First AI**: AI processing happens on the backend with strict data minimization; no data is used for model training.

#### 👥 Role-Based Ecosystem
- **Patient Portal**: Upload records, manage doctor permissions, view personal health AI trends.
- **Doctor Dashboard**: Verify credentials, request patient access, view consolidated clinical timelines.
- **Admin Panel**: Verify doctor licenses, monitor network health, and manage system parameters.

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
│  │ (Gemini 2.5) │  │   (Pinata)   │  │  (Middleware)│       │
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
│   │(AccessControl)│          │      (Pinata)        │       │
│   └──────────────┘           └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Blockchain & Storage
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | ^0.8.20 | Smart Contract Logic |
| **Hardhat** | Latest | Development, Testing, Deployment |
| **Ethers.js** | ^6.0 | Blockchain Interaction |
| **IPFS (Pinata)** | - | Decentralized File Storage |
| **Wagmi/Viem** | ^2.0 | React Hooks for Ethereum |

### Backend & AI
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express** | ^4.18 | RESTful API Framework |
| **Gemini AI** | 1.5/2.5 | generative-ai SDK for Insights |
| **Multer** | - | File Upload Handling |
| **PDF-Parse** | - | Document Text Extraction |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18 | UI Component Library |
| **Vite** | Latest | Build Tool & Dev Server |
| **Tailwind CSS** | ^3.4 | Utility-First Styling |
| **Lucide React** | - | Iconography |
| **Recharts** | - | Data Visualization Charts |

---

## 🤖 Deep Dive: AI & Blockchain Workflows

### 1. Smart Contract Access Control (`AccessControl.sol`)
The core security layer. It maps Patients → Doctors → Permissions.
*   `requestAccess(address _patient, string _reason)`: Doctor initiates a request.
*   `approveAccess(address _doctor)`: Patient signs a transaction to approve.
*   `revokeAccess(address _doctor)`: Patient removes access instantly.
*   `logAccess(address _patient)`: Records every view on-chain for audit.

### 2. AI Insight Generation Flow
How we turn PDF reports into clinical value:
1.  **Ingestion**: User uploads PDF/Image. Backend parses text via `pdf-parse` or Gemini Vision.
2.  **Context Building**: Previous records are retrieved to build a "Patient History Context".
3.  **Prompt Engineering**: A constrained prompt instructs Gemini to output **strictly JSON**:
    ```json
    {
      "healthSummary": "...",
      "vitalTrends": { "hbA1c": "decreasing" },
      "recommendations": ["..."]
    }
    ```
4.  **Verification**: The JSON is parsed and validated before being sent to the frontend Dashboard.

---

## 📂 Project Structure

```
MediChain-AI/
│
├─ contracts/                 # Hardhat Environment
│   ├── contracts/
│   │   ├── AccessControl.sol # Permission Logic
│   │   ├── PatientRegistry.sol # Identity Logic
│   │   └── DoctorRegistry.sol # Verification Logic
│   └── scripts/              # Deployment Scripts
│
├─ backend/                   # Node.js API
│   ├── src/
│   │   ├── services/
│   │   │   ├── ai.service.js   # Gemini Integration
│   │   │   ├── ipfs.service.js # Pinata Integation
│   │   │   └── blockchain.service.js # Ethers.js Logic
│   │   └── routes/           # API Endpoints
│   └── .env                  # Keys & Config
│
└── frontend/                 # React App
    ├── src/
    │   ├── pages/            # Role-Based Views
    │   ├── components/       # Reusable UI
    │   ├── styles/           # Opella Theme System
    │   └── assets/
    └── .env                  # Contract Address
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** installed
- **MetaMask** browser extension
- **Pinata** Account (Free tier works)
- **Google AI Studio** API Key

### Step 1: Blockchain Deployment 🔗
```bash
# Navigate to contracts
cd contracts
npm install

# Start local blockchain
npx hardhat node

# Open a NEW terminal
# Deploy contracts to local network
npx hardhat run scripts/deploy.js --network localhost

# ⚠️ COPY the deployed "MediChain Address" output!
```

### Step 2: Backend Configuration ⚙️
```bash
cd backend
npm install

# Setup Environment
cp .env.example .env
```
**Edit `.env` with your keys:**
```env
PORT=3001
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
GEMINI_API_KEY=your_google_ai_key
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_hardhat_account_0_private_key
CONTRACT_ADDRESS=address_from_step_1
```
**Start Server:**
```bash
npm run dev
```

### Step 3: Frontend Launch 🎨
```bash
cd frontend
npm install

# Setup Environment
cp .env.example .env
```
**Edit `.env`:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_CONTRACT_ADDRESS=address_from_step_1
```
**Start App:**
```bash
npm run dev
```
**Visit:** `http://localhost:5173`

---

## 📡 API Reference

#### Patient Routes
*   `POST /api/patient/register`: Register wallet on-chain.
*   `POST /api/file/upload`: Upload & Encrypt file to IPFS.
*   `GET /api/patient/records`: Fetch decrypted record metadata.
*   `GET /api/patient/insights`: Get AI-generated health summaries.

#### Doctor Routes
*   `POST /api/doctor/verify`: Submit license for verification.
*   `POST /api/doctor/access-request`: Initiate access request.
*   `GET /api/doctor/patients`: List authorized patients.

---

## 👥 Team

**Het Chavadiya**
*   *Smart Contract Architect*
*   *Web3 Integration*

**Sparsh Agarwal**
*   *AI Systems Integrator*
*   *Backend Flow Design*

**Divy Dobariya**
*   *AI Systems Integrator*
*   *Backend Flow Design*

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>⚡ Secure Records. Intelligent Insights. Decentralized Future. ⚡</strong>
</p>
