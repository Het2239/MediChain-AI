// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DoctorRegistry
 * @dev Manages doctor verification and credentials
 * @notice Only admin can verify doctors, ensures only legitimate healthcare providers access patient data
 */
contract DoctorRegistry is Ownable {
    constructor() Ownable(msg.sender) {}

    // Struct to store doctor information
    struct Doctor {
        string licenseNumber;  // Medical license number
        string specialty;      // Doctor's specialty (optional)
        bool isVerified;       // Verification status
        uint256 verifiedAt;    // Timestamp of verification
        uint256 revokedAt;     // Timestamp of revocation (0 if not revoked)
    }

    // Mapping from doctor address to their information
    mapping(address => Doctor) public doctors;
    
    // Array to track all doctor addresses
    address[] private doctorAddresses;
    
    // Total number of verified doctors
    uint256 public totalVerifiedDoctors;

    // Events
    event DoctorVerified(
        address indexed doctor,
        string licenseNumber,
        string specialty,
        uint256 timestamp
    );
    
    event DoctorRevoked(
        address indexed doctor,
        uint256 timestamp
    );
    
    event DoctorUpdated(
        address indexed doctor,
        string licenseNumber,
        string specialty,
        uint256 timestamp
    );

    /**
     * @dev Verify a doctor (admin only)
     * @param _doctor Address of the doctor to verify
     * @param _licenseNumber Medical license number
     * @param _specialty Doctor's specialty
     */
    function verifyDoctor(
        address _doctor,
        string memory _licenseNumber,
        string memory _specialty
    ) external onlyOwner {
        require(_doctor != address(0), "Invalid doctor address");
        require(bytes(_licenseNumber).length > 0, "License number required");
        require(!doctors[_doctor].isVerified, "Doctor already verified");

        // If this is a new doctor, add to tracking array
        if (doctors[_doctor].verifiedAt == 0) {
            doctorAddresses.push(_doctor);
        }

        doctors[_doctor] = Doctor({
            licenseNumber: _licenseNumber,
            specialty: _specialty,
            isVerified: true,
            verifiedAt: block.timestamp,
            revokedAt: 0
        });

        totalVerifiedDoctors++;

        emit DoctorVerified(_doctor, _licenseNumber, _specialty, block.timestamp);
    }

    /**
     * @dev Revoke doctor verification (admin only)
     * @param _doctor Address of the doctor to revoke
     */
    function revokeDoctor(address _doctor) external onlyOwner {
        require(doctors[_doctor].isVerified, "Doctor not verified");

        doctors[_doctor].isVerified = false;
        doctors[_doctor].revokedAt = block.timestamp;
        totalVerifiedDoctors--;

        emit DoctorRevoked(_doctor, block.timestamp);
    }

    /**
     * @dev Update doctor information (admin only)
     * @param _doctor Address of the doctor
     * @param _licenseNumber New license number
     * @param _specialty New specialty
     */
    function updateDoctor(
        address _doctor,
        string memory _licenseNumber,
        string memory _specialty
    ) external onlyOwner {
        require(doctors[_doctor].isVerified, "Doctor not verified");
        require(bytes(_licenseNumber).length > 0, "License number required");

        doctors[_doctor].licenseNumber = _licenseNumber;
        doctors[_doctor].specialty = _specialty;

        emit DoctorUpdated(_doctor, _licenseNumber, _specialty, block.timestamp);
    }

    /**
     * @dev Check if a doctor is verified
     * @param _doctor Address of the doctor
     * @return True if doctor is verified
     */
    function isVerified(address _doctor) external view returns (bool) {
        return doctors[_doctor].isVerified;
    }

    /**
     * @dev Get doctor information
     * @param _doctor Address of the doctor
     * @return Doctor struct with all information
     */
    function getDoctorInfo(address _doctor) 
        external 
        view 
        returns (Doctor memory) 
    {
        return doctors[_doctor];
    }

    /**
     * @dev Get all doctor addresses
     * @return Array of all doctor addresses (both verified and revoked)
     */
    function getAllDoctors() external view returns (address[] memory) {
        return doctorAddresses;
    }

    /**
     * @dev Get all verified doctors
     * @return Array of verified doctor addresses
     */
    function getVerifiedDoctors() external view returns (address[] memory) {
        uint256 count = 0;
        
        // Count verified doctors
        for (uint256 i = 0; i < doctorAddresses.length; i++) {
            if (doctors[doctorAddresses[i]].isVerified) {
                count++;
            }
        }
        
        // Create result array
        address[] memory verified = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < doctorAddresses.length; i++) {
            if (doctors[doctorAddresses[i]].isVerified) {
                verified[index] = doctorAddresses[i];
                index++;
            }
        }
        
        return verified;
    }

    /**
     * @dev Get number of doctors
     * @return Total number of doctor addresses (including revoked)
     */
    function getDoctorCount() external view returns (uint256) {
        return doctorAddresses.length;
    }
}
