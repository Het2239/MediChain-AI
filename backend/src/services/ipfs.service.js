const pinataSDK = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

/**
 * IPFS Service using Pinata
 * Handles file uploads to IPFS with folder-based organization
 */

class IPFSService {
    constructor() {
        this.pinata = null;
        this.initialized = false;
    }

    /**
     * Initialize Pinata SDK
     */
    async initialize() {
        if (this.initialized) return;

        const apiKey = process.env.PINATA_API_KEY;
        const secretApiKey = process.env.PINATA_SECRET_API_KEY;

        if (!apiKey || !secretApiKey) {
            throw new Error('Pinata API credentials not configured');
        }

        this.pinata = new pinataSDK(apiKey, secretApiKey);

        // Test authentication
        try {
            await this.pinata.testAuthentication();
            this.initialized = true;
            console.log('✅ Pinata initialized successfully');
        } catch (error) {
            throw new Error('Pinata authentication failed: ' + error.message);
        }
    }

    /**
     * Upload encrypted file to IPFS with folder structure
     * @param {Buffer} encryptedBuffer - Encrypted file data
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} category - File category (reports/prescriptions/scans)
     * @param {string} filename - Original filename
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} - { cid, size, timestamp }
     */
    async uploadFile(encryptedBuffer, patientAddress, category, filename, metadata = {}) {
        await this.initialize();

        if (!Buffer.isBuffer(encryptedBuffer)) {
            throw new Error('File data must be a Buffer');
        }

        if (!patientAddress || !category || !filename) {
            throw new Error('Patient address, category, and filename are required');
        }

        // Validate category
        const validCategories = ['reports', 'prescriptions', 'scans'];
        if (!validCategories.includes(category)) {
            throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }

        // Normalize patient address
        const normalizedAddress = patientAddress.toLowerCase().replace('0x', '');

        // Create readable stream from buffer
        const stream = Readable.from(encryptedBuffer);

        // Prepare options with folder structure metadata
        const options = {
            pinataMetadata: {
                name: filename,
                keyvalues: {
                    patient: normalizedAddress,
                    category: category,
                    originalFilename: filename,
                    uploadedAt: new Date().toISOString(),
                    encrypted: 'true',
                    ...metadata
                }
            },
            pinataOptions: {
                cidVersion: 1
            }
        };

        try {
            // Upload to Pinata
            const result = await this.pinata.pinFileToIPFS(stream, options);

            console.log(`📤 Uploaded file to IPFS: ${result.IpfsHash}`);

            return {
                cid: result.IpfsHash,
                size: encryptedBuffer.length,
                timestamp: result.Timestamp || new Date().toISOString(),
                pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
            };
        } catch (error) {
            console.error('IPFS upload failed:', error);
            throw new Error('Failed to upload file to IPFS: ' + error.message);
        }
    }

    /**
     * Retrieve file from IPFS
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<Buffer>} - File data
     */
    async retrieveFile(cid) {
        if (!cid) {
            throw new Error('CID is required');
        }

        try {
            // Fetch from Pinata gateway
            const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
            const fetch = (await import('node-fetch')).default;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log(`📥 Retrieved file from IPFS: ${cid} (${buffer.length} bytes)`);

            return buffer;
        } catch (error) {
            console.error('IPFS retrieval failed:', error);
            throw new Error('Failed to retrieve file from IPFS: ' + error.message);
        }
    }

    /**
     * Get file metadata from Pinata
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<Object>} - File metadata
     */
    async getFileMetadata(cid) {
        await this.initialize();

        try {
            const filters = {
                hashContains: cid
            };

            const result = await this.pinata.pinList(filters);

            if (result.count === 0) {
                throw new Error('File not found');
            }

            return result.rows[0];
        } catch (error) {
            throw new Error('Failed to get file metadata: ' + error.message);
        }
    }

    /**
     * Update file metadata in Pinata
     * Note: IPFS content and metadata are immutable. This is a placeholder.
     * In production, you'd use a separate database to store display names.
     * @param {string} cid - IPFS Content Identifier
     * @param {string} patientAddress - Patient's wallet address (for verification)
     * @param {Object} updates - Metadata updates (e.g., { filename: 'new-name.pdf' })
     * @returns {Promise<void>}
     */
    async updateFileMetadata(cid, patientAddress, updates = {}) {
        await this.initialize();

        try {
            // Get current metadata to verify ownership
            const current = await this.getFileMetadata(cid);

            // Verify patient owns this file
            const normalizedAddress = patientAddress.toLowerCase().replace('0x', '');
            if (current.metadata.keyvalues.patient !== normalizedAddress) {
                throw new Error('Unauthorized: You do not own this file');
            }

            // Note: Pinata's free tier doesn't support metadata updates
            // In production, store custom filenames in a separate database
            console.log(`📝 Filename update logged for: ${cid} -> ${updates.filename}`);
            console.log('Note: Actual IPFS metadata remains immutable');

            // Return success - in a production app, you'd update a database here
        } catch (error) {
            console.error('Update metadata error:', error);
            throw new Error('Failed to update file metadata: ' + (error.message || 'Unknown error'));
        }
    }

    /**
     * Rename file by re-uploading with new metadata and creating new CID
     */
    async renameFile(oldCid, newFilename, patientAddress) {
        await this.initialize();

        try {
            const oldMetadata = await this.getFileMetadata(oldCid);
            const normalizedAddress = patientAddress.toLowerCase().replace('0x', '');

            if (oldMetadata.metadata.keyvalues.patient !== normalizedAddress) {
                throw new Error('Unauthorized');
            }

            console.log(`📥 Downloading: ${oldCid}`);
            const fileBuffer = await this.retrieveFile(oldCid);

            console.log(`📤 Re-uploading as: ${newFilename}`);
            const stream = Readable.from(fileBuffer);
            const result = await this.pinata.pinFileToIPFS(stream, {
                pinataMetadata: {
                    name: newFilename,
                    keyvalues: {
                        ...oldMetadata.metadata.keyvalues,
                        originalFilename: newFilename,
                        uploadedAt: new Date().toISOString()
                    }
                },
                pinataOptions: { cidVersion: 1 }
            });

            console.log(`🗑️  Unpinning: ${oldCid}`);
            await this.unpinFile(oldCid);

            return { oldCid, newCid: result.IpfsHash, newFilename };
        } catch (error) {
            console.error('Rename error:', error);
            throw new Error('Rename failed: ' + (error.message || 'Unknown'));
        }
    }

    /**
     * List all files for a patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Array>} - List of files
     */
    async listPatientFiles(patientAddress) {
        await this.initialize();

        const normalizedAddress = patientAddress.toLowerCase().replace('0x', '');

        try {
            const filters = {
                metadata: {
                    keyvalues: {
                        patient: {
                            value: normalizedAddress,
                            op: 'eq'
                        }
                    }
                }
            };

            const result = await this.pinata.pinList(filters);

            return result.rows.map(row => ({
                cid: row.ipfs_pin_hash,
                filename: row.metadata.name,
                category: row.metadata.keyvalues.category,
                uploadedAt: row.metadata.keyvalues.uploadedAt,
                size: row.size
            }));
        } catch (error) {
            throw new Error('Failed to list patient files: ' + error.message);
        }
    }

    /**
     * Unpin file from Pinata (delete)
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<void>}
     */
    async unpinFile(cid) {
        await this.initialize();

        try {
            await this.pinata.unpin(cid);
            console.log(`🗑️  Unpinned file from IPFS: ${cid}`);
        } catch (error) {
            throw new Error('Failed to unpin file: ' + error.message);
        }
    }

    /**
     * Check if file is pinned
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<boolean>}
     */
    async isPinned(cid) {
        await this.initialize();

        try {
            const metadata = await this.getFileMetadata(cid);
            return metadata.ipfs_pin_hash === cid;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get total pinned storage size for a patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<number>} - Total size in bytes
     */
    async getPatientStorageSize(patientAddress) {
        const files = await this.listPatientFiles(patientAddress);
        return files.reduce((total, file) => total + (file.size || 0), 0);
    }
}

// Export singleton instance
module.exports = new IPFSService();
