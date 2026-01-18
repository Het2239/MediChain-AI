const crypto = require('crypto');

/**
 * Encryption Service
 * Provides AES-256-CBC encryption/decryption for medical files
 * Uses PBKDF2 for key derivation from patient credentials
 */

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = 'sha256';

/**
 * Generate encryption key from patient wallet address and password
 * @param {string} walletAddress - Patient's wallet address
 * @param {string} password - Patient's password
 * @returns {Buffer} - 32-byte encryption key
 */
function generateKey(walletAddress, password) {
    if (!walletAddress || !password) {
        throw new Error('Wallet address and password are required');
    }

    // Normalize wallet address (lowercase, remove 0x prefix)
    const normalizedAddress = walletAddress.toLowerCase().replace('0x', '');

    // Use wallet address as salt for deterministic key generation
    const salt = Buffer.from(normalizedAddress, 'hex');

    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(
        password,
        salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        PBKDF2_DIGEST
    );

    return key;
}

/**
 * Encrypt a file buffer
 * @param {Buffer} buffer - File data to encrypt
 * @param {Buffer} key - Encryption key (32 bytes)
 * @returns {Object} - { encryptedData: Buffer, iv: Buffer }
 */
function encryptFile(buffer, key) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Data to encrypt must be a Buffer');
    }

    if (!Buffer.isBuffer(key) || key.length !== KEY_LENGTH) {
        throw new Error('Key must be a 32-byte Buffer');
    }

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt data
    const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
    ]);

    return {
        encryptedData: encrypted,
        iv: iv
    };
}

/**
 * Decrypt a file buffer
 * @param {Buffer} encryptedData - Encrypted file data
 * @param {Buffer} key - Decryption key (32 bytes)
 * @param {Buffer} iv - Initialization vector (16 bytes)
 * @returns {Buffer} - Decrypted file data
 */
function decryptFile(encryptedData, key, iv) {
    if (!Buffer.isBuffer(encryptedData)) {
        throw new Error('Encrypted data must be a Buffer');
    }

    if (!Buffer.isBuffer(key) || key.length !== KEY_LENGTH) {
        throw new Error('Key must be a 32-byte Buffer');
    }

    if (!Buffer.isBuffer(iv) || iv.length !== IV_LENGTH) {
        throw new Error('IV must be a 16-byte Buffer');
    }

    try {
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        // Decrypt data
        const decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

/**
 * Encrypt file with password (convenience function)
 * @param {Buffer} buffer - File data to encrypt
 * @param {string} walletAddress - Patient's wallet address
 * @param {string} password - Patient's password
 * @returns {Object} - { encryptedData: Buffer, iv: Buffer }
 */
function encryptWithPassword(buffer, walletAddress, password) {
    const key = generateKey(walletAddress, password);
    return encryptFile(buffer, key);
}

/**
 * Decrypt file with password (convenience function)
 * @param {Buffer} encryptedData - Encrypted file data
 * @param {string} walletAddress - Patient's wallet address
 * @param {string} password - Patient's password
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} - Decrypted file data
 */
function decryptWithPassword(encryptedData, walletAddress, password, iv) {
    const key = generateKey(walletAddress, password);
    return decryptFile(encryptedData, key, iv);
}

/**
 * Combine encrypted data and IV into a single buffer for storage
 * Format: [IV (16 bytes)][Encrypted Data (variable length)]
 * @param {Buffer} encryptedData - Encrypted file data
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} - Combined buffer
 */
function combineEncryptedData(encryptedData, iv) {
    return Buffer.concat([iv, encryptedData]);
}

/**
 * Split combined buffer into IV and encrypted data
 * @param {Buffer} combinedBuffer - Combined buffer with IV and encrypted data
 * @returns {Object} - { iv: Buffer, encryptedData: Buffer }
 */
function splitEncryptedData(combinedBuffer) {
    if (!Buffer.isBuffer(combinedBuffer) || combinedBuffer.length < IV_LENGTH) {
        throw new Error('Invalid combined buffer');
    }

    const iv = combinedBuffer.slice(0, IV_LENGTH);
    const encryptedData = combinedBuffer.slice(IV_LENGTH);

    return { iv, encryptedData };
}

/**
 * Encrypt file with wallet address only (no user password required)
 * Uses a fixed internal password for key derivation
 * @param {Buffer} buffer - File data to encrypt
 * @param {string} walletAddress - Patient's wallet address
 * @returns {Object} - { encryptedData: Buffer, iv: Buffer }
 */
function encryptWithWallet(buffer, walletAddress) {
    // Use fixed internal password for encryption
    const FIXED_PASSWORD = 'medichain-encryption-key-v1';
    return encryptWithPassword(buffer, walletAddress, FIXED_PASSWORD);
}

/**
 * Decrypt file with wallet address only (no user password required)
 * Uses a fixed internal password for key derivation
 * @param {Buffer} encryptedData - Encrypted file data
 * @param {string} walletAddress - Patient's wallet address
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} - Decrypted file data
 */
function decryptWithWallet(encryptedData, walletAddress, iv) {
    // Use fixed internal password for decryption
    const FIXED_PASSWORD = 'medichain-encryption-key-v1';
    return decryptWithPassword(encryptedData, walletAddress, FIXED_PASSWORD, iv);
}

/**
 * Hash password for storage (not used for encryption)
 * @param {string} password - Password to hash
 * @returns {string} - Hashed password
 */
function hashPassword(password) {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
}

module.exports = {
    generateKey,
    encryptFile,
    decryptFile,
    encryptWithPassword,
    decryptWithPassword,
    encryptWithWallet,
    decryptWithWallet,
    combineEncryptedData,
    splitEncryptedData,
    hashPassword,
    // Constants for testing
    KEY_LENGTH,
    IV_LENGTH
};
