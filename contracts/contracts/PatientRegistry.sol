// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PatientRegistry
 * @dev Manages patient registration and medical record storage on blockchain
 * @notice Medical records are stored as IPFS CIDs with metadata, actual files are encrypted off-chain
 */
contract PatientRegistry is Ownable {
    constructor() Ownable(msg.sender) {}

    // Struct to store medical record metadata
    struct MedicalRecord {
        string cid;           // IPFS Content Identifier
        string fileType;      // e.g., "pdf", "docx", "jpg"
        string category;      // e.g., "reports", "prescriptions", "scans"
        uint256 timestamp;    // When the record was added
        address uploader;     // Who uploaded the record (patient or authorized doctor)
    }

    // Mapping from patient address to their registration status
    mapping(address => bool) public isPatient;
    
    // Mapping from patient address to array of their medical records
    mapping(address => MedicalRecord[]) private patientRecords;
    
    // Total number of registered patients
    uint256 public totalPatients;
    
    // Total number of medical records across all patients
    uint256 public totalRecords;

    // Events
    event PatientRegistered(address indexed patient, uint256 timestamp);
    event RecordAdded(
        address indexed patient,
        string cid,
        string fileType,
        string category,
        address uploader,
        uint256 timestamp
    );

    /**
     * @dev Register a new patient
     * @notice Can only be called once per address
     */
    function registerPatient() external {
        require(!isPatient[msg.sender], "Patient already registered");
        
        isPatient[msg.sender] = true;
        totalPatients++;
        
        emit PatientRegistered(msg.sender, block.timestamp);
    }

    /**
     * @dev Add a medical record for a patient
     * @param _patient Address of the patient
     * @param _cid IPFS CID of the encrypted medical file
     * @param _fileType Type of file (pdf, docx, jpg, etc.)
     * @param _category Category of record (reports, prescriptions, scans)
     */
    function addRecord(
        address _patient,
        string memory _cid,
        string memory _fileType,
        string memory _category
    ) external {
        require(isPatient[_patient], "Patient not registered");
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(bytes(_fileType).length > 0, "File type cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        
        // Only patient or contract owner can add records
        // In full implementation, would also check AccessControl contract
        require(
            msg.sender == _patient || msg.sender == owner(),
            "Not authorized to add record"
        );

        MedicalRecord memory newRecord = MedicalRecord({
            cid: _cid,
            fileType: _fileType,
            category: _category,
            timestamp: block.timestamp,
            uploader: msg.sender
        });

        patientRecords[_patient].push(newRecord);
        totalRecords++;

        emit RecordAdded(
            _patient,
            _cid,
            _fileType,
            _category,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Get all medical records for a patient
     * @param _patient Address of the patient
     * @return Array of MedicalRecord structs
     */
    function getRecords(address _patient) 
        external 
        view 
        returns (MedicalRecord[] memory) 
    {
        require(isPatient[_patient], "Patient not registered");
        return patientRecords[_patient];
    }

    /**
     * @dev Get the number of records for a patient
     * @param _patient Address of the patient
     * @return Number of records
     */
    function getRecordCount(address _patient) 
        external 
        view 
        returns (uint256) 
    {
        require(isPatient[_patient], "Patient not registered");
        return patientRecords[_patient].length;
    }

    /**
     * @dev Get a specific record by index
     * @param _patient Address of the patient
     * @param _index Index of the record
     * @return The medical record at the specified index
     */
    function getRecordByIndex(address _patient, uint256 _index)
        external
        view
        returns (MedicalRecord memory)
    {
        require(isPatient[_patient], "Patient not registered");
        require(_index < patientRecords[_patient].length, "Index out of bounds");
        return patientRecords[_patient][_index];
    }

    /**
     * @dev Get records by category
     * @param _patient Address of the patient
     * @param _category Category to filter by
     * @return Array of medical records in the specified category
     */
    function getRecordsByCategory(address _patient, string memory _category)
        external
        view
        returns (MedicalRecord[] memory)
    {
        require(isPatient[_patient], "Patient not registered");
        
        MedicalRecord[] memory allRecords = patientRecords[_patient];
        uint256 count = 0;
        
        // Count matching records
        for (uint256 i = 0; i < allRecords.length; i++) {
            if (keccak256(bytes(allRecords[i].category)) == keccak256(bytes(_category))) {
                count++;
            }
        }
        
        // Create result array
        MedicalRecord[] memory categoryRecords = new MedicalRecord[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allRecords.length; i++) {
            if (keccak256(bytes(allRecords[i].category)) == keccak256(bytes(_category))) {
                categoryRecords[index] = allRecords[i];
                index++;
            }
        }
        
        return categoryRecords;
    }
}
