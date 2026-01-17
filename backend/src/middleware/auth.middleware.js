const { ethers } = require('ethers');

/**
 * Authentication Middleware
 * Verifies wallet signatures and manages user sessions
 */

/**
 * Verify wallet signature
 * Expects header: Authorization: Bearer <signature>
 * Expects body: { message, address }
 */
async function verifyWalletSignature(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authorization token provided'
            });
        }

        const signature = authHeader.substring(7); // Remove 'Bearer '
        const { message, address } = req.body;

        if (!message || !address) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Message and address are required'
            });
        }

        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid signature'
            });
        }

        // Attach user info to request
        req.user = {
            address: address.toLowerCase(),
            signature
        };

        next();
    } catch (error) {
        console.error('Signature verification failed:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Signature verification failed'
        });
    }
}

/**
 * Simple authentication - just verify address is provided
 * For endpoints that don't need signature verification
 */
function requireAddress(req, res, next) {
    const address = req.headers['x-wallet-address'] || req.body.address || req.query.address;

    if (!address) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Wallet address required'
        });
    }

    req.user = {
        address: address.toLowerCase()
    };

    next();
}

/**
 * Require patient role
 * Must be called after verifyWalletSignature or requireAddress
 */
async function requirePatient(req, res, next) {
    try {
        if (!req.user || !req.user.address) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        const blockchainService = require('../services/blockchain.service');
        const isPatient = await blockchainService.isPatient(req.user.address);

        if (!isPatient) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Patient registration required'
            });
        }

        next();
    } catch (error) {
        console.error('Patient verification failed:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify patient status'
        });
    }
}

/**
 * Require verified doctor role
 * Must be called after verifyWalletSignature or requireAddress
 */
async function requireDoctor(req, res, next) {
    try {
        if (!req.user || !req.user.address) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        const blockchainService = require('../services/blockchain.service');
        const isVerified = await blockchainService.isDoctorVerified(req.user.address);

        if (!isVerified) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Doctor verification required'
            });
        }

        req.user.role = 'doctor';
        next();
    } catch (error) {
        console.error('Doctor verification failed:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify doctor status'
        });
    }
}

/**
 * Require admin role
 * Checks if address matches the contract owner
 */
async function requireAdmin(req, res, next) {
    try {
        if (!req.user || !req.user.address) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        // For simplicity, check against environment variable
        // In production, this should check the contract owner
        const adminAddress = process.env.ADMIN_ADDRESS?.toLowerCase();

        if (!adminAddress) {
            return res.status(500).json({
                error: 'Configuration Error',
                message: 'Admin address not configured'
            });
        }

        if (req.user.address !== adminAddress) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Admin privileges required'
            });
        }

        req.user.role = 'admin';
        next();
    } catch (error) {
        console.error('Admin verification failed:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify admin status'
        });
    }
}

/**
 * Validate password for encryption/decryption operations
 */
function requirePassword(req, res, next) {
    const password = req.body.password || req.headers['x-password'];

    if (!password) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Password required for this operation'
        });
    }

    req.password = password;
    next();
}

module.exports = {
    verifyWalletSignature,
    requireAddress,
    requirePatient,
    requireDoctor,
    requireAdmin,
    requirePassword
};
