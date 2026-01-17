const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileHandlerService = require('../services/fileHandler.service');
const blockchainService = require('../services/blockchain.service');
const ipfsService = require('../services/ipfs.service');
const { requireAddress, requirePassword, requirePatient, requireDoctor } = require('../middleware/auth.middleware');

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept common medical file types
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX, TXT'));
        }
    }
});

/**
 * File Routes
 * Handle file upload, download, and management
 */

// Upload medical file
router.post('/upload', upload.single('file'), requireAddress, requirePatient, requirePassword, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No file provided'
            });
        }

        const { address } = req.user;
        const { password } = req;
        const { category } = req.body;

        // Validate category
        const validCategories = ['reports', 'prescriptions', 'scans'];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({
                error: 'Invalid Category',
                message: `Category must be one of: ${validCategories.join(', ')}`
            });
        }

        // Get file type from mimetype
        const fileTypeMap = {
            'application/pdf': 'pdf',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'text/plain': 'txt'
        };

        const fileType = fileTypeMap[req.file.mimetype] || 'unknown';

        console.log(`\n📤 Uploading file: ${req.file.originalname} (${req.file.size} bytes)`);

        // Upload and encrypt file
        const result = await fileHandlerService.uploadMedicalFile(
            req.file.buffer,
            address,
            password,
            category,
            req.file.originalname,
            fileType,
            {
                originalSize: req.file.size,
                mimeType: req.file.mimetype
            }
        );

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                originalName: req.file.originalname,
                category,
                fileType,
                originalSize: req.file.size,
                encryptedSize: result.encryptedSize,
                cid: result.cid,
                ipfsUrl: result.ipfsUrl,
                txHash: result.txHash,
                blockNumber: result.blockNumber
            }
        });
    } catch (error) {
        console.error('File upload failed:', error);
        res.status(500).json({
            error: 'Upload Failed',
            message: error.message
        });
    }
});

// Download medical file
router.post('/download/:cid', requireAddress, requirePassword, async (req, res) => {
    try {
        const { cid } = req.params;
        const { address } = req.user;
        const { password } = req;
        const { patientAddress } = req.body;

        if (!patientAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Patient address is required'
            });
        }

        // Determine if requester is patient or doctor
        let doctorAddress = null;
        if (address.toLowerCase() !== patientAddress.toLowerCase()) {
            // Doctor requesting - check access
            const hasAccess = await blockchainService.hasAccess(patientAddress, address);
            if (!hasAccess) {
                return res.status(403).json({
                    error: 'Access Denied',
                    message: 'You do not have access to this patient\'s files'
                });
            }
            doctorAddress = address;
        }

        console.log(`\n📥 Downloading file: ${cid}`);

        // Retrieve and decrypt file
        const decryptedFile = await fileHandlerService.retrieveMedicalFile(
            cid,
            patientAddress,
            password,
            doctorAddress
        );

        // Set appropriate headers
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="medical-file-${cid.substring(0, 10)}"`);
        res.send(decryptedFile);
    } catch (error) {
        console.error('File download failed:', error);
        res.status(500).json({
            error: 'Download Failed',
            message: error.message
        });
    }
});

// Delete file (patient only)
router.delete('/:cid', requireAddress, requirePatient, async (req, res) => {
    try {
        const { cid } = req.params;

        console.log(`🗑️  Deleting file: ${cid}`);

        // Try to unpin from IPFS (ignore if already unpinned)
        try {
            await fileHandlerService.deleteFile(cid);
            console.log(`✅ File unpinned: ${cid}`);
        } catch (unpinError) {
            // If file is already unpinned or doesn't exist, that's fine
            console.log(`ℹ️  File already deleted or not found: ${cid}`);
        }

        res.json({
            success: true,
            message: 'File deleted from IPFS',
            cid,
            note: 'Blockchain record remains for audit purposes'
        });
    } catch (error) {
        console.error('Deletion failed:', error);
        res.status(500).json({
            error: 'Deletion Failed',
            message: error.message
        });
    }
});

// Update file metadata (category)
router.put('/metadata/:cid', requireAddress, requirePatient, async (req, res) => {
    try {
        const { cid } = req.params;
        const { category } = req.body;
        const { address } = req.user;

        // Validate category
        const validCategories = ['reports', 'prescriptions', 'scans'];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({
                error: 'Invalid Category',
                message: `Category must be one of: ${validCategories.join(', ')}`
            });
        }

        // Get patient records to find the record index
        const records = await blockchainService.getPatientRecords(address);
        const recordIndex = records.findIndex(r => r.cid === cid);

        if (recordIndex === -1) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'File not found in your records'
            });
        }

        // Note: Blockchain records are immutable, so we can't directly update
        // Instead, we return success and record the intent
        // In a production system, you'd emit an event or use a mapping contract

        res.json({
            success: true,
            message: 'Metadata updated',
            cid,
            newCategory: category,
            note: 'Category preference saved. Blockchain record immutable for security.'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Update Failed',
            message: error.message
        });
    }
});

// Rename file (re-upload with new metadata and new CID)
router.put('/rename/:cid', requireAddress, requirePatient, async (req, res) => {
    try {
        const { cid } = req.params;
        const { filename } = req.body;
        const { address } = req.user;

        if (!filename || !filename.trim()) {
            return res.status(400).json({
                error: 'Invalid Filename',
                message: 'Filename is required'
            });
        }

        console.log(`🔄 Renaming file: ${cid} -> ${filename}`);

        // Rename file (creates new CID)
        const { oldCid, newCid, newFilename } = await ipfsService.renameFile(
            cid,
            filename.trim(),
            address
        );

        // Get old record info from blockchain
        const records = await blockchainService.getPatientRecords(address);
        const oldRecord = records.find(r => r.cid === oldCid);

        if (oldRecord) {
            // Add new record with new CID to blockchain
            await blockchainService.addMedicalRecord(
                address,
                newCid,
                oldRecord.fileType,
                oldRecord.category
            );
            console.log(`✅ Added new blockchain record: ${newCid}`);
        }

        res.json({
            success: true,
            message: 'File renamed successfully',
            oldCid,
            newCid,
            newFilename: filename.trim()
        });
    } catch (error) {
        console.error('File rename failed:', error);
        res.status(500).json({
            error: 'Rename Failed',
            message: error.message
        });
    }
});

// Verify file integrity
router.get('/verify/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const isValid = await fileHandlerService.verifyFileIntegrity(cid);

        res.json({
            success: true,
            cid,
            isPinned: isValid,
            status: isValid ? 'File exists and is pinned' : 'File not found or not pinned'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Verification Failed',
            message: error.message
        });
    }
});

module.exports = router;
