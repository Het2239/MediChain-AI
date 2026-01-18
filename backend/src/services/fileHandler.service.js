const encryptionService = require('./encryption.service');
const ipfsService = require('./ipfs.service');
const blockchainService = require('./blockchain.service');

/**
 * File Handler Service
 * Orchestrates the complete file upload/download flow:
 * 1. Encrypt file
 * 2. Upload to IPFS
 * 3. Store CID on blockchain
 */

class FileHandlerService {
    /**
     * Upload and encrypt medical file
     * @param {Buffer} fileBuffer - File data
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} category - File category (reports/prescriptions/scans)
     * @param {string} filename - Original filename
     * @param {string} fileType - File extension (pdf, docx, jpg, etc.)
     * @param {Object} additionalMetadata - Additional metadata
     * @returns {Promise<Object>} - { cid, iv, txReceipt }
     */
    async uploadMedicalFile(
        fileBuffer,
        patientAddress,
        category,
        filename,
        fileType,
        additionalMetadata = {}
    ) {
        try {
            console.log(`\n🔐 Starting encrypted upload for ${filename}...`);

            // Step 1: Encrypt file
            console.log('1️⃣  Encrypting file...');
            const { encryptedData, iv } = encryptionService.encryptWithWallet(
                fileBuffer,
                patientAddress
            );

            // Combine IV and encrypted data for storage
            const combinedData = encryptionService.combineEncryptedData(encryptedData, iv);
            console.log(`   ✅ File encrypted (${combinedData.length} bytes)`);

            // Step 2: Upload to IPFS
            console.log('2️⃣  Uploading to IPFS...');
            const ipfsResult = await ipfsService.uploadFile(
                combinedData,
                patientAddress,
                category,
                filename,
                {
                    fileType,
                    ivHex: iv.toString('hex'),
                    ...additionalMetadata
                }
            );
            console.log(`   ✅ Uploaded to IPFS: ${ipfsResult.cid}`);

            // Step 3: Store CID on blockchain
            console.log('3️⃣  Recording on blockchain...');
            const txReceipt = await blockchainService.addMedicalRecord(
                patientAddress,
                ipfsResult.cid,
                fileType,
                category
            );
            console.log(`   ✅ Blockchain transaction: ${txReceipt.hash}`);

            return {
                success: true,
                cid: ipfsResult.cid,
                iv: iv.toString('hex'),
                ipfsUrl: ipfsResult.pinataUrl,
                txHash: txReceipt.hash,
                blockNumber: txReceipt.blockNumber,
                size: fileBuffer.length,
                encryptedSize: combinedData.length
            };
        } catch (error) {
            console.error('❌ Upload failed:', error);
            throw new Error(`File upload failed: ${error.message}`);
        }
    }

    /**
     * Retrieve and decrypt medical file
     * @param {string} cid - IPFS Content Identifier
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} doctorAddress - Doctor's wallet address (optional, for access logging)
     * @returns {Promise<Buffer>} - Decrypted file data
     */
    async retrieveMedicalFile(cid, patientAddress, doctorAddress = null) {
        try {
            console.log(`\n🔓 Starting encrypted retrieval for CID: ${cid}...`);

            // Step 1: Check access (if doctor is requesting)
            if (doctorAddress && doctorAddress !== patientAddress) {
                console.log('1️⃣  Checking access permissions...');
                const hasAccess = await blockchainService.hasAccess(patientAddress, doctorAddress);

                if (!hasAccess) {
                    throw new Error('Access denied: Doctor not authorized');
                }

                // Log access (doctor viewing patient records)
                await blockchainService.logAccess(patientAddress, doctorAddress);
                console.log(`   ✅ Access granted for ${doctorAddress}`);
            }

            // Step 2: Retrieve from IPFS
            console.log('2️⃣  Retrieving from IPFS...');
            const combinedData = await ipfsService.retrieveFile(cid);
            console.log(`   ✅ Retrieved ${combinedData.length} bytes`);

            // Step 3: Split IV and encrypted data
            const { iv, encryptedData } = encryptionService.splitEncryptedData(combinedData);

            // Step 4: Decrypt file
            console.log('3️⃣  Decrypting file...');
            const decryptedData = encryptionService.decryptWithWallet(
                encryptedData,
                patientAddress,
                iv
            );
            console.log(`   ✅ File decrypted (${decryptedData.length} bytes)`);

            return decryptedData;
        } catch (error) {
            console.error('❌ Retrieval failed:', error);
            throw new Error(`File retrieval failed: ${error.message}`);
        }
    }

    /**
     * Get all medical records for a patient from blockchain
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Array>} - Array of records with metadata
     */
    async getPatientRecords(patientAddress) {
        try {
            const records = await blockchainService.getPatientRecords(patientAddress);

            // Convert to plain objects
            return records.map(record => ({
                cid: record.cid,
                fileType: record.fileType,
                category: record.category,
                timestamp: Number(record.timestamp),
                uploader: record.uploader,
                timestampDate: new Date(Number(record.timestamp) * 1000).toISOString()
            }));
        } catch (error) {
            throw new Error(`Failed to get patient records: ${error.message}`);
        }
    }

    /**
     * Get records by category
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} category - Category to filter by
     * @returns {Promise<Array>} - Array of records
     */
    async getRecordsByCategory(patientAddress, category) {
        try {
            const records = await blockchainService.getRecordsByCategory(patientAddress, category);

            return records.map(record => ({
                cid: record.cid,
                fileType: record.fileType,
                category: record.category,
                timestamp: Number(record.timestamp),
                uploader: record.uploader,
                timestampDate: new Date(Number(record.timestamp) * 1000).toISOString()
            }));
        } catch (error) {
            throw new Error(`Failed to get records by category: ${error.message}`);
        }
    }

    /**
     * Delete file (unpin from IPFS - blockchain record remains)
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<void>}
     */
    async deleteFile(cid) {
        try {
            await ipfsService.unpinFile(cid);
            console.log(`🗑️  File deleted from IPFS: ${cid}`);
        } catch (error) {
            throw new Error(`File deletion failed: ${error.message}`);
        }
    }

    /**
     * Get storage statistics for a patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Object>} - Storage statistics
     */
    async getStorageStats(patientAddress) {
        try {
            const [recordCount, storageSize] = await Promise.all([
                blockchainService.getPatientRecords(patientAddress).then(r => r.length),
                ipfsService.getPatientStorageSize(patientAddress)
            ]);

            return {
                totalRecords: recordCount,
                totalStorageBytes: storageSize,
                totalStorageMB: (storageSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            throw new Error(`Failed to get storage stats: ${error.message}`);
        }
    }

    /**
     * Verify file integrity
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<boolean>} - True if file exists and is pinned
     */
    async verifyFileIntegrity(cid) {
        try {
            return await ipfsService.isPinned(cid);
        } catch (error) {
            return false;
        }
    }
}

// Export singleton instance
module.exports = new FileHandlerService();
