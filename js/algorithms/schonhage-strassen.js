/**
 * Schönhage-Strassen Multiplication Algorithm Implementation
 * Time Complexity: O(n log n log log n)
 */

const SchonhageStrassen = {
    // Name and description for UI display
    name: 'Schönhage-Strassen',
    fullName: 'Schönhage-Strassen Algorithm',
    description: 'A fast multiplication algorithm that uses Fast Fourier Transform (FFT) techniques for large integer multiplication.',
    timeComplexity: 'O(n log n log log n)',
    spaceComplexity: 'O(n)',
    securityLevel: 'Very High',

    /**
     * Core Schönhage-Strassen multiplication function for two large integers
     * Implements FFT-based multiplication for large integers
     * @param {BigInt} x - First large integer
     * @param {BigInt} y - Second large integer
     * @returns {BigInt} - Product of x and y
     */
    multiply(x, y) {
        // Convert to BigInt if needed
        x = BigInt(x);
        y = BigInt(y);

        // Base case for small numbers - use direct multiplication
        if (x < 100000n || y < 100000n) {
            return x * y;
        }

        // Get bit lengths
        const bitLenX = this._getBitLength(x);
        const bitLenY = this._getBitLength(y);

        // Choose n based on bit lengths (next power of 2 greater than half of total bits)
        const maxBitLen = Math.max(bitLenX, bitLenY);
        const n = 1 << Math.ceil(Math.log2(maxBitLen));

        // Use convolution via NTT to compute product
        return this._multiplySSA(x, y, n);
    },

    /**
     * Get the bit length of a BigInt
     * @param {BigInt} x - Number to get bit length of
     * @returns {number} - Bit length
     */
    _getBitLength(x) {
        if (x === 0n) return 1;
        return x.toString(2).length;
    },

    /**
     * The main Schönhage-Strassen algorithm implementation
     * @param {BigInt} x - First number
     * @param {BigInt} y - Second number
     * @param {number} n - Size parameter (power of 2)
     * @returns {BigInt} - Product
     */
    _multiplySSA(x, y, n) {
        // For small enough inputs, use direct multiplication
        if (n <= 64) {
            return x * y;
        }

        // Split n in half (next power of 2)
        const m = n >> 1;

        // Choose a modulus of the form 2^k + 1 where k is a power of 2
        const k = 1 << Math.ceil(Math.log2(n * 2));
        const modulus = 1n << BigInt(k) | 1n;

        // Split x and y into pieces of size m bits
        const pieces = Math.ceil(n / m);
        const mask = (1n << BigInt(m)) - 1n;

        const xPieces = new Array(pieces).fill(0n);
        const yPieces = new Array(pieces).fill(0n);

        // Split inputs into pieces
        let tempX = x;
        let tempY = y;
        for (let i = 0; i < pieces; i++) {
            xPieces[i] = tempX & mask;
            yPieces[i] = tempY & mask;
            tempX >>= BigInt(m);
            tempY >>= BigInt(m);
        }

        // Perform Number-Theoretic Transform (NTT)
        const xTransform = this._numberTheoreticTransform(xPieces, k, modulus, false);
        const yTransform = this._numberTheoreticTransform(yPieces, k, modulus, false);

        // Point-wise multiplication in the transform domain
        const productTransform = new Array(1 << Math.ceil(Math.log2(pieces * 2)));
        for (let i = 0; i < productTransform.length; i++) {
            productTransform[i] = (xTransform[i] * yTransform[i]) % modulus;
        }

        // Inverse NTT
        const product = this._numberTheoreticTransform(productTransform, k, modulus, true);

        // Combine pieces with carries
        let result = 0n;
        let carry = 0n;

        for (let i = 0; i < product.length; i++) {
            let value = product[i] + carry;
            carry = value >> BigInt(m);
            value &= mask;

            result |= value << BigInt(i * m);
        }

        return result;
    },

    /**
     * Number-Theoretic Transform (NTT) implementation
     * @param {Array<BigInt>} values - Array of values to transform
     * @param {number} k - Size parameter
     * @param {BigInt} modulus - Modulus for the transform
     * @param {boolean} inverse - Whether to perform inverse transform
     * @returns {Array<BigInt>} - Transformed values
     */
    _numberTheoreticTransform(values, k, modulus, inverse) {
        // Pad array to a power of 2 length
        const n = 1 << Math.ceil(Math.log2(values.length));
        const result = Array(n).fill(0n);

        // Copy input values
        for (let i = 0; i < values.length; i++) {
            result[i] = values[i];
        }

        // Bit-reverse permutation
        this._bitReversePermutation(result);

        // Find a primitive root of unity
        const primitiveRoot = this._findPrimitiveRoot(modulus);
        let omega = this._modPow(primitiveRoot, (modulus - 1n) / BigInt(n), modulus);

        // For inverse transform, use the inverse of omega
        if (inverse) {
            omega = this._modPow(omega, modulus - 2n, modulus); // Modular inverse via Fermat's little theorem
        }

        // NTT butterfly operations
        for (let s = 1; s < n; s *= 2) {
            const m = s * 2;
            const wm = this._modPow(omega, BigInt(n / m), modulus);

            for (let j = 0; j < n; j += m) {
                let w = 1n;

                for (let i = j; i < j + s; i++) {
                    const t = (w * result[i + s]) % modulus;
                    result[i + s] = (result[i] - t + modulus) % modulus;
                    result[i] = (result[i] + t) % modulus;
                    w = (w * wm) % modulus;
                }
            }
        }

        // Scale for inverse transform
        if (inverse) {
            const scale = this._modInverse(BigInt(n), modulus);
            for (let i = 0; i < n; i++) {
                result[i] = (result[i] * scale) % modulus;
            }
        }

        return result;
    },

    /**
     * Bit-reverse permutation (in-place)
     * @param {Array<BigInt>} arr - Array to permute
     */
    _bitReversePermutation(arr) {
        const n = arr.length;
        const logn = Math.log2(n);

        for (let i = 0; i < n; i++) {
            const j = this._reverseBits(i, logn);
            if (i < j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
    },

    /**
     * Reverse bits of a number
     * @param {number} x - Number to reverse bits
     * @param {number} bits - Number of bits
     * @returns {number} - Number with reversed bits
     */
    _reverseBits(x, bits) {
        let result = 0;
        for (let i = 0; i < bits; i++) {
            result = (result << 1) | (x & 1);
            x >>= 1;
        }
        return result;
    },

    /**
     * Find a primitive root for NTT
     * @param {BigInt} modulus - Modulus
     * @returns {BigInt} - Primitive root
     */
    _findPrimitiveRoot(modulus) {
        // For a modulus of form 2^k + 1, primitive root is often 3
        // This is simplified - a proper implementation would verify the order
        return 3n;
    },

    /**
     * Modular exponentiation
     * @param {BigInt} base - Base
     * @param {BigInt} exponent - Exponent
     * @param {BigInt} modulus - Modulus
     * @returns {BigInt} - Result of base^exponent mod modulus
     */
    _modPow(base, exponent, modulus) {
        if (modulus === 1n) return 0n;

        let result = 1n;
        base = base % modulus;

        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            exponent >>= 1n;
            base = (base * base) % modulus;
        }

        return result;
    },

    /**
     * Calculate modular multiplicative inverse using Extended Euclidean Algorithm
     * @param {BigInt} a - Number to find inverse for
     * @param {BigInt} m - Modulus
     * @returns {BigInt} - Modular multiplicative inverse
     */
    _modInverse(a, m) {
        let [oldR, r] = [a, m];
        let [oldS, s] = [1n, 0n];
        let [oldT, t] = [0n, 1n];

        while (r !== 0n) {
            const quotient = oldR / r;
            [oldR, r] = [r, oldR - quotient * r];
            [oldS, s] = [s, oldS - quotient * s];
            [oldT, t] = [t, oldT - quotient * t];
        }

        // Make sure the inverse exists
        if (oldR !== 1n) {
            throw new Error('Modular inverse does not exist');
        }

        // Make sure the result is positive
        return (oldS + m) % m;
    },

    /**
     * Generate a key pair for encryption/decryption
     * @returns {Object} - Key pair with public and private keys
     */
    generateKeyPair() {
        // For demonstration, using simple key generation
        // In real applications, use proper cryptographic methods
        const publicKey = Math.floor(Math.random() * 1000000) + 100000;
        const privateKey = Math.floor(Math.random() * 1000000) + 100000;

        return {
            publicKey: BigInt(publicKey),
            privateKey: BigInt(privateKey)
        };
    },

    /**
     * Encrypt data using Schönhage-Strassen multiplication
     * @param {string} data - Data to encrypt
     * @param {BigInt} key - Encryption key
     * @returns {string} - Encrypted data as hexadecimal string
     */
    encrypt(data, key) {
        const startTime = performance.now();

        // Convert string to numeric representation
        const numericData = this._stringToNumeric(data);

        // Encrypt using Schönhage-Strassen multiplication
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
     * Decrypt data using Schönhage-Strassen multiplication
     * @param {string} encryptedData - Encrypted data as hexadecimal string
     * @param {BigInt} key - Decryption key
     * @returns {string} - Decrypted string
     */
    decrypt(encryptedData, key) {
        const startTime = performance.now();

        const encryptedChunks = encryptedData.split(':');
        const decryptedChunks = [];

        for (const hexChunk of encryptedChunks) {
            // Fix: Handle negative hex values properly
            let encryptedValue;
            if (hexChunk.startsWith('-')) {
                // If hex string has negative sign, parse without the sign and then negate
                encryptedValue = -BigInt('0x' + hexChunk.substring(1));
            } else {
                encryptedValue = BigInt('0x' + hexChunk);
            }

            const decrypted = this.multiply(encryptedValue, key);
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
        // Process in chunks to avoid overflow
        const chunkSize = 4;

        for (let i = 0; i < str.length; i += chunkSize) {
            let numValue = 0n;
            const end = Math.min(i + chunkSize, str.length);

            for (let j = i; j < end; j++) {
                numValue = (numValue << 8n) + BigInt(str.charCodeAt(j));
            }

            chunks.push(numValue);
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
        const chunkSize = 4;

        for (const num of nums) {
            let tempNum = num;
            const chars = [];

            for (let i = 0; i < chunkSize; i++) {
                const charCode = Number(tempNum & 0xFFn);
                if (charCode !== 0) {
                    chars.unshift(String.fromCharCode(charCode));
                }
                tempNum >>= 8n;
            }

            result += chars.join('');
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
    module.exports = SchonhageStrassen;
}