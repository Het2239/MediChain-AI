const express = require('express');
const router = express.Router();
const AIService = require('../services/ai.service');
const aiService = new AIService(); // Create instance here
const fileHandlerService = require('../services/fileHandler.service');
const blockchainService = require('../services/blockchain.service');
const { requireAddress, requirePatient, requireDoctor } = require('../middleware/auth.middleware');

/**
 * Insights Routes
 * Generate and retrieve AI-powered medical insights
 */

/**
 * Generate medical insights for a patient
 * POST /api/insights/generate
 * Body: { patientAddress, files, userRole: 'patient' | 'doctor' }
 */
router.post('/generate', requireAddress, async (req, res) => {
    try {
        const { address } = req.user;
        const { patientAddress, files, userRole = 'patient' } = req.body; // NEW: userRole parameter

        if (!patientAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Patient address is required'
            });
        }

        if (!files || !Array.isArray(files)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Files array is required'
            });
        }

        // Verify access permissions
        const normalizedPatient = patientAddress.toLowerCase();
        const normalizedUser = address.toLowerCase();

        const isPatient = normalizedPatient === normalizedUser;

        if (!isPatient) {
            // Doctor requesting - check if they have access
            const hasAccess = await blockchainService.hasAccess(patientAddress, address);
            if (!hasAccess) {
                return res.status(403).json({
                    error: 'Access Denied',
                    message: 'You do not have permission to view this patient\'s insights'
                });
            }
        }

        console.log(`\n🔍 Generating ${userRole} insights for ${patientAddress}`);
        console.log(`📊 Processing ${files.length} files...`);

        // Generate appropriate dashboard based on user role
        let insights;
        if (userRole === 'doctor') {
            insights = await aiService.generateDoctorDashboard(patientAddress, files);
        } else {
            insights = await aiService.generatePatientDashboard(patientAddress, files);
        }

        res.json({
            success: true,
            ...insights
        });

    } catch (error) {
        console.error('Insights generation failed:', error);
        res.status(500).json({
            error: 'Generation Failed',
            message: error.message
        });
    }
});

/**
 * Get cached insights for a patient
 * GET /api/insights/:patientAddress
 */
router.get('/:patientAddress', requireAddress, async (req, res) => {
    try {
        const { address } = req.user;
        const { patientAddress } = req.params;

        // Verify access permissions
        const normalizedPatient = patientAddress.toLowerCase();
        const normalizedUser = address.toLowerCase();

        if (normalizedPatient !== normalizedUser) {
            // Doctor requesting - check if they have access
            const hasAccess = await blockchainService.hasAccess(patientAddress, address);
            if (!hasAccess) {
                return res.status(403).json({
                    error: 'Access Denied',
                    message: 'You do not have permission to view this patient\'s insights'
                });
            }
        }

        // Get cached insights
        const cached = aiService.getCachedInsights(patientAddress);

        if (!cached) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'No cached insights found. Please generate new insights.'
            });
        }

        res.json({
            success: true,
            ...cached.insights,
            cached: true,
            cachedAt: new Date(cached.cachedAt).toISOString()
        });

    } catch (error) {
        console.error('Insights retrieval failed:', error);
        res.status(500).json({
            error: 'Retrieval Failed',
            message: error.message
        });
    }
});

/**
 * Clear cached insights for a patient
 * DELETE /api/insights/:patientAddress
 */
router.delete('/:patientAddress', requireAddress, requirePatient, async (req, res) => {
    try {
        const { address } = req.user;
        const { patientAddress } = req.params;

        // Only patient can clear their own cache
        if (address.toLowerCase() !== patientAddress.toLowerCase()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only clear your own insights cache'
            });
        }

        aiService.clearCache(patientAddress);

        res.json({
            success: true,
            message: 'Insights cache cleared'
        });

    } catch (error) {
        console.error('Cache clear failed:', error);
        res.status(500).json({
            error: 'Operation Failed',
            message: error.message
        });
    }
});

/**
 * Extract text from a file (helper endpoint for testing)
 * POST /api/insights/extract-text
 * Body: { fileBuffer (base64), fileType, mimeType }
 */
router.post('/extract-text', requireAddress, async (req, res) => {
    try {
        const { fileBuffer, fileType, mimeType } = req.body;

        if (!fileBuffer || !fileType) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'fileBuffer and fileType are required'
            });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(fileBuffer, 'base64');

        // Extract text
        const text = await aiService.extractTextFromFile(buffer, fileType, mimeType);

        res.json({
            success: true,
            text,
            extractedLength: text ? text.length : 0
        });

    } catch (error) {
        console.error('Text extraction failed:', error);
        res.status(500).json({
            error: 'Extraction Failed',
            message: error.message
        });
    }
});

module.exports = router;
