const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

/**
 * Blockchain Service
 * Handles interactions with deployed smart contracts
 */

class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {
            patientRegistry: null,
            doctorRegistry: null,
            accessControl: null
        };
        this.initialized = false;
    }

    /**
     * Initialize blockchain connection and contracts
     */
    async initialize() {
        if (this.initialized) return;

        // Get configuration from environment
        this.rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.POLYGON_MUMBAI_RPC_URL;
        const privateKey = process.env.PRIVATE_KEY;

        if (!this.rpcUrl) {
            throw new Error('RPC URL not configured');
        }

        // Create provider and signer
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

        if (privateKey) {
            this.signer = new ethers.Wallet(privateKey, this.provider);
        }

        // Load contract addresses
        const patientRegistryAddress = process.env.PATIENT_REGISTRY_ADDRESS;
        const doctorRegistryAddress = process.env.DOCTOR_REGISTRY_ADDRESS;
        const accessControlAddress = process.env.ACCESS_CONTROL_ADDRESS;

        if (!patientRegistryAddress || !doctorRegistryAddress || !accessControlAddress) {
            console.warn('⚠️  Contract addresses not configured. Please deploy contracts first.');
            return;
        }

        // Load contract ABIs
        const contractsPath = path.join(__dirname, '../../../contracts/artifacts/contracts');

        const patientRegistryABI = JSON.parse(
            fs.readFileSync(path.join(contractsPath, 'PatientRegistry.sol/PatientRegistry.json'), 'utf8')
        ).abi;

        const doctorRegistryABI = JSON.parse(
            fs.readFileSync(path.join(contractsPath, 'DoctorRegistry.sol/DoctorRegistry.json'), 'utf8')
        ).abi;

        const accessControlABI = JSON.parse(
            fs.readFileSync(path.join(contractsPath, 'AccessControl.sol/AccessControl.json'), 'utf8')
        ).abi;

        // Initialize contract instances
        this.contracts.patientRegistry = new ethers.Contract(
            patientRegistryAddress,
            patientRegistryABI,
            this.signer || this.provider
        );

        this.contracts.doctorRegistry = new ethers.Contract(
            doctorRegistryAddress,
            doctorRegistryABI,
            this.signer || this.provider
        );

        this.contracts.accessControl = new ethers.Contract(
            accessControlAddress,
            accessControlABI,
            this.signer || this.provider
        );

        this.initialized = true;
        console.log('✅ Blockchain service initialized');
    }

    // ========== Patient Registry Methods ==========

    /**
     * Register a patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Object>} - Transaction receipt
     */
    async registerPatient(patientAddress) {
        await this.initialize();
        const contract = this.contracts.patientRegistry;

        const tx = await contract.registerPatient();
        return await tx.wait();
    }

    /**
     * Add medical record
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} cid - IPFS CID
     * @param {string} fileType - File type (pdf, docx, etc.)
     * @param {string} category - Category (reports, prescriptions, scans)
     * @returns {Promise<Object>} - Transaction receipt
     */
    async addMedicalRecord(patientAddress, cid, fileType, category) {
        await this.initialize();
        const contract = this.contracts.patientRegistry;

        const tx = await contract.addRecord(patientAddress, cid, fileType, category);
        return await tx.wait();
    }

    /**
     * Get all medical records for a patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Array>} - Array of medical records
     */
    async getPatientRecords(patientAddress) {
        await this.initialize();
        const contract = this.contracts.patientRegistry;

        return await contract.getRecords(patientAddress);
    }

    /**
     * Get records by category
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} category - Category to filter by
     * @returns {Promise<Array>} - Array of medical records
     */
    async getRecordsByCategory(patientAddress, category) {
        await this.initialize();
        const contract = this.contracts.patientRegistry;

        return await contract.getRecordsByCategory(patientAddress, category);
    }

    /**
     * Check if address is registered patient
     * @param {string} address - Wallet address to check
     * @returns {Promise<boolean>}
     */
    async isPatient(address) {
        await this.initialize();
        const contract = this.contracts.patientRegistry;

        return await contract.isPatient(address);
    }

    // ========== Doctor Registry Methods ==========

    /**
     * Verify a doctor (admin only)
     * @param {string} doctorAddress - Doctor's wallet address
     * @param {string} licenseNumber - Medical license number
     * @param {string} specialty - Doctor's specialty
     * @returns {Promise<Object>} - Transaction receipt
     */
    async verifyDoctor(doctorAddress, licenseNumber, specialty) {
        await this.initialize();
        const contract = this.contracts.doctorRegistry;

        const tx = await contract.verifyDoctor(doctorAddress, licenseNumber, specialty);
        return await tx.wait();
    }

    /**
     * Check if doctor is verified
     * @param {string} doctorAddress - Doctor's wallet address
     * @returns {Promise<boolean>}
     */
    async isDoctorVerified(doctorAddress) {
        await this.initialize();
        const contract = this.contracts.doctorRegistry;

        return await contract.isVerified(doctorAddress);
    }

    /**
     * Get doctor information
     * @param {string} doctorAddress - Doctor's wallet address
     * @returns {Promise<Object>} - Doctor info
     */
    async getDoctorInfo(doctorAddress) {
        await this.initialize();
        const contract = this.contracts.doctorRegistry;

        return await contract.getDoctorInfo(doctorAddress);
    }

    /**
     * Get all verified doctors
     * @returns {Promise<Array>} - Array of verified doctor addresses
     */
    async getVerifiedDoctors() {
        await this.initialize();
        const contract = this.contracts.doctorRegistry;

        return await contract.getVerifiedDoctors();
    }

    // ========== Access Control Methods ==========

    /**
     * Request access to patient records
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} reason - Reason for access request
     * @param {string} doctorAddress - Doctor's wallet address (for impersonation on local chains)
     * @returns {Promise<Object>} - Transaction receipt
     */
    async requestAccess(patientAddress, reason, doctorAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        // On local Hardhat, impersonate the doctor address
        const isLocalNetwork = this.rpcUrl && (this.rpcUrl.includes('127.0.0.1') || this.rpcUrl.includes('localhost'));
        if (isLocalNetwork) {
            // For local Hardhat network, use impersonation
            await this.provider.send("hardhat_impersonateAccount", [doctorAddress]);
            const doctorSigner = await this.provider.getSigner(doctorAddress);
            const contractAsDoctor = contract.connect(doctorSigner);
            const tx = await contractAsDoctor.requestAccess(patientAddress, reason);
            const receipt = await tx.wait();
            await this.provider.send("hardhat_stopImpersonatingAccount", [doctorAddress]);
            return receipt;
        }

        // For testnets/mainnet, still use the regular signer (this should be changed to use user's wallet signature)
        const tx = await contract.requestAccess(patientAddress, reason);
        return await tx.wait();
    }

    /**
     * Approve access request
     * @param {string} doctorAddress - Doctor's wallet address
     * @returns {Promise<Object>} - Transaction receipt
     */
    async approveAccess(doctorAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        const tx = await contract.approveAccess(doctorAddress);
        return await tx.wait();
    }

    /**
     * Revoke access
     * @param {string} doctorAddress - Doctor's wallet address
     * @returns {Promise<Object>} - Transaction receipt
     */
    async revokeAccess(doctorAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        const tx = await contract.revokeAccess(doctorAddress);
        return await tx.wait();
    }

    /**
     * Check if doctor has access to patient
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} doctorAddress - Doctor's wallet address
     * @returns {Promise<boolean>}
     */
    async hasAccess(patientAddress, doctorAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        return await contract.checkAccess(patientAddress, doctorAddress);
    }

    /**
     * Get all access requests made by a doctor
     * @param {string} doctorAddress - Doctor's wallet address
     * @returns {Promise<Array>} - Array of access requests
     */
    async getDoctorRequests(doctorAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        return await contract.getDoctorRequests(doctorAddress);
    }

    /**
     * Get pending access requests for patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Array>} - Array of pending requests
     */
    async getPendingRequests(patientAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        return await contract.getPendingRequests(patientAddress);
    }

    /**
     * Get authorized doctors for patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Array>} - Array of authorized doctor addresses
     */
    async getAuthorizedDoctors(patientAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        return await contract.getAuthorizedDoctors(patientAddress);
    }

    /**
     * Get audit log for patient
     * @param {string} patientAddress - Patient's wallet address
     * @returns {Promise<Array>} - Array of audit entries
     */
    async getAuditLog(patientAddress) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        return await contract.getAuditLog(patientAddress);
    }

    /**
     * Log when doctor accesses patient records
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} doctorAddress - Doctor's wallet address (for impersonation on local Hardhat)
     * @returns {Promise<Object>} - Transaction receipt
     */
    async logAccess(patientAddress, doctorAddress = null) {
        await this.initialize();
        const contract = this.contracts.accessControl;

        // On local Hardhat, impersonate the doctor if provided
        const isLocalNetwork = this.rpcUrl && (this.rpcUrl.includes('127.0.0.1') || this.rpcUrl.includes('localhost'));
        if (isLocalNetwork && doctorAddress) {
            await this.provider.send("hardhat_impersonateAccount", [doctorAddress]);
            const doctorSigner = await this.provider.getSigner(doctorAddress);
            const contractAsDoctor = contract.connect(doctorSigner);
            const tx = await contractAsDoctor.logAccess(patientAddress);
            const receipt = await tx.wait();
            await this.provider.send("hardhat_stopImpersonatingAccount", [doctorAddress]);
            return receipt;
        }

        // For testnets/mainnet, use regular signer
        const tx = await contract.logAccess(patientAddress);
        return await tx.wait();
    }

    // ========== Utility Methods ==========

    /**
     * Get current block number
     * @returns {Promise<number>}
     */
    async getBlockNumber() {
        await this.initialize();
        return await this.provider.getBlockNumber();
    }

    /**
     * Get gas price
     * @returns {Promise<bigint>}
     */
    async getGasPrice() {
        await this.initialize();
        return await this.provider.getFeeData().then(data => data.gasPrice);
    }

    /**
     * Verify wallet signature
     * @param {string} message - Message that was signed
     * @param {string} signature - Signature to verify
     * @returns {string} - Recovered address
     */
    verifySignature(message, signature) {
        return ethers.verifyMessage(message, signature);
    }
}

// Export singleton instance
module.exports = new BlockchainService();
