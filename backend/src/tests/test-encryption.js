const encryptionService = require('../services/encryption.service');
const fs = require('fs');
const path = require('path');

/**
 * Test encryption and decryption flow
 */

console.log('🧪 Testing MediChain Encryption Service\n');
console.log('='.repeat(60));

// Test data
const testWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb27';
const testPassword = 'SecurePatientPassword123!';
const testMessage = 'This is a confidential medical report containing sensitive patient information.';

console.log('\n📋 Test Configuration:');
console.log(`   Wallet: ${testWallet}`);
console.log(`   Password: ${'*'.repeat(testPassword.length)}`);
console.log(`   Data Length: ${testMessage.length} bytes\n`);

console.log('='.repeat(60));

// Test 1: Key Generation
console.log('\n1️⃣  Testing Key Generation...');
try {
    const key1 = encryptionService.generateKey(testWallet, testPassword);
    const key2 = encryptionService.generateKey(testWallet, testPassword);

    console.log(`   ✅ Key generated: ${key1.toString('hex').substring(0, 20)}...`);
    console.log(`   ✅ Key length: ${key1.length} bytes (${key1.length * 8} bits)`);
    console.log(`   ✅ Deterministic: ${key1.equals(key2) ? 'YES' : 'NO'}`);
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

// Test 2: Encryption
console.log('\n2️⃣  Testing Encryption...');
try {
    const buffer = Buffer.from(testMessage, 'utf8');
    const key = encryptionService.generateKey(testWallet, testPassword);

    const { encryptedData, iv } = encryptionService.encryptFile(buffer, key);

    console.log(`   ✅ Original size: ${buffer.length} bytes`);
    console.log(`   ✅ Encrypted size: ${encryptedData.length} bytes`);
    console.log(`   ✅ IV: ${iv.toString('hex')}`);
    console.log(`   ✅ Encrypted (hex): ${encryptedData.toString('hex').substring(0, 40)}...`);
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

// Test 3: Decryption
console.log('\n3️⃣  Testing Decryption...');
try {
    const buffer = Buffer.from(testMessage, 'utf8');
    const key = encryptionService.generateKey(testWallet, testPassword);

    const { encryptedData, iv } = encryptionService.encryptFile(buffer, key);
    const decrypted = encryptionService.decryptFile(encryptedData, key, iv);

    const decryptedMessage = decrypted.toString('utf8');
    const isMatch = decryptedMessage === testMessage;

    console.log(`   ✅ Decrypted: ${decryptedMessage.substring(0, 50)}...`);
    console.log(`   ✅ Match: ${isMatch ? 'YES ✓' : 'NO ✗'}`);
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

// Test 4: Convenience Functions
console.log('\n4️⃣  Testing Convenience Functions...');
try {
    const buffer = Buffer.from(testMessage, 'utf8');

    const { encryptedData, iv } = encryptionService.encryptWithPassword(
        buffer,
        testWallet,
        testPassword
    );

    const decrypted = encryptionService.decryptWithPassword(
        encryptedData,
        testWallet,
        testPassword,
        iv
    );

    const isMatch = decrypted.toString('utf8') === testMessage;

    console.log(`   ✅ Encrypt with password: SUCCESS`);
    console.log(`   ✅ Decrypt with password: SUCCESS`);
    console.log(`   ✅ Round-trip match: ${isMatch ? 'YES ✓' : 'NO ✗'}`);
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

// Test 5: Combined Data Format
console.log('\n5️⃣  Testing Combined Data Format...');
try {
    const buffer = Buffer.from(testMessage, 'utf8');
    const { encryptedData, iv } = encryptionService.encryptWithPassword(
        buffer,
        testWallet,
        testPassword
    );

    // Combine
    const combined = encryptionService.combineEncryptedData(encryptedData, iv);
    console.log(`   ✅ Combined size: ${combined.length} bytes`);
    console.log(`   ✅ Format: [IV (${encryptionService.IV_LENGTH}B) + Encrypted Data (${encryptedData.length}B)]`);

    // Split
    const { iv: extractedIV, encryptedData: extractedData } = encryptionService.splitEncryptedData(combined);

    const ivMatch = extractedIV.equals(iv);
    const dataMatch = extractedData.equals(encryptedData);

    console.log(`   ✅ IV extracted: ${ivMatch ? 'YES ✓' : 'NO ✗'}`);
    console.log(`   ✅ Data extracted: ${dataMatch ? 'YES ✓' : 'NO ✗'}`);

    // Decrypt from combined
    const decrypted = encryptionService.decryptFile(extractedData,
        encryptionService.generateKey(testWallet, testPassword),
        extractedIV
    );

    const finalMatch = decrypted.toString('utf8') === testMessage;
    console.log(`   ✅ Full round-trip: ${finalMatch ? 'YES ✓' : 'NO ✗'}`);
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

// Test 6: Wrong Password
console.log('\n6️⃣  Testing Wrong Password (Security Check)...');
try {
    const buffer = Buffer.from(testMessage, 'utf8');
    const { encryptedData, iv } = encryptionService.encryptWithPassword(
        buffer,
        testWallet,
        testPassword
    );

    try {
        const wrongPassword = 'WrongPassword123!';
        const decrypted = encryptionService.decryptWithPassword(
            encryptedData,
            testWallet,
            wrongPassword,
            iv
        );
        console.log(`   ❌ SECURITY ISSUE: Decryption succeeded with wrong password!`);
    } catch (decryptError) {
        console.log(`   ✅ Correctly rejected wrong password`);
        console.log(`   ✅ Error: ${decryptError.message}`);
    }
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

// Test 7: File Simulation
console.log('\n7️⃣  Testing File Simulation (1KB sample)...');
try {
    // Create 1KB of random data (simulating a file)
    const fileData = crypto.randomBytes(1024);

    const { encryptedData, iv } = encryptionService.encryptWithPassword(
        fileData,
        testWallet,
        testPassword
    );

    const combined = encryptionService.combineEncryptedData(encryptedData, iv);

    const { iv: extractedIV, encryptedData: extractedData } = encryptionService.splitEncryptedData(combined);

    const decrypted = encryptionService.decryptWithPassword(
        extractedData,
        testWallet,
        testPassword,
        extractedIV
    );

    const isMatch = fileData.equals(decrypted);

    console.log(`   ✅ File size: ${fileData.length} bytes`);
    console.log(`   ✅ Encrypted size: ${combined.length} bytes`);
    console.log(`   ✅ Overhead: ${combined.length - fileData.length} bytes (${((combined.length / fileData.length - 1) * 100).toFixed(2)}%)`);
    console.log(`   ✅ Decryption match: ${isMatch ? 'YES ✓' : 'NO ✗'}`);
} catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ All encryption tests completed!\n');

// Performance test (optional)
console.log('⚡ Performance Test (1000 iterations)...');
const iterations = 1000;
const perfBuffer = Buffer.from('Test data for performance');
const perfKey = encryptionService.generateKey(testWallet, testPassword);

const startTime = Date.now();
for (let i = 0; i < iterations; i++) {
    const { encryptedData, iv } = encryptionService.encryptFile(perfBuffer, perfKey);
    encryptionService.decryptFile(encryptedData, perfKey, iv);
}
const endTime = Date.now();

const avgTime = (endTime - startTime) / iterations;
console.log(`   ✅ Average time per encrypt+decrypt: ${avgTime.toFixed(3)}ms`);
console.log(`   ✅ Throughput: ${(1000 / avgTime).toFixed(0)} ops/second\n`);
