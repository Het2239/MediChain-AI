const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PatientRegistry", function () {
    let patientRegistry;
    let owner, patient1, patient2, doctor1;

    beforeEach(async function () {
        [owner, patient1, patient2, doctor1] = await ethers.getSigners();

        const PatientRegistry = await ethers.getContractFactory("PatientRegistry");
        patientRegistry = await PatientRegistry.deploy();
    });

    describe("Patient Registration", function () {
        it("Should allow a patient to register", async function () {
            await expect(patientRegistry.connect(patient1).registerPatient())
                .to.emit(patientRegistry, "PatientRegistered")
                .withArgs(patient1.address, await anyValue());

            expect(await patientRegistry.isPatient(patient1.address)).to.be.true;
            expect(away patientRegistry.totalPatients()).to.equal(1);
        });

        it("Should not allow duplicate registration", async function () {
            await patientRegistry.connect(patient1).registerPatient();

            await expect(
                patientRegistry.connect(patient1).registerPatient()
            ).to.be.revertedWith("Patient already registered");
        });

        it("Should increment total patients correctly", async function () {
            await patientRegistry.connect(patient1).registerPatient();
            await patientRegistry.connect(patient2).registerPatient();

            expect(await patientRegistry.totalPatients()).to.equal(2);
        });
    });

    describe("Medical Record Management", function () {
        beforeEach(async function () {
            await patientRegistry.connect(patient1).registerPatient();
        });

        it("Should allow patient to add a medical record", async function () {
            const cid = "QmTest123";
            const fileType = "pdf";
            const category = "reports";

            await expect(
                patientRegistry.connect(patient1).addRecord(
                    patient1.address,
                    cid,
                    fileType,
                    category
                )
            ).to.emit(patientRegistry, "RecordAdded");

            expect(await patientRegistry.getRecordCount(patient1.address)).to.equal(1);
            expect(await patientRegistry.totalRecords()).to.equal(1);
        });

        it("Should not allow adding record for unregistered patient", async function () {
            await expect(
                patientRegistry.connect(patient1).addRecord(
                    patient2.address,
                    "QmTest123",
                    "pdf",
                    "reports"
                )
            ).to.be.revertedWith("Patient not registered");
        });

        it("Should not allow adding record with empty CID", async function () {
            await expect(
                patientRegistry.connect(patient1).addRecord(
                    patient1.address,
                    "",
                    "pdf",
                    "reports"
                )
            ).to.be.revertedWith("CID cannot be empty");
        });

        it("Should not allow unauthorized users to add records", async function () {
            await expect(
                patientRegistry.connect(doctor1).addRecord(
                    patient1.address,
                    "QmTest123",
                    "pdf",
                    "reports"
                )
            ).to.be.revertedWith("Not authorized to add record");
        });

        it("Should allow owner to add records for any patient", async function () {
            const cid = "QmTest456";
            const fileType = "docx";
            const category = "prescriptions";

            await patientRegistry.connect(owner).addRecord(
                patient1.address,
                cid,
                fileType,
                category
            );

            const records = await patientRegistry.getRecords(patient1.address);
            expect(records.length).to.equal(1);
            expect(records[0].uploader).to.equal(owner.address);
        });
    });

    describe("Record Retrieval", function () {
        beforeEach(async function () {
            await patientRegistry.connect(patient1).registerPatient();

            // Add multiple records
            await patientRegistry.connect(patient1).addRecord(
                patient1.address, "QmReport1", "pdf", "reports"
            );
            await patientRegistry.connect(patient1).addRecord(
                patient1.address, "QmPrescription1", "pdf", "prescriptions"
            );
            await patientRegistry.connect(patient1).addRecord(
                patient1.address, "QmScan1", "jpg", "scans"
            );
            await patientRegistry.connect(patient1).addRecord(
                patient1.address, "QmReport2", "pdf", "reports"
            );
        });

        it("Should retrieve all records for a patient", async function () {
            const records = await patientRegistry.getRecords(patient1.address);
            expect(records.length).to.equal(4);
        });

        it("Should get correct record count", async function () {
            const count = await patientRegistry.getRecordCount(patient1.address);
            expect(count).to.equal(4);
        });

        it("Should retrieve record by index", async function () {
            const record = await patientRegistry.getRecordByIndex(patient1.address, 0);
            expect(record.cid).to.equal("QmReport1");
            expect(record.category).to.equal("reports");
        });

        it("Should revert when index is out of bounds", async function () {
            await expect(
                patientRegistry.getRecordByIndex(patient1.address, 10)
            ).to.be.revertedWith("Index out of bounds");
        });

        it("Should filter records by category", async function () {
            const reports = await patientRegistry.getRecordsByCategory(
                patient1.address,
                "reports"
            );
            expect(reports.length).to.equal(2);
            expect(reports[0].cid).to.equal("QmReport1");
            expect(reports[1].cid).to.equal("QmReport2");
        });

        it("Should return empty array for non-existent category", async function () {
            const records = await patientRegistry.getRecordsByCategory(
                patient1.address,
                "nonexistent"
            );
            expect(records.length).to.equal(0);
        });

        it("Should not allow retrieving records for unregistered patient", async function () {
            await expect(
                patientRegistry.getRecords(patient2.address)
            ).to.be.revertedWith("Patient not registered");
        });
    });

    describe("Record Metadata", function () {
        it("Should store correct metadata", async function () {
            await patientRegistry.connect(patient1).registerPatient();

            const cid = "QmTest123";
            const fileType = "pdf";
            const category = "reports";

            await patientRegistry.connect(patient1).addRecord(
                patient1.address,
                cid,
                fileType,
                category
            );

            const record = await patientRegistry.getRecordByIndex(patient1.address, 0);

            expect(record.cid).to.equal(cid);
            expect(record.fileType).to.equal(fileType);
            expect(record.category).to.equal(category);
            expect(record.uploader).to.equal(patient1.address);
            expect(record.timestamp).to.be.gt(0);
        });
    });

    describe("Statistics", function () {
        it("Should track total records across all patients", async function () {
            await patientRegistry.connect(patient1).registerPatient();
            await patientRegistry.connect(patient2).registerPatient();

            await patientRegistry.connect(patient1).addRecord(
                patient1.address, "QmTest1", "pdf", "reports"
            );
            await patientRegistry.connect(patient1).addRecord(
                patient1.address, "QmTest2", "pdf", "reports"
            );
            await patientRegistry.connect(patient2).addRecord(
                patient2.address, "QmTest3", "pdf", "reports"
            );

            expect(await patientRegistry.totalRecords()).to.equal(3);
        });
    });
});

// Helper function
const anyValue = () => {
    return {
        asyncMatcher: async () => ({ pass: true }),
    };
};
