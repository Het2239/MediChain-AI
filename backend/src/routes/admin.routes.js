const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain.service');
const { requireAddress, requireAdmin } = require('../middleware/auth.middleware');

/**
 * Admin Routes
 * Handle doctor verification and system management
 */

// Verify a doctor
router.post('/verify-doctor', requireAddress, async (req, res) => {
    try {
        const { doctorAddress, licenseNumber, specialty } = req.body;

        if (!doctorAddress || !licenseNumber) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Doctor address and license number are required'
            });
        }

        // Check if already verified
        const isVerified = await blockchainService.isDoctorVerified(doctorAddress);
        if (isVerified) {
            return res.status(400).json({
                error: 'Already Verified',
                message: 'This doctor is already verified'
            });
        }

        const txReceipt = await blockchainService.verifyDoctor(
            doctorAddress,
            licenseNumber,
            specialty || ''
        );

        res.json({
            success: true,
            message: 'Doctor verified successfully',
            doctorAddress,
            txHash: txReceipt.hash
        });
    } catch (error) {
        res.status(500).json({
            error: 'Verification Failed',
            message: error.message
        });
    }
});

// Revoke doctor verification
router.post('/revoke-doctor', requireAddress, async (req, res) => {
    try {
        const { doctorAddress } = req.body;

        if (!doctorAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Doctor address is required'
            });
        }

        const txReceipt = await blockchainService.revokeDoctor(doctorAddress);

        res.json({
            success: true,
            message: 'Doctor verification revoked',
            doctorAddress,
            txHash: txReceipt.hash
        });
    } catch (error) {
        res.status(500).json({
            error: 'Revocation Failed',
            message: error.message
        });
    }
});

// Get all verified doctors
router.get('/doctors/verified', requireAddress, async (req, res) => {
    try {
        const verifiedDoctors = await blockchainService.getVerifiedDoctors();

        // Get detailed info for each doctor
        const doctorDetails = await Promise.all(
            verifiedDoctors.map(async (address) => {
                const info = await blockchainService.getDoctorInfo(address);
                return {
                    address,
                    licenseNumber: info.licenseNumber,
                    specialty: info.specialty,
                    verifiedAt: Number(info.verifiedAt),
                    verifiedAtDate: new Date(Number(info.verifiedAt) * 1000).toISOString()
                };
            })
        );

        res.json({
            success: true,
            count: doctorDetails.length,
            doctors: doctorDetails
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Doctors',
            message: error.message
        });
    }
});

// Get system statistics
router.get('/stats', requireAddress, async (req, res) => {
    try {
        const [totalPatients, totalVerifiedDoctors] = await Promise.all([
            blockchainService.contracts.patientRegistry.totalPatients(),
            blockchainService.contracts.doctorRegistry.totalVerifiedDoctors()
        ]);

        const [totalRecords, totalRequests, totalApprovals, totalRevocations] = await Promise.all([
            blockchainService.contracts.patientRegistry.totalRecords(),
            blockchainService.contracts.accessControl.totalRequests(),
            blockchainService.contracts.accessControl.totalApprovals(),
            blockchainService.contracts.accessControl.totalRevocations()
        ]);

        res.json({
            success: true,
            stats: {
                patients: {
                    total: Number(totalPatients),
                    totalRecords: Number(totalRecords)
                },
                doctors: {
                    totalVerified: Number(totalVerifiedDoctors)
                },
                accessControl: {
                    totalRequests: Number(totalRequests),
                    totalApprovals: Number(totalApprovals),
                    totalRevocations: Number(totalRevocations)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Statistics',
            message: error.message
        });
    }
});

// Get all patients
router.get('/patients', requireAddress, async (req, res) => {
    try {
        const contract = blockchainService.contracts.patientRegistry;
        const totalPatients = await contract.totalPatients();
        const patientList = [];

        // Get all patients (limited to reasonable number for demo)
        const limit = Math.min(Number(totalPatients), 100);

        for (let i = 0; i < limit; i++) {
            try {
                const patientAddress = await contract.patients(i);
                const records = await contract.getRecords(patientAddress);

                patientList.push({
                    address: patientAddress,
                    recordCount: records.length,
                    registeredAt: Date.now() - (i * 86400000) // Mock timestamp
                });
            } catch (err) {
                console.error(`Error fetching patient ${i}:`, err);
            }
        }

        res.json({
            success: true,
            totalPatients: Number(totalPatients),
            patients: patientList
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Patients',
            message: error.message
        });
    }
});

// Get analytics data
router.get('/analytics', requireAddress, async (req, res) => {
    try {
        const [totalPatients, totalVerifiedDoctors] = await Promise.all([
            blockchainService.contracts.patientRegistry.totalPatients(),
            blockchainService.contracts.doctorRegistry.totalVerifiedDoctors()
        ]);

        const [totalRecords, totalRequests, totalApprovals] = await Promise.all([
            blockchainService.contracts.patientRegistry.totalRecords(),
            blockchainService.contracts.accessControl.totalRequests(),
            blockchainService.contracts.accessControl.totalApprovals()
        ]);

        // Generate mock time-series data for charts
        const now = Date.now();
        const dayMs = 86400000;

        const patientGrowth = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(now - (29 - i) * dayMs).toISOString().split('T')[0],
            patients: Math.floor(Math.random() * Number(totalPatients) / 5) + i
        }));

        const uploadTrends = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(now - (29 - i) * dayMs).toISOString().split('T')[0],
            uploads: Math.floor(Math.random() * 10) + 1
        }));

        const accessStats = [
            { name: 'Approved', value: Number(totalApprovals) },
            { name: 'Pending', value: Number(totalRequests) - Number(totalApprovals) },
            { name: 'Total', value: Number(totalRequests) }
        ];

        res.json({
            success: true,
            analytics: {
                summary: {
                    totalPatients: Number(totalPatients),
                    totalDoctors: Number(totalVerifiedDoctors),
                    totalRecords: Number(totalRecords),
                    totalRequests: Number(totalRequests)
                },
                patientGrowth,
                uploadTrends,
                accessStats
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Analytics',
            message: error.message
        });
    }
});

// Get system-wide audit logs
router.get('/audit-logs', requireAddress, async (req, res) => {
    try {
        // Get all patients and aggregate their audit logs
        const contract = blockchainService.contracts.patientRegistry;
        const totalPatients = await contract.totalPatients();
        const allLogs = [];

        const limit = Math.min(Number(totalPatients), 20); // Limit for performance

        for (let i = 0; i < limit; i++) {
            try {
                const patientAddress = await contract.patients(i);
                const logs = await blockchainService.getAuditLog(patientAddress);

                logs.forEach(log => {
                    allLogs.push({
                        patient: patientAddress,
                        doctor: log.doctor,
                        action: log.actionType,
                        timestamp: Number(log.timestamp),
                        timestampDate: new Date(Number(log.timestamp) * 1000).toISOString()
                    });
                });
            } catch (err) {
                console.error(`Error fetching logs for patient ${i}:`, err);
            }
        }

        // Sort by timestamp descending
        allLogs.sort((a, b) => b.timestamp - a.timestamp);

        res.json({
            success: true,
            totalLogs: allLogs.length,
            logs: allLogs.slice(0, 100) // Return most recent 100
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Audit Logs',
            message: error.message
        });
    }
});

// Get doctor activity
router.get('/doctor-activity', requireAddress, async (req, res) => {
    try {
        const verifiedDoctors = await blockchainService.getVerifiedDoctors();
        const doctorActivity = [];

        for (const doctorAddress of verifiedDoctors) {
            try {
                const info = await blockchainService.getDoctorInfo(doctorAddress);

                // Count patients with access (simplified)
                const contract = blockchainService.contracts.patientRegistry;
                const totalPatients = await contract.totalPatients();
                let accessCount = 0;

                // Sample first 20 patients for performance
                const sampleSize = Math.min(Number(totalPatients), 20);
                for (let i = 0; i < sampleSize; i++) {
                    try {
                        const patientAddr = await contract.patients(i);
                        const hasAccess = await blockchainService.hasAccess(patientAddr, doctorAddress);
                        if (hasAccess) accessCount++;
                    } catch (err) {
                        // Skip errors
                    }
                }

                doctorActivity.push({
                    address: doctorAddress,
                    licenseNumber: info.licenseNumber,
                    specialty: info.specialty,
                    patientsWithAccess: accessCount,
                    verifiedAt: Number(info.verifiedAt),
                    lastActive: Number(info.verifiedAt) // Mock data
                });
            } catch (err) {
                console.error(`Error fetching activity for doctor ${doctorAddress}:`, err);
            }
        }

        // Sort by patients with access
        doctorActivity.sort((a, b) => b.patientsWithAccess - a.patientsWithAccess);

        res.json({
            success: true,
            doctorCount: doctorActivity.length,
            activity: doctorActivity
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Doctor Activity',
            message: error.message
        });
    }
});

module.exports = router;
