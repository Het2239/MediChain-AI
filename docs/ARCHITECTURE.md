# MediChain AI - System Architecture

## Overview

MediChain AI is a hybrid decentralized healthcare platform that combines:
- **Blockchain** for access control and audit trails
- **IPFS** for decentralized file storage
- **Backend services** for encryption and AI processing
- **Web dashboards** for user interaction

---

## System Components

### 1. Smart Contracts (Blockchain Layer)

#### PatientRegistry.sol
- Manages patient registration
- Stores medical record metadata (CID, file type, category, timestamp)
- Maintains patient record history
- Emits events for record additions

**Key Functions:**
```solidity
registerPatient()
addRecord(string cid, string fileType, string category)
getRecords(address patient) returns (MedicalRecord[])
```

#### DoctorRegistry.sol
- Manages doctor verification by admin
- Tracks doctor licenses
- Enables admin to revoke doctor status

**Key Functions:**
```solidity
verifyDoctor(address doctor, string licenseNumber)
revokeDoctor(address doctor)
isVerified(address doctor) returns (bool)
```

#### AccessControl.sol
- Manages patient-doctor access permissions
- Tracks access requests and approvals
- Provides audit trail for all access events

**Key Functions:**
```solidity
requestAccess(address patient)
approveAccess(address doctor)
revokeAccess(address doctor)
hasAccess(address patient, address doctor) returns (bool)
getAuditLog(address patient) returns (AccessEvent[])
```

---

### 2. Storage Layer (IPFS/Pinata)

#### File Structure
```
/patients/
  /{patient-wallet-address}/
    /reports/
      report-2024-01-15.pdf.enc
      lab-results-2024-01-10.pdf.enc
    /prescriptions/
      prescription-2024-01-12.pdf.enc
    /scans/
      xray-2024-01-14.png.enc
```

#### Encryption Flow
1. Client uploads file to backend
2. Backend encrypts file with AES-256-CBC
   - Key = PBKDF2(wallet_address + patient_password)
   - IV = random 16 bytes
3. Encrypted file uploaded to IPFS via Pinata
4. CID returned and stored on blockchain

#### Pinning Strategy
- All files pinned to Pinata for persistence
- Optional: Secondary pinning service for redundancy

---

### 3. Backend Services

#### Encryption Service
```javascript
encrypt(buffer, key) -> { encryptedData, iv }
decrypt(encryptedData, key, iv) -> buffer
generateKey(walletAddress, password) -> key
```

**Algorithm:** AES-256-CBC with PBKDF2 key derivation

#### IPFS Service
```javascript
uploadFile(encryptedBuffer, patientAddress, category, filename) -> CID
retrieveFile(cid) -> encryptedBuffer
```

**Features:**
- Folder-based organization
- Automatic pinning
- Retry logic for failed uploads

#### Blockchain Service
```javascript
addMedicalRecord(patientAddress, cid, fileType, category)
getPatientRecords(patientAddress) -> records[]
checkAccess(patientAddress, doctorAddress) -> boolean
```

#### AI/RAG Pipeline

##### Document Processor
- Parses PDF, DOCX, images (with OCR)
- Extracts text and metadata
- Chunks documents semantically (300-500 tokens)

##### Embedding Service
- Generates embeddings using Groq API
- Model: `llama-3.1-8b-instant` or similar
- Batch processing for efficiency

##### Vector Store (FAISS)
- Stores embeddings with metadata
- Patient-specific collections
- Fast similarity search

##### Generation Service
- Medical summary generation
- Timeline extraction
- Risk alert identification
- Uses Groq LLM with specialized medical prompts

---

### 4. Frontend (React)

#### Authentication Flow
1. User clicks "Connect Wallet"
2. RainbowKit modal appears
3. User connects wallet (MetaMask, WalletConnect, etc.)
4. Backend verifies wallet signature
5. Role determined from smart contracts
6. User redirected to appropriate dashboard

#### Patient Dashboard
- Upload medical records
- View all records (organized by category)
- Manage doctor access requests
- View AI-generated health summary

#### Doctor Dashboard
- Request patient access
- View approved patients
- Access patient records
- Use AI-powered analysis tools

#### Admin Dashboard
- Verify doctors
- View system statistics
- Monitor audit logs

---

## Data Flow Diagrams

### Upload Flow
```
Patient -> Frontend -> Backend -> [Encrypt] -> IPFS/Pinata -> CID
                          |
                          v
                    Blockchain (store CID + metadata)
                          |
                          v
                    AI Pipeline (process document)
```

### Access Request Flow
```
Doctor -> Frontend -> Smart Contract (requestAccess)
                          |
                          v
                    Event Emitted
                          |
                          v
Patient Dashboard <- Notification
         |
         v
    Approve/Deny
         |
         v
Smart Contract (approveAccess/denyAccess)
         |
         v
    Event Logged
```

### Record Retrieval Flow
```
Doctor -> Frontend -> Backend (check access)
                          |
                     [if approved]
                          |
                          v
                    Get CID from blockchain
                          |
                          v
                    Retrieve from IPFS
                          |
                          v
                    [Decrypt with patient key]
                          |
                          v
                    Return decrypted file
```

---

## Security Model

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized file access | Blockchain access control + encryption |
| IPFS file exposure | AES-256 encryption before upload |
| Key compromise | Keys never stored, derived on-demand |
| Smart contract bugs | Comprehensive testing + audit |
| Man-in-the-middle | HTTPS + wallet signatures |

### Key Management

**Key Derivation:**
```javascript
key = PBKDF2(
  password: wallet_address + patient_password,
  salt: wallet_address,
  iterations: 100000,
  keylen: 32,
  digest: 'sha256'
)
```

**Key Storage:**
- Keys NEVER stored in database or blockchain
- Derived on-demand for encryption/decryption
- Patient must provide password for each decrypt operation

### Access Control Layers

1. **Blockchain Layer**: Smart contract enforces access rules
2. **Backend Layer**: Verifies blockchain permissions before file operations
3. **Encryption Layer**: Even if file is accessed, it's encrypted

---

## Scalability Considerations

### IPFS Scaling
- Use multiple Pinata gateways for load balancing
- Consider IPFS cluster for high availability
- Implement caching layer for frequently accessed files

### Blockchain Scaling
- Deploy on Layer 2 (Polygon) for lower gas fees
- Batch operations when possible
- Use event indexing for faster queries

### AI/RAG Scaling
- Queue system for document processing
- Batch embedding generation
- Cache generated summaries
- Consider GPU instances for large-scale deployment

### Database Scaling
- Vector database sharding by patient
- Implement pagination for large record sets
- Use Redis for caching frequent queries

---

## Compliance & Privacy

### GDPR Alignment
- Patient owns and controls data
- Right to access: Patient can always view own data
- Right to erasure: Patient can delete records (remove CID from blockchain)
- Data portability: Export functionality

### HIPAA Considerations
- Encryption at rest (IPFS) and in transit (HTTPS)
- Access logging and audit trails
- Role-based access control
- Patient consent management

---

## Monitoring & Observability

### Metrics to Track
- Smart contract gas usage
- IPFS upload/retrieval times
- AI inference latency
- API response times
- Error rates

### Logging
- All access events logged on-chain
- Backend logs for debugging
- Frontend error tracking

---

## Future Architecture Enhancements

1. **Federated Learning**: Train AI models without sharing raw data
2. **Multi-chain Support**: Deploy on multiple blockchains
3. **Decentralized Identity**: Integration with DIDs
4. **Mobile Apps**: React Native apps for iOS/Android
5. **Real-time Notifications**: WebSocket for instant access request alerts
6. **Advanced AI**: Disease prediction models, drug interaction checking
