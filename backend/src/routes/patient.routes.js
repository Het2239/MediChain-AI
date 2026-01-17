const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain.service');
const fileHandlerService = require('../services/fileHandler.service');
const { requireAddress, requirePatient, requirePassword } = require('../middleware/auth.middleware');

/**
 * Patient Routes
 * Handle patient registration, record management, and access control
 */

// Register as a patient
router.post('/register', requireAddress, async (req, res) => {
    try {
        const { address } = req.user;

        // Check if already registered
        const isRegistered = await blockchainService.isPatient(address);
        if (isRegistered) {
            return res.status(400).json({
                error: 'Already Registered',
                message: 'This address is already registered as a patient'
            });
        }

        // Register on blockchain
        const txReceipt = await blockchainService.registerPatient(address);

        res.json({
            success: true,
            message: 'Patient registered successfully',
            txHash: txReceipt.hash,
            blockNumber: txReceipt.blockNumber
        });
    } catch (error) {
        console.error('Patient registration failed:', error);

        // Check if error is because patient is already registered
        if (error.reason && error.reason.includes('already registered')) {
            return res.status(400).json({
                error: 'Already Registered',
                message: 'This address is already registered as a patient'
            });
        }

        res.status(500).json({
            error: 'Registration Failed',
            message: error.message
        });
    }
});

// Get patient status
router.get('/status', requireAddress, async (req, res) => {
    try {
        const { address } = req.user;
        const isPatient = await blockchainService.isPatient(address);

        res.json({
            address,
            isRegistered: isPatient
        });
    } catch (error) {
        res.status(500).json({
            error: 'Status Check Failed',
            message: error.message
        });
    }
});

// Get all medical records
router.get('/records', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const records = await fileHandlerService.getPatientRecords(address);

        // Enrich with IPFS metadata (filename)
        const enrichedRecords = await Promise.all(records.map(async (record) => {
            try {
                const ipfsService = require('../services/ipfs.service');
                const metadata = await ipfsService.getFileMetadata(record.cid);
                return {
                    ...record,
                    metadata: {
                        filename: metadata.metadata?.keyvalues?.originalFilename || metadata.metadata?.name || 'Untitled'
                    }
                };
            } catch (error) {
                // If metadata fetch fails, return record without it
                return record;
            }
        }));

        res.json({
            success: true,
            count: enrichedRecords.length,
            records: enrichedRecords
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get records',
            message: error.message
        });
    }
});

// Get records by category
router.get('/records/category/:category', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const { category } = req.params;

        // Validate category
        const validCategories = ['reports', 'prescriptions', 'scans'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: 'Invalid Category',
                message: `Category must be one of: ${validCategories.join(', ')}`
            });
        }

        const records = await fileHandlerService.getRecordsByCategory(address, category);

        res.json({
            success: true,
            category,
            count: records.length,
            records
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Retrieve Records',
            message: error.message
        });
    }
});

// Get storage statistics
router.get('/storage-stats', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const stats = await fileHandlerService.getStorageStats(address);

        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Storage Stats',
            message: error.message
        });
    }
});

// Get pending access requests
router.get('/access-requests/pending', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const pendingRequests = await blockchainService.getPendingRequests(address);

        // Format requests
        const formattedRequests = pendingRequests.map(req => ({
            doctor: req.doctor,
            patient: req.patient,
            reason: req.reason,
            requestedAt: Number(req.requestedAt),
            requestedAtDate: new Date(Number(req.requestedAt) * 1000).toISOString()
        }));

        res.json({
            success: true,
            count: formattedRequests.length,
            requests: formattedRequests
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Pending Requests',
            message: error.message
        });
    }
});

// Get authorized doctors
router.get('/authorized-doctors', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const doctors = await blockchainService.getAuthorizedDoctors(address);

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Authorized Doctors',
            message: error.message
        });
    }
});

// Approve doctor access
router.post('/approve-access', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const { doctorAddress } = req.body;

        if (!doctorAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Doctor address is required'
            });
        }

        const txReceipt = await blockchainService.approveAccess(doctorAddress);

        res.json({
            success: true,
            message: 'Access approved successfully',
            txHash: txReceipt.hash
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Approve Access',
            message: error.message
        });
    }
});

// Revoke doctor access
router.post('/revoke-access', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const { doctorAddress } = req.body;

        if (!doctorAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Doctor address is required'
            });
        }

        const txReceipt = await blockchainService.revokeAccess(doctorAddress);

        res.json({
            success: true,
            message: 'Access revoked successfully',
            txHash: txReceipt.hash
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Revoke Access',
            message: error.message
        });
    }
});

// Get audit log
router.get('/audit-log', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const auditLog = await blockchainService.getAuditLog(address);

        // Format audit entries
        const formattedLog = auditLog.map(entry => ({
            doctor: entry.doctor,
            patient: entry.patient,
            action: entry.action,
            timestamp: Number(entry.timestamp),
            timestampDate: new Date(Number(entry.timestamp) * 1000).toISOString()
        }));

        res.json({
            success: true,
            count: formattedLog.length,
            auditLog: formattedLog
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Audit Log',
            message: error.message
        });
    }
});

module.exports = router;
