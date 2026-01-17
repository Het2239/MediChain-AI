# Testing IPFS Integration

## Prerequisites

Before running the IPFS test, you need to:

### 1. Get Pinata API Credentials

1. Go to https://pinata.cloud
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key with these permissions:
   - `pinFileToIPFS`
   - `pinList`
   - `unpin`
5. Copy your API Key and Secret API Key

### 2. Configure Environment Variables

Add your Pinata credentials to `/media/het/New Volume/Projects/MediChain/.env`:

```bash
# IPFS/Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
```

## Running the Test

From the backend directory:

```bash
cd /media/het/New\ Volume/Projects/MediChain/backend
node src/tests/test-ipfs.js
```

## What the Test Does

The test performs 11 comprehensive checks:

1. **Pinata Authentication** - Verifies API credentials
2. **Test File Creation** - Creates a sample medical report
3. **File Encryption** - Encrypts the file with AES-256
4. **IPFS Upload** - Uploads to Pinata with metadata
5. **IPFS Retrieval** - Downloads file from IPFS
6. **File Decryption** - Decrypts and verifies content
7. **Metadata Retrieval** - Gets file metadata from Pinata
8. **Patient File Listing** - Lists all files for test patient
9. **Pin Verification** - Checks if file is pinned
10. **Storage Statistics** - Calculates total storage used
11. **Cleanup Info** - Shows how to delete test file

## Expected Output

```
🧪 Testing MediChain IPFS Integration

============================================================

1️⃣  Testing Pinata Initialization...
   ✅ Pinata authenticated successfully

2️⃣  Creating Test File...
   ✅ Test file created (XXX bytes)

... (more tests)

✅ All IPFS Integration Tests Passed!

📊 Test Summary:
   ✓ Pinata authentication
   ✓ File encryption
   ✓ IPFS upload
   ✓ IPFS retrieval
   ... etc

🎉 IPFS Integration is fully functional!
```

## Troubleshooting

### Error: "Pinata API credentials not configured"
- Make sure you've added the API keys to `.env`
- Verify there are no typos in the environment variable names

### Error: "Pinata authentication failed"
- Check that your API keys are correct
- Ensure your Pinata account is active
- Verify the API key has the required permissions

### Error: "Failed to upload file to IPFS"
- Check your internet connection
- Verify Pinata service status
- Try again in a few moments

## Cleaning Up Test Files

The test file remains pinned on IPFS by default. To delete it:

1. Note the CID from the test output
2. Uncomment the cleanup code in `test-ipfs.js`:
   ```javascript
   // Uncomment this line:
   await ipfsService.unpinFile(uploadedCID);
   ```
3. Or manually delete via Pinata dashboard

## Manual Verification

After the test completes, you can manually verify the file:

1. Copy the Gateway URL from the test output
2. Open it in a browser
3. You'll see the encrypted file (binary data)
4. This confirms the file is accessible on IPFS

## Next Steps

Once the test passes:
- ✅ IPFS integration is working
- ✅ Ready to proceed with Phase 4 (Backend API)
- ✅ Can start building upload/download endpoints
