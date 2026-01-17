// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControl
 * @dev Manages patient-doctor access permissions and audit trail
 * @notice Patients control which doctors can access their medical records
 */
contract AccessControl {
    // Struct for access requests
    struct AccessRequest {
        address doctor;
        address patient;
        string reason;        // Why doctor needs access
        bool approved;
        bool active;          // False if revoked
        uint256 requestedAt;
        uint256 respondedAt;  // When patient approved/denied
    }

    // Struct for audit log entries
    struct AuditEntry {
        address doctor;
        address patient;
        string action;        // "request", "approve", "deny", "revoke", "access"
        uint256 timestamp;
    }

    // Mapping: patient => doctor => has access
    mapping(address => mapping(address => bool)) public hasAccess;
    
    // Mapping: patient => array of access requests
    mapping(address => AccessRequest[]) private patientRequests;
    
    // Mapping: doctor => array of their requests
    mapping(address => AccessRequest[]) private doctorRequests;
    
    // Mapping: patient => array of audit entries
    mapping(address => AuditEntry[]) private auditLog;
    
    // Mapping: patient => array of authorized doctors
    mapping(address => address[]) private authorizedDoctors;
    
    // Statistics
    uint256 public totalRequests;
    uint256 public totalApprovals;
    uint256 public totalRevocations;

    // Events
    event AccessRequested(
        address indexed doctor,
        address indexed patient,
        string reason,
        uint256 timestamp
    );
    
    event AccessApproved(
        address indexed doctor,
        address indexed patient,
        uint256 timestamp
    );
    
    event AccessDenied(
        address indexed doctor,
        address indexed patient,
        uint256 timestamp
    );
    
    event AccessRevoked(
        address indexed doctor,
        address indexed patient,
        uint256 timestamp
    );
    
    event RecordAccessed(
        address indexed doctor,
        address indexed patient,
        uint256 timestamp
    );

    /**
     * @dev Doctor requests access to patient records
     * @param _patient Address of the patient
     * @param _reason Reason for requesting access
     */
    function requestAccess(address _patient, string memory _reason) external {
        require(_patient != address(0), "Invalid patient address");
        require(_patient != msg.sender, "Cannot request access to own records");
        require(!hasAccess[_patient][msg.sender], "Access already granted");
        require(bytes(_reason).length > 0, "Reason required");

        AccessRequest memory newRequest = AccessRequest({
            doctor: msg.sender,
            patient: _patient,
            reason: _reason,
            approved: false,
            active: false,
            requestedAt: block.timestamp,
            respondedAt: 0
        });

        patientRequests[_patient].push(newRequest);
        doctorRequests[msg.sender].push(newRequest);
        totalRequests++;

        // Add to audit log
        _addAuditEntry(_patient, msg.sender, "request");

        emit AccessRequested(msg.sender, _patient, _reason, block.timestamp);
    }

    /**
     * @dev Patient approves doctor's access request
     * @param _doctor Address of the doctor
     */
    function approveAccess(address _doctor) external {
        require(_doctor != address(0), "Invalid doctor address");
        require(!hasAccess[msg.sender][_doctor], "Access already granted");

        // Find and update the request in patient's array
        bool requestFound = false;
        AccessRequest[] storage patientReqs = patientRequests[msg.sender];
        
        for (uint256 i = patientReqs.length; i > 0; i--) {
            if (patientReqs[i - 1].doctor == _doctor && !patientReqs[i - 1].approved) {
                patientReqs[i - 1].approved = true;
                patientReqs[i - 1].active = true;
                patientReqs[i - 1].respondedAt = block.timestamp;
                requestFound = true;
                break;
            }
        }

        require(requestFound, "No pending request from this doctor");

        // Also update the same request in doctor's array
        AccessRequest[] storage doctorReqs = doctorRequests[_doctor];
        for (uint256 i = doctorReqs.length; i > 0; i--) {
            if (doctorReqs[i - 1].patient == msg.sender && !doctorReqs[i - 1].approved) {
                doctorReqs[i - 1].approved = true;
                doctorReqs[i - 1].active = true;
                doctorReqs[i - 1].respondedAt = block.timestamp;
                break;
            }
        }

        // Grant access
        hasAccess[msg.sender][_doctor] = true;
        authorizedDoctors[msg.sender].push(_doctor);
        totalApprovals++;

        // Add to audit log
        _addAuditEntry(msg.sender, _doctor, "approve");

        emit AccessApproved(_doctor, msg.sender, block.timestamp);
    }

    /**
     * @dev Patient denies doctor's access request
     * @param _doctor Address of the doctor
     */
    function denyAccess(address _doctor) external {
        require(_doctor != address(0), "Invalid doctor address");

        // Find and update the request
        bool requestFound = false;
        AccessRequest[] storage requests = patientRequests[msg.sender];
        
        for (uint256 i = requests.length; i > 0; i--) {
            if (requests[i - 1].doctor == _doctor && !requests[i - 1].approved) {
                requests[i - 1].respondedAt = block.timestamp;
                requestFound = true;
                break;
            }
        }

        require(requestFound, "No pending request from this doctor");

        // Add to audit log
        _addAuditEntry(msg.sender, _doctor, "deny");

        emit AccessDenied(_doctor, msg.sender, block.timestamp);
    }

    /**
     * @dev Patient revokes doctor's access
     * @param _doctor Address of the doctor
     */
    function revokeAccess(address _doctor) external {
        require(_doctor != address(0), "Invalid doctor address");
        require(hasAccess[msg.sender][_doctor], "Access not granted");

        // Revoke access
        hasAccess[msg.sender][_doctor] = false;
        
        // Mark all active requests as inactive
        AccessRequest[] storage requests = patientRequests[msg.sender];
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].doctor == _doctor && requests[i].active) {
                requests[i].active = false;
            }
        }

        totalRevocations++;

        // Add to audit log
        _addAuditEntry(msg.sender, _doctor, "revoke");

        emit AccessRevoked(_doctor, msg.sender, block.timestamp);
    }

    /**
     * @dev Log when a doctor accesses patient records
     * @param _patient Address of the patient
     * @notice Can be called by backend when doctor retrieves records
     */
    function logAccess(address _patient) external {
        require(hasAccess[_patient][msg.sender], "Access not granted");

        _addAuditEntry(_patient, msg.sender, "access");

        emit RecordAccessed(msg.sender, _patient, block.timestamp);
    }

    /**
     * @dev Get all access requests for a patient
     * @param _patient Address of the patient
     * @return Array of access requests
     */
    function getPatientRequests(address _patient)
        external
        view
        returns (AccessRequest[] memory)
    {
        return patientRequests[_patient];
    }

    /**
     * @dev Get all requests made by a doctor
     * @param _doctor Address of the doctor
     * @return Array of access requests
     */
    function getDoctorRequests(address _doctor)
        external
        view
        returns (AccessRequest[] memory)
    {
        return doctorRequests[_doctor];
    }

    /**
     * @dev Get pending requests for a patient
     * @param _patient Address of the patient
     * @return Array of pending access requests
     */
    function getPendingRequests(address _patient)
        external
        view
        returns (AccessRequest[] memory)
    {
        AccessRequest[] memory allRequests = patientRequests[_patient];
        uint256 count = 0;

        // Count pending requests
        for (uint256 i = 0; i < allRequests.length; i++) {
            if (!allRequests[i].approved && allRequests[i].respondedAt == 0) {
                count++;
            }
        }

        // Create result array
        AccessRequest[] memory pending = new AccessRequest[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allRequests.length; i++) {
            if (!allRequests[i].approved && allRequests[i].respondedAt == 0) {
                pending[index] = allRequests[i];
                index++;
            }
        }

        return pending;
    }

    /**
     * @dev Get all doctors authorized by a patient
     * @param _patient Address of the patient
     * @return Array of authorized doctor addresses
     */
    function getAuthorizedDoctors(address _patient)
        external
        view
        returns (address[] memory)
    {
        address[] memory allDoctors = authorizedDoctors[_patient];
        uint256 count = 0;

        // Count currently authorized doctors
        for (uint256 i = 0; i < allDoctors.length; i++) {
            if (hasAccess[_patient][allDoctors[i]]) {
                count++;
            }
        }

        // Create result array
        address[] memory authorized = new address[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allDoctors.length; i++) {
            if (hasAccess[_patient][allDoctors[i]]) {
                authorized[index] = allDoctors[i];
                index++;
            }
        }

        return authorized;
    }

    /**
     * @dev Get audit log for a patient
     * @param _patient Address of the patient
     * @return Array of audit entries
     */
    function getAuditLog(address _patient)
        external
        view
        returns (AuditEntry[] memory)
    {
        return auditLog[_patient];
    }

    /**
     * @dev Internal function to add audit entry
     * @param _patient Address of the patient
     * @param _doctor Address of the doctor
     * @param _action Action performed
     */
    function _addAuditEntry(
        address _patient,
        address _doctor,
        string memory _action
    ) private {
        auditLog[_patient].push(AuditEntry({
            doctor: _doctor,
            patient: _patient,
            action: _action,
            timestamp: block.timestamp
        }));
    }

    /**
     * @dev Check if doctor has active access to patient
     * @param _patient Address of the patient
     * @param _doctor Address of the doctor
     * @return True if access is granted and active
     */
    function checkAccess(address _patient, address _doctor)
        external
        view
        returns (bool)
    {
        return hasAccess[_patient][_doctor];
    }
}
