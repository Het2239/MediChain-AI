const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain.service');
const fileHandlerService = require('../services/fileHandler.service');
const { requireAddress, requireDoctor } = require('../middleware/auth.middleware');

/**
 * Doctor Routes
 * Handle doctor access requests and patient record viewing
 */

// Get doctor status
router.get('/status', requireAddress, async (req, res) => {
    try {
        const { address } = req.user;
        const isVerified = await blockchainService.isDoctorVerified(address);

        let info = null;
        if (isVerified) {
            const doctorInfo = await blockchainService.getDoctorInfo(address);
            info = {
                licenseNumber: doctorInfo.licenseNumber,
                specialty: doctorInfo.specialty,
                verifiedAt: Number(doctorInfo.verifiedAt),
                verifiedAtDate: new Date(Number(doctorInfo.verifiedAt) * 1000).toISOString()
            };
        }

        res.json({
            address,
            isVerified,
            ...info
        });
    } catch (error) {
        res.status(500).json({
            error: 'Status Check Failed',
            message: error.message
        });
    }
});

// Request access to patient records
router.post('/request-access', requireAddress, requireDoctor, async (req, res) => {
    try {
        const { address } = req.user;
        const { patientAddress, reason } = req.body;

        if (!patientAddress || !reason) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Patient address and reason are required'
            });
        }

        // Check if patient exists
        const isPatient = await blockchainService.isPatient(patientAddress);
        if (!isPatient) {
            return res.status(404).json({
                error: 'Patient Not Found',
                message: 'The specified address is not registered as a patient'
            });
        }

        // Check if already has access
        const hasAccess = await blockchainService.hasAccess(patientAddress, address);
        if (hasAccess) {
            return res.status(400).json({
                error: 'Access Already Granted',
                message: 'You already have access to this patient\'s records'
            });
        }

        // Pass doctor address to blockchain service
        const txReceipt = await blockchainService.requestAccess(patientAddress, reason, address);

        res.json({
            success: true,
            message: 'Access request submitted successfully',
            txHash: txReceipt.hash
        });
    } catch (error) {
        res.status(500).json({
            error: 'Request Failed',
            message: error.message
        });
    }
});

// Get all access requests made by this doctor
router.get('/my-requests', requireAddress, requireDoctor, async (req, res) => {
    try {
        const { address } = req.user;
        console.log('Getting doctor requests for:', address);
        const requests = await blockchainService.getDoctorRequests(address);
        console.log('Got requests:', requests.length);

        const formattedRequests = requests.map(req => ({
            patient: req.patient,
            reason: req.reason,
            approved: req.approved,
            active: req.active,
            requestedAt: Number(req.requestedAt),
            respondedAt: Number(req.respondedAt),
            requestedAtDate: new Date(Number(req.requestedAt) * 1000).toISOString(),
            respondedAtDate: req.respondedAt > 0 ? new Date(Number(req.respondedAt) * 1000).toISOString() : null
        }));

        res.json({
            success: true,
            count: formattedRequests.length,
            requests: formattedRequests
        });
    } catch (error) {
        console.error('Failed to get doctor requests:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to Get Requests',
            message: error.message
        });
    }
});

// Get authorized patients
router.get('/authorized-patients', requireAddress, requireDoctor, async (req, res) => {
    try {
        const { address } = req.user;
        const allRequests = await blockchainService.getDoctorRequests(address);

        // Filter for approved and active requests
        const authorizedPatients = allRequests
            .filter(req => req.approved && req.active)
            .map(req => req.patient);

        res.json({
            success: true,
            count: authorizedPatients.length,
            patients: authorizedPatients
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Authorized Patients',
            message: error.message
        });
    }
});

// Get patient records (if authorized)
router.get('/patient/:patientAddress/records', requireAddress, requireDoctor, async (req, res) => {
    try {
        const { address } = req.user;
        const { patientAddress } = req.params;

        // Check access
        const hasAccess = await blockchainService.hasAccess(patientAddress, address);
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Access Denied',
                message: 'You do not have access to this patient\'s records'
            });
        }

        const records = await fileHandlerService.getPatientRecords(patientAddress);

        res.json({
            success: true,
            patient: patientAddress,
            count: records.length,
            records
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Get Records',
            message: error.message
        });
    }
});

// Check access to specific patient
router.get('/check-access/:patientAddress', requireAddress, requireDoctor, async (req, res) => {
    try {
        const { address } = req.user;
        const { patientAddress } = req.params;

        const hasAccess = await blockchainService.hasAccess(patientAddress, address);

        res.json({
            success: true,
            doctor: address,
            patient: patientAddress,
            hasAccess
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to Check Access',
            message: error.message
        });
    }
});

module.exports = router;
