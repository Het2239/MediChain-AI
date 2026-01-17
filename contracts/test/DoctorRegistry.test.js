const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DoctorRegistry", function () {
    let doctorRegistry;
    let owner, admin, doctor1, doctor2, doctor3;

    beforeEach(async function () {
        [owner, admin, doctor1, doctor2, doctor3] = await ethers.getSigners();

        const DoctorRegistry = await ethers.getContractFactory("DoctorRegistry");
        doctorRegistry = await DoctorRegistry.deploy();
    });

    describe("Doctor Verification", function () {
        it("Should allow owner to verify a doctor", async function () {
            const licenseNumber = "MD-12345";
            const specialty = "Cardiology";

            await expect(
                doctorRegistry.verifyDoctor(doctor1.address, licenseNumber, specialty)
            ).to.emit(doctorRegistry, "DoctorVerified")
                .withArgs(doctor1.address, licenseNumber, specialty, await time.latest());

            const doctorInfo = await doctorRegistry.getDoctorInfo(doctor1.address);
            expect(doctorInfo.licenseNumber).to.equal(licenseNumber);
            expect(doctorInfo.specialty).to.equal(specialty);
            expect(doctorInfo.isVerified).to.be.true;
            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(1);
        });

        it("Should not allow non-owner to verify a doctor", async function () {
            await expect(
                doctorRegistry.connect(admin).verifyDoctor(
                    doctor1.address,
                    "MD-12345",
                    "Cardiology"
                )
            ).to.be.revertedWithCustomError(doctorRegistry, "OwnableUnauthorizedAccount");
        });

        it("Should not allow verifying the same doctor twice", async function () {
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");

            await expect(
                doctorRegistry.verifyDoctor(doctor1.address, "MD-67890", "Neurology")
            ).to.be.revertedWith("Doctor already verified");
        });

        it("Should not allow verifying with empty license number", async function () {
            await expect(
                doctorRegistry.verifyDoctor(doctor1.address, "", "Cardiology")
            ).to.be.revertedWith("License number required");
        });

        it("Should not allow verifying zero address", async function () {
            await expect(
                doctorRegistry.verifyDoctor(
                    ethers.ZeroAddress,
                    "MD-12345",
                    "Cardiology"
                )
            ).to.be.revertedWith("Invalid doctor address");
        });

        it("Should verify multiple doctors", async function () {
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");
            await doctorRegistry.verifyDoctor(doctor2.address, "MD-67890", "Neurology");
            await doctorRegistry.verifyDoctor(doctor3.address, "MD-11111", "Pediatrics");

            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(3);
        });
    });

    describe("Doctor Revocation", function () {
        beforeEach(async function () {
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");
        });

        it("Should allow owner to revoke a doctor", async function () {
            await expect(doctorRegistry.revokeDoctor(doctor1.address))
                .to.emit(doctorRegistry, "DoctorRevoked")
                .withArgs(doctor1.address, await time.latest());

            const doctorInfo = await doctorRegistry.getDoctorInfo(doctor1.address);
            expect(doctorInfo.isVerified).to.be.false;
            expect(doctorInfo.revokedAt).to.be.gt(0);
            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(0);
        });

        it("Should not allow non-owner to revoke a doctor", async function () {
            await expect(
                doctorRegistry.connect(admin).revokeDoctor(doctor1.address)
            ).to.be.revertedWithCustomError(doctorRegistry, "OwnableUnauthorizedAccount");
        });

        it("Should not allow revoking unverified doctor", async function () {
            await expect(
                doctorRegistry.revokeDoctor(doctor2.address)
            ).to.be.revertedWith("Doctor not verified");
        });

        it("Should not allow revoking already revoked doctor", async function () {
            await doctorRegistry.revokeDoctor(doctor1.address);

            await expect(
                doctorRegistry.revokeDoctor(doctor1.address)
            ).to.be.revertedWith("Doctor not verified");
        });

        it("Should update total verified doctors correctly after revocation", async function () {
            await doctorRegistry.verifyDoctor(doctor2.address, "MD-67890", "Neurology");
            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(2);

            await doctorRegistry.revokeDoctor(doctor1.address);
            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(1);
        });
    });

    describe("Doctor Update", function () {
        beforeEach(async function () {
            await doctorRegistry.verifyDoctor(
                doctor1.address,
                "MD-12345",
                "Cardiology"
            );
        });

        it("Should allow owner to update doctor information", async function () {
            const newLicense = "MD-99999";
            const newSpecialty = "Cardiothoracic Surgery";

            await expect(
                doctorRegistry.updateDoctor(doctor1.address, newLicense, newSpecialty)
            ).to.emit(doctorRegistry, "DoctorUpdated")
                .withArgs(doctor1.address, newLicense, newSpecialty, await time.latest());

            const doctorInfo = await doctorRegistry.getDoctorInfo(doctor1.address);
            expect(doctorInfo.licenseNumber).to.equal(newLicense);
            expect(doctorInfo.specialty).to.equal(newSpecialty);
            expect(doctorInfo.isVerified).to.be.true; // Should remain verified
        });

        it("Should not allow updating unverified doctor", async function () {
            await expect(
                doctorRegistry.updateDoctor(doctor2.address, "MD-99999", "Surgery")
            ).to.be.revertedWith("Doctor not verified");
        });

        it("Should not allow updating with empty license", async function () {
            await expect(
                doctorRegistry.updateDoctor(doctor1.address, "", "Surgery")
            ).to.be.revertedWith("License number required");
        });
    });

    describe("Doctor Verification Check", function () {
        it("Should return true for verified doctor", async function () {
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");
            expect(await doctorRegistry.isVerified(doctor1.address)).to.be.true;
        });

        it("Should return false for unverified doctor", async function () {
            expect(await doctorRegistry.isVerified(doctor1.address)).to.be.false;
        });

        it("Should return false for revoked doctor", async function () {
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");
            await doctorRegistry.revokeDoctor(doctor1.address);

            expect(await doctorRegistry.isVerified(doctor1.address)).to.be.false;
        });
    });

    describe("Doctor Retrieval", function () {
        beforeEach(async function () {
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");
            await doctorRegistry.verifyDoctor(doctor2.address, "MD-67890", "Neurology");
            await doctorRegistry.verifyDoctor(doctor3.address, "MD-11111", "Pediatrics");
            await doctorRegistry.revokeDoctor(doctor2.address); // Revoke one
        });

        it("Should get all doctor addresses", async function () {
            const allDoctors = await doctorRegistry.getAllDoctors();
            expect(allDoctors.length).to.equal(3);
            expect(allDoctors).to.include(doctor1.address);
            expect(allDoctors).to.include(doctor2.address);
            expect(allDoctors).to.include(doctor3.address);
        });

        it("Should get only verified doctors", async function () {
            const verifiedDoctors = await doctorRegistry.getVerifiedDoctors();
            expect(verifiedDoctors.length).to.equal(2);
            expect(verifiedDoctors).to.include(doctor1.address);
            expect(verifiedDoctors).to.include(doctor3.address);
            expect(verifiedDoctors).to.not.include(doctor2.address);
        });

        it("Should get correct doctor count", async function () {
            const count = await doctorRegistry.getDoctorCount();
            expect(count).to.equal(3); // Includes revoked doctor
        });

        it("Should get doctor information", async function () {
            const info = await doctorRegistry.getDoctorInfo(doctor1.address);
            expect(info.licenseNumber).to.equal("MD-12345");
            expect(info.specialty).to.equal("Cardiology");
            expect(info.isVerified).to.be.true;
        });
    });

    describe("Edge Cases", function () {
        it("Should handle re-verification after revocation", async function () {
            // Verify doctor
            await doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology");
            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(1);

            // Revoke doctor
            await doctorRegistry.revokeDoctor(doctor1.address);
            expect(await doctorRegistry.totalVerifiedDoctors()).to.equal(0);

            // The contract currently doesn't allow re-verification
            // This should fail
            await expect(
                doctorRegistry.verifyDoctor(doctor1.address, "MD-12345", "Cardiology")
            ).to.be.revertedWith("Doctor already verified");
        });

        it("Should return empty array when no doctors verified", async function () {
            const verifiedDoctors = await doctorRegistry.getVerifiedDoctors();
            expect(verifiedDoctors.length).to.equal(0);
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
