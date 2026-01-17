const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting MediChain AI contract deployment...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Deploy PatientRegistry
    console.log("📋 Deploying PatientRegistry...");
    const PatientRegistry = await hre.ethers.getContractFactory("PatientRegistry");
    const patientRegistry = await PatientRegistry.deploy();
    await patientRegistry.waitForDeployment();
    const patientRegistryAddress = await patientRegistry.getAddress();
    console.log("✅ PatientRegistry deployed to:", patientRegistryAddress);

    // Deploy DoctorRegistry
    console.log("\n👨‍⚕️ Deploying DoctorRegistry...");
    const DoctorRegistry = await hre.ethers.getContractFactory("DoctorRegistry");
    const doctorRegistry = await DoctorRegistry.deploy();
    await doctorRegistry.waitForDeployment();
    const doctorRegistryAddress = await doctorRegistry.getAddress();
    console.log("✅ DoctorRegistry deployed to:", doctorRegistryAddress);

    // Deploy AccessControl
    console.log("\n🔐 Deploying AccessControl...");
    const AccessControl = await hre.ethers.getContractFactory("AccessControl");
    const accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();
    const accessControlAddress = await accessControl.getAddress();
    console.log("✅ AccessControl deployed to:", accessControlAddress);

    // Prepare deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            PatientRegistry: patientRegistryAddress,
            DoctorRegistry: doctorRegistryAddress,
            AccessControl: accessControlAddress
        }
    };

    // Save deployment info to file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const deploymentFile = path.join(
        deploymentsDir,
        `${hre.network.name}-${Date.now()}.json`
    );
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentFile);

    // Save latest deployment for easy reference
    const latestFile = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
    fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

    // Print environment variables to update .env
    console.log("\n" + "=".repeat(60));
    console.log("📝 Update your .env file with these addresses:");
    console.log("=".repeat(60));
    console.log(`PATIENT_REGISTRY_ADDRESS=${patientRegistryAddress}`);
    console.log(`DOCTOR_REGISTRY_ADDRESS=${doctorRegistryAddress}`);
    console.log(`ACCESS_CONTROL_ADDRESS=${accessControlAddress}`);
    console.log("\nFor frontend, also update:");
    console.log(`VITE_PATIENT_REGISTRY_ADDRESS=${patientRegistryAddress}`);
    console.log(`VITE_DOCTOR_REGISTRY_ADDRESS=${doctorRegistryAddress}`);
    console.log(`VITE_ACCESS_CONTROL_ADDRESS=${accessControlAddress}`);
    console.log("=".repeat(60));

    // Verify contracts on Etherscan (if not localhost)
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
        console.log("\n⏳ Waiting for block confirmations before verification...");
        // Wait for 5 block confirmations
        await patientRegistry.deploymentTransaction().wait(5);

        console.log("\n🔍 Verifying contracts on Etherscan...");

        try {
            await hre.run("verify:verify", {
                address: patientRegistryAddress,
                constructorArguments: [],
            });
            console.log("✅ PatientRegistry verified");
        } catch (error) {
            console.log("⚠️  PatientRegistry verification failed:", error.message);
        }

        try {
            await hre.run("verify:verify", {
                address: doctorRegistryAddress,
                constructorArguments: [],
            });
            console.log("✅ DoctorRegistry verified");
        } catch (error) {
            console.log("⚠️  DoctorRegistry verification failed:", error.message);
        }

        try {
            await hre.run("verify:verify", {
                address: accessControlAddress,
                constructorArguments: [],
            });
            console.log("✅ AccessControl verified");
        } catch (error) {
            console.log("⚠️  AccessControl verification failed:", error.message);
        }
    }

    console.log("\n✨ Deployment completed successfully!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
