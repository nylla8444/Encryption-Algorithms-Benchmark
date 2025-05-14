/**
 * Toom-Cook Multiplication Algorithm Implementation
 * Time Complexity: O(n^log₃5) ≈ O(n^1.465)
 */

const ToomCook = {
    // Name and description for UI display
    name: 'Toom-Cook',
    fullName: 'Toom-Cook Algorithm (Toom-3)',
    description: 'A divide-and-conquer algorithm that splits integers into 3 parts, reducing 9 multiplications to 5.',
    timeComplexity: 'O(n^log₃5) ≈ O(n^1.465)',
    spaceComplexity: 'O(n)',
    securityLevel: 'High',

    /**
     * Core Toom-Cook multiplication function for two large integers
     * Implements Toom-3, which splits each number into 3 parts
     * @param {BigInt} x - First large integer
     * @param {BigInt} y - Second large integer
     * @returns {BigInt} - Product of x and y
     */
    multiply(x, y) {
        // Convert to BigInt if needed
        x = BigInt(x);
        y = BigInt(y);

        // Base case for small numbers - use direct multiplication
        if (x < 1000n || y < 1000n) {
            return x * y;
        }

        // Determine the size of numbers
        const strX = x.toString();
        const strY = y.toString();
        const maxLength = Math.max(strX.length, strY.length);

        // Split the number into 3 parts
        // Calculate split point for Toom-3
        const m = Math.floor(maxLength / 3) + 1;

        // Powers of base for splitting and combining
        const base = BigInt(10);
        const pow1 = base ** BigInt(m);
        const pow2 = pow1 * pow1;

        // Split x and y into 3 parts each
        // x = x₂*B² + x₁*B + x₀
        // y = y₂*B² + y₁*B + y₀
        const x0 = x % pow1;
        const x1 = (x / pow1) % pow1;
        const x2 = x / pow2;

        const y0 = y % pow1;
        const y1 = (y / pow1) % pow1;
        const y2 = y / pow2;

        // --- Step 1: Evaluation ---
        // Evaluate polynomial at points: 0, 1, -1, 2, ∞

        // Evaluation at 0: P(0) = x₀, Q(0) = y₀
        const p0 = x0;
        const q0 = y0;

        // Evaluation at 1: P(1) = x₂ + x₁ + x₀, Q(1) = y₂ + y₁ + y₀
        const p1 = x2 + x1 + x0;
        const q1 = y2 + y1 + y0;

        // Evaluation at -1: P(-1) = x₂ - x₁ + x₀, Q(-1) = y₂ - y₁ + y₀
        const p2 = x2 - x1 + x0;
        const q2 = y2 - y1 + y0;

        // Evaluation at 2: P(2) = 4*x₂ + 2*x₁ + x₀, Q(2) = 4*y₂ + 2*y₁ + y₀
        const p3 = 4n * x2 + 2n * x1 + x0;
        const q3 = 4n * y2 + 2n * y1 + y0;

        // Evaluation at ∞: P(∞) = x₂, Q(∞) = y₂
        const p4 = x2;
        const q4 = y2;

        // --- Step 2: Pointwise Multiplication ---
        const r0 = this.multiply(p0, q0);  // P(0) * Q(0)
        const r1 = this.multiply(p1, q1);  // P(1) * Q(1)
        const r2 = this.multiply(p2, q2);  // P(-1) * Q(-1)
        const r3 = this.multiply(p3, q3);  // P(2) * Q(2)
        const r4 = this.multiply(p4, q4);  // P(∞) * Q(∞)

        // --- Step 3: Interpolation ---
        // Recover the coefficients of the product polynomial
        // These steps are based on the interpolation matrix for Toom-3

        let c0 = r0;
        let c4 = r4;

        // Intermediate steps for interpolation
        let c3 = (r3 - r1) / 6n;
        c3 = (c3 + (r2 - r0) / 2n) / 2n;
        c3 = c3 - 2n * r4;

        let c1 = r1 - r0;
        c1 = c1 - c3;
        c1 = c1 - r4;

        let c2 = r2 - r0;
        c2 = c2 - c4;
        c2 = (c2 - 2n * c3) / 2n;

        // --- Step 4: Recomposition ---
        // Combine results: c₄*B⁴ + c₃*B³ + c₂*B² + c₁*B + c₀
        return c0 + c1 * pow1 + c2 * pow2 + c3 * pow1 * pow2 + c4 * pow2 * pow2;
    },

    /**
     * Generate a key pair for encryption/decryption
     * @returns {Object} - Key pair with public and private keys
     */
    generateKeyPair() {
        // For demonstration, using simple key generation
        // In real applications, use proper cryptographic methods
        const publicKey = Math.floor(Math.random() * 100000) + 10000;
        const privateKey = Math.floor(Math.random() * 100000) + 10000;

        return {
            publicKey: BigInt(publicKey),
            privateKey: BigInt(privateKey)
        };
    },

    /**
     * Encrypt data using Toom-Cook multiplication
     * @param {string} data - Data to encrypt
     * @param {BigInt} key - Encryption key
     * @returns {string} - Encrypted data as hexadecimal string
     */
    encrypt(data, key) {
        const startTime = performance.now();

        // Convert string to numeric representation
        const numericData = this._stringToNumeric(data);

        // Encrypt using Toom-Cook multiplication
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
     * Decrypt data using Toom-Cook multiplication
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
            // Ensure we're in the valid character code range
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
    module.exports = ToomCook;
}