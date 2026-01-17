const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl", function () {
    let accessControl;
    let patient1, patient2, doctor1, doctor2, doctor3;

    beforeEach(async function () {
        [patient1, patient2, doctor1, doctor2, doctor3] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        accessControl = await AccessControl.deploy();
    });

    describe("Access Requests", function () {
        it("Should allow doctor to request access", async function () {
            const reason = "Need to review medical history";

            await expect(
                accessControl.connect(doctor1).requestAccess(patient1.address, reason)
            ).to.emit(accessControl, "AccessRequested")
                .withArgs(doctor1.address, patient1.address, reason, await time.latest());

            expect(await accessControl.totalRequests()).to.equal(1);
        });

        it("Should not allow requesting access to own records", async function () {
            await expect(
                accessControl.connect(patient1).requestAccess(patient1.address, "Self access")
            ).to.be.revertedWith("Cannot request access to own records");
        });

        it("Should not allow requesting access with empty reason", async function () {
            await expect(
                accessControl.connect(doctor1).requestAccess(patient1.address, "")
            ).to.be.revertedWith("Reason required");
        });

        it("Should not allow requesting access to zero address", async function () {
            await expect(
                accessControl.connect(doctor1).requestAccess(ethers.ZeroAddress, "Test")
            ).to.be.revertedWith("Invalid patient address");
        });

        it("Should not allow requesting access when already granted", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).approveAccess(doctor1.address);

            await expect(
                accessControl.connect(doctor1).requestAccess(patient1.address, "Test again")
            ).to.be.revertedWith("Access already granted");
        });

        it("Should track requests for patient", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Reason 1");
            await accessControl.connect(doctor2).requestAccess(patient1.address, "Reason 2");

            const requests = await accessControl.getPatientRequests(patient1.address);
            expect(requests.length).to.equal(2);
            expect(requests[0].doctor).to.equal(doctor1.address);
            expect(requests[1].doctor).to.equal(doctor2.address);
        });

        it("Should track requests by doctor", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test 1");
            await accessControl.connect(doctor1).requestAccess(patient2.address, "Test 2");

            const requests = await accessControl.getDoctorRequests(doctor1.address);
            expect(requests.length).to.equal(2);
        });
    });

    describe("Access Approval", function () {
        beforeEach(async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
        });

        it("Should allow patient to approve access", async function () {
            await expect(
                accessControl.connect(patient1).approveAccess(doctor1.address)
            ).to.emit(accessControl, "AccessApproved")
                .withArgs(doctor1.address, patient1.address, await time.latest());

            expect(await accessControl.hasAccess(patient1.address, doctor1.address)).to.be.true;
            expect(await accessControl.totalApprovals()).to.equal(1);
        });

        it("Should not allow approving without request", async function () {
            await expect(
                accessControl.connect(patient1).approveAccess(doctor2.address)
            ).to.be.revertedWith("No pending request from this doctor");
        });

        it("Should not allow approving already granted access", async function () {
            await accessControl.connect(patient1).approveAccess(doctor1.address);

            // Try to approve again
            await expect(
                accessControl.connect(patient1).approveAccess(doctor1.address)
            ).to.be.revertedWith("Access already granted");
        });

        it("Should update request status after approval", async function () {
            await accessControl.connect(patient1).approveAccess(doctor1.address);

            const requests = await accessControl.getPatientRequests(patient1.address);
            expect(requests[0].approved).to.be.true;
            expect(requests[0].active).to.be.true;
            expect(requests[0].respondedAt).to.be.gt(0);
        });

        it("Should add doctor to authorized list", async function () {
            await accessControl.connect(patient1).approveAccess(doctor1.address);

            const authorized = await accessControl.getAuthorizedDoctors(patient1.address);
            expect(authorized.length).to.equal(1);
            expect(authorized[0]).to.equal(doctor1.address);
        });
    });

    describe("Access Denial", function () {
        beforeEach(async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
        });

        it("Should allow patient to deny access", async function () {
            await expect(
                accessControl.connect(patient1).denyAccess(doctor1.address)
            ).to.emit(accessControl, "AccessDenied")
                .withArgs(doctor1.address, patient1.address, await time.latest());
        });

        it("Should not allow denying without request", async function () {
            await expect(
                accessControl.connect(patient1).denyAccess(doctor2.address)
            ).to.be.revertedWith("No pending request from this doctor");
        });

        it("Should update request status after denial", async function () {
            await accessControl.connect(patient1).denyAccess(doctor1.address);

            const requests = await accessControl.getPatientRequests(patient1.address);
            expect(requests[0].approved).to.be.false;
            expect(requests[0].respondedAt).to.be.gt(0);
        });

        it("Should not grant access after denial", async function () {
            await accessControl.connect(patient1).denyAccess(doctor1.address);

            expect(await accessControl.hasAccess(patient1.address, doctor1.address)).to.be.false;
        });
    });

    describe("Access Revocation", function () {
        beforeEach(async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).approveAccess(doctor1.address);
        });

        it("Should allow patient to revoke access", async function () {
            await expect(
                accessControl.connect(patient1).revokeAccess(doctor1.address)
            ).to.emit(accessControl, "AccessRevoked")
                .withArgs(doctor1.address, patient1.address, await time.latest());

            expect(await accessControl.hasAccess(patient1.address, doctor1.address)).to.be.false;
            expect(await accessControl.totalRevocations()).to.equal(1);
        });

        it("Should not allow revoking access that wasn't granted", async function () {
            await expect(
                accessControl.connect(patient1).revokeAccess(doctor2.address)
            ).to.be.revertedWith("Access not granted");
        });

        it("Should mark request as inactive after revocation", async function () {
            await accessControl.connect(patient1).revokeAccess(doctor1.address);

            const requests = await accessControl.getPatientRequests(patient1.address);
            expect(requests[0].active).to.be.false;
        });

        it("Should remove from authorized doctors list", async function () {
            await accessControl.connect(patient1).revokeAccess(doctor1.address);

            const authorized = await accessControl.getAuthorizedDoctors(patient1.address);
            expect(authorized.length).to.equal(0);
        });
    });

    describe("Pending Requests", function () {
        it("Should return only pending requests", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test 1");
            await accessControl.connect(doctor2).requestAccess(patient1.address, "Test 2");
            await accessControl.connect(doctor3).requestAccess(patient1.address, "Test 3");

            // Approve one, deny one, leave one pending
            await accessControl.connect(patient1).approveAccess(doctor1.address);
            await accessControl.connect(patient1).denyAccess(doctor2.address);

            const pending = await accessControl.getPendingRequests(patient1.address);
            expect(pending.length).to.equal(1);
            expect(pending[0].doctor).to.equal(doctor3.address);
        });

        it("Should return empty array when no pending requests", async function () {
            const pending = await accessControl.getPendingRequests(patient1.address);
            expect(pending.length).to.equal(0);
        });
    });

    describe("Access Logging", function () {
        beforeEach(async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).approveAccess(doctor1.address);
        });

        it("Should allow doctor to log access", async function () {
            await expect(
                accessControl.connect(doctor1).logAccess(patient1.address)
            ).to.emit(accessControl, "RecordAccessed")
                .withArgs(doctor1.address, patient1.address, await time.latest());
        });

        it("Should not allow logging access without permission", async function () {
            await expect(
                accessControl.connect(doctor2).logAccess(patient1.address)
            ).to.be.revertedWith("Access not granted");
        });

        it("Should add to audit log", async function () {
            await accessControl.connect(doctor1).logAccess(patient1.address);

            const auditLog = await accessControl.getAuditLog(patient1.address);
            const accessEntries = auditLog.filter(entry => entry.action === "access");
            expect(accessEntries.length).to.equal(1);
        });
    });

    describe("Audit Trail", function () {
        it("Should track all access-related actions", async function () {
            // Request
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");

            // Approve
            await accessControl.connect(patient1).approveAccess(doctor1.address);

            // Log access
            await accessControl.connect(doctor1).logAccess(patient1.address);

            // Revoke
            await accessControl.connect(patient1).revokeAccess(doctor1.address);

            const auditLog = await accessControl.getAuditLog(patient1.address);
            expect(auditLog.length).to.equal(4);

            expect(auditLog[0].action).to.equal("request");
            expect(auditLog[1].action).to.equal("approve");
            expect(auditLog[2].action).to.equal("access");
            expect(auditLog[3].action).to.equal("revoke");
        });

        it("Should include denial in audit log", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).denyAccess(doctor1.address);

            const auditLog = await accessControl.getAuditLog(patient1.address);
            expect(auditLog.length).to.equal(2);
            expect(auditLog[1].action).to.equal("deny");
        });
    });

    describe("Check Access", function () {
        it("Should return true for granted access", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).approveAccess(doctor1.address);

            expect(await accessControl.checkAccess(patient1.address, doctor1.address)).to.be.true;
        });

        it("Should return false for no access", async function () {
            expect(await accessControl.checkAccess(patient1.address, doctor1.address)).to.be.false;
        });

        it("Should return false after revocation", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).approveAccess(doctor1.address);
            await accessControl.connect(patient1).revokeAccess(doctor1.address);

            expect(await accessControl.checkAccess(patient1.address, doctor1.address)).to.be.false;
        });
    });

    describe("Statistics", function () {
        it("Should track total requests", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test 1");
            await accessControl.connect(doctor2).requestAccess(patient1.address, "Test 2");
            await accessControl.connect(doctor1).requestAccess(patient2.address, "Test 3");

            expect(await accessControl.totalRequests()).to.equal(3);
        });

        it("Should track total approvals", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test 1");
            await accessControl.connect(doctor2).requestAccess(patient1.address, "Test 2");

            await accessControl.connect(patient1).approveAccess(doctor1.address);
            await accessControl.connect(patient1).approveAccess(doctor2.address);

            expect(await accessControl.totalApprovals()).to.equal(2);
        });

        it("Should track total revocations", async function () {
            await accessControl.connect(doctor1).requestAccess(patient1.address, "Test");
            await accessControl.connect(patient1).approveAccess(doctor1.address);
            await accessControl.connect(patient1).revokeAccess(doctor1.address);

            expect(await accessControl.totalRevocations()).to.equal(1);
        });
    });
});

// Helper to get latest block timestamp
const time = {
    latest: async () => {
        const block = await ethers.provider.getBlock("latest");
        return block.timestamp;
    }
};
