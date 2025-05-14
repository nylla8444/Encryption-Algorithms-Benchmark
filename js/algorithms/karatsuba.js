/**
 * Karatsuba Multiplication Algorithm Implementation
 * Time Complexity: O(n^log₂3) ≈ O(n^1.585)
 */

const Karatsuba = {
    // Name and description for UI display
    name: 'Karatsuba',
    fullName: 'Karatsuba Algorithm',
    description: 'A divide-and-conquer algorithm that reduces the multiplication of two n-digit numbers to three multiplications of n/2-digit numbers.',
    timeComplexity: 'O(n^log₂3) ≈ O(n^1.585)',
    spaceComplexity: 'O(n)',
    securityLevel: 'Medium',

    /**
     * Core Karatsuba multiplication function for two large integers
     * @param {BigInt} x - First large integer
     * @param {BigInt} y - Second large integer
     * @returns {BigInt} - Product of x and y
     */
    multiply(x, y) {
        // Convert to BigInt if needed
        x = BigInt(x);
        y = BigInt(y);

        // Base case for small numbers
        if (x < 10n || y < 10n) {
            return x * y;
        }

        // Determine the size of numbers
        const strX = x.toString();
        const strY = y.toString();
        const maxLength = Math.max(strX.length, strY.length);

        // Calculate split point (half of the maximum length)
        const m = Math.floor(maxLength / 2);

        // Powers of 10 for splitting and combining
        const pow10 = BigInt(10) ** BigInt(m);

        // Split the numbers: x = a*10^m + b, y = c*10^m + d
        const a = x / pow10;
        const b = x % pow10;
        const c = y / pow10;
        const d = y % pow10;

        // Recursive steps using Karatsuba's formula
        const z0 = this.multiply(b, d);        // bd
        const z2 = this.multiply(a, c);        // ac
        const z1 = this.multiply(a + b, c + d) - z0 - z2;  // (a+b)(c+d) - ac - bd

        // Combine results: ac*10^(2m) + ((a+b)(c+d) - ac - bd)*10^m + bd
        return (z2 * pow10 * pow10) + (z1 * pow10) + z0;
    },

    /**
     * Generate a key pair for encryption/decryption
     * @returns {Object} - Key pair with public and private keys
     */
    generateKeyPair() {
        // For demonstration, using simple key generation
        // In real applications, use proper cryptographic methods
        const publicKey = Math.floor(Math.random() * 10000) + 1000;
        const privateKey = Math.floor(Math.random() * 10000) + 1000;

        return {
            publicKey: BigInt(publicKey),
            privateKey: BigInt(privateKey)
        };
    },

    /**
     * Encrypt data using Karatsuba multiplication
     * @param {string} data - Data to encrypt
     * @param {BigInt} key - Encryption key
     * @returns {string} - Encrypted data as hexadecimal string
     */
    encrypt(data, key) {
        const startTime = performance.now();

        // Convert string to numeric representation
        const numericData = this._stringToNumeric(data);

        // Encrypt using Karatsuba multiplication
        const encryptedChunks = [];
        for (const chunk of numericData) {
            const encrypted = this.multiply(chunk, key);
            encryptedChunks.push(encrypted.toString(16)); // Convert to hex
        }

        const endTime = performance.now();
        this.lastEncryptionTime = endTime - startTime;

        return encryptedChunks.join(':');
    },

    /**
     * Decrypt data using Karatsuba multiplication
     * @param {string} encryptedData - Encrypted data as hexadecimal string
     * @param {BigInt} key - Decryption key
     * @returns {string} - Decrypted string
     */
    decrypt(encryptedData, key) {
        const startTime = performance.now();

        const encryptedChunks = encryptedData.split(':');
        const decryptedChunks = [];

        for (const hexChunk of encryptedChunks) {
            // Handle negative hex values properly
            let encryptedValue;
            if (hexChunk.startsWith('-')) {
                encryptedValue = -BigInt('0x' + hexChunk.substring(1));
            } else {
                encryptedValue = BigInt('0x' + hexChunk);
            }

            // Important: DIVIDE by the key instead of multiplying again
            const decrypted = encryptedValue / key;
            decryptedChunks.push(decrypted);
        }

        const result = this._numericToString(decryptedChunks);

        const endTime = performance.now();
        this.lastDecryptionTime = endTime - startTime;

        return result;
    },

    /**
     * Convert string to array of numeric values
     * @param {string} str - Input string
     * @returns {Array<BigInt>} - Array of numeric values
     * @private
     */
    _stringToNumeric(str) {
        const chunks = [];
        for (let i = 0; i < str.length; i++) {
            chunks.push(BigInt(str.charCodeAt(i)));
        }
        return chunks;
    },

    /**
     * Convert array of numeric values back to string
     * @param {Array<BigInt>} nums - Array of numeric values
     * @returns {string} - Resulting string
     * @private
     */
    _numericToString(nums) {
        let result = '';
        for (let num of nums) {
            // Divide by the key value used during encryption
            // and ensure we're in the valid character code range
            result += String.fromCharCode(Number(num) & 0xFFFF);
        }
        return result;
    },

    /**
     * Benchmark the algorithm with provided data
     * @param {string} data - Data for benchmarking
     * @returns {Object} - Benchmark results
     */
    benchmark(data) {
        const keyPair = this.generateKeyPair();
        const startTime = performance.now();

        // Measure encryption
        const encrypted = this.encrypt(data, keyPair.publicKey);
        const encryptionTime = this.lastEncryptionTime;

        // Measure decryption
        const decrypted = this.decrypt(encrypted, keyPair.privateKey);
        const decryptionTime = this.lastDecryptionTime;

        // Calculate memory usage (approximate)
        const memorySizeMB = (encrypted.length * 2) / (1024 * 1024);

        return {
            algorithm: this.fullName,
            encryptionTime,
            decryptionTime,
            totalTime: encryptionTime + decryptionTime,
            encrypted: encrypted.substring(0, 100) + (encrypted.length > 100 ? '...' : ''),
            decrypted: decrypted.substring(0, 100) + (decrypted.length > 100 ? '...' : ''),
            memorySizeMB,
            timeComplexity: this.timeComplexity,
            spaceComplexity: this.spaceComplexity,
            securityLevel: this.securityLevel
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Karatsuba;
}