/**
 * Benchmarking utility for encryption algorithms
 * Provides tools to measure and compare performance, security, and resource usage
 */

const Benchmarking = (function() {
    // Store all available algorithms
    const algorithms = [Karatsuba, ToomCook, SchonhageStrassen];
    
    // Store benchmark results
    let results = [];
    
    /**
     * Generate random data of specified size
     * @param {number} sizeInBytes - Size of data to generate in bytes
     * @returns {string} - Random data string
     */
    function generateRandomData(sizeInBytes) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
        let result = '';
        
        // Generate random characters to reach desired byte size
        for (let i = 0; i < sizeInBytes; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
    
    /**
     * Run a single benchmark test on one algorithm
     * @param {Object} algorithm - The algorithm object to benchmark
     * @param {string} data - Data to use for the benchmark
     * @param {string} testType - Type of test (encrypt, decrypt, or both)
     * @returns {Object} - Benchmark results
     */
    function runSingleBenchmark(algorithm, data, testType) {
        try {
            console.log(`Running benchmark for ${algorithm.name}...`);
            const keyPair = algorithm.generateKeyPair();
            let encryptionTime = 0, decryptionTime = 0;
            let encrypted = '', decrypted = '';
            
            // Memory usage estimation
            const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Run the appropriate test based on testType
            if (testType === 'encrypt' || testType === 'both') {
                const startEncrypt = performance.now();
                encrypted = algorithm.encrypt(data, keyPair.publicKey);
                const endEncrypt = performance.now();
                encryptionTime = endEncrypt - startEncrypt;
            }
            
            if (testType === 'decrypt' || testType === 'both') {
                // If we're only testing decryption, we still need to encrypt first
                if (testType === 'decrypt') {
                    encrypted = algorithm.encrypt(data, keyPair.publicKey);
                }
                
                const startDecrypt = performance.now();
                decrypted = algorithm.decrypt(encrypted, keyPair.privateKey);
                const endDecrypt = performance.now();
                decryptionTime = endDecrypt - startDecrypt;
            }
            
            const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryUsage = (memoryAfter - memoryBefore) / (1024 * 1024); // in MB
            
            // Verify decryption worked correctly if applicable
            let decryptionSuccess = true;
            if (testType === 'both' || testType === 'decrypt') {
                decryptionSuccess = decrypted.substring(0, data.length) === data;
            }
            
            // Calculate memory usage (approximate)
            const memorySizeMB = (encrypted.length * 2) / (1024 * 1024);
            
            return {
                algorithm: algorithm.fullName,
                encryptionTime,
                decryptionTime,
                totalTime: encryptionTime + decryptionTime,
                encrypted: encrypted.substring(0, 100) + (encrypted.length > 100 ? '...' : ''),
                decrypted: decrypted.substring(0, 100) + (decrypted.length > 100 ? '...' : ''),
                decryptionSuccess,
                memorySizeMB,
                memoryUsage: memoryUsage > 0 ? memoryUsage : memorySizeMB, // Fallback if performance.memory is not available
                timeComplexity: algorithm.timeComplexity,
                spaceComplexity: algorithm.spaceComplexity,
                securityLevel: algorithm.securityLevel,
                description: algorithm.description
            };
        } catch (error) {
            console.error(`Error benchmarking ${algorithm.name}:`, error);
            return {
                algorithm: algorithm.fullName,
                error: error.message
            };
        }
    }
    
    /**
     * Run benchmarks on all algorithms
     * @param {string} data - Data to use for benchmarking
     * @param {string} testType - Type of test (encrypt, decrypt, or both)
     * @returns {Array} - Array of benchmark results
     */
    function runBenchmarks(data, testType) {
        results = [];
        
        for (const algorithm of algorithms) {
            const result = runSingleBenchmark(algorithm, data, testType);
            results.push(result);
        }
        
        return results;
    }
    
    /**
     * Display benchmark results in the UI
     */
    function displayResults() {
        if (results.length === 0) {
            console.error('No benchmark results to display');
            return;
        }
        
        // Display performance results
        displayPerformanceResults();
        
        // Display security analysis
        displaySecurityAnalysis();
        
        // Display resource consumption
        displayResourceConsumption();
    }
    
    /**
     * Display performance benchmark results
     */
    function displayPerformanceResults() {
        // Update performance table
        const tableBody = document.querySelector('#performance-table tbody');
        tableBody.innerHTML = '';
        
        for (const result of results) {
            const row = document.createElement('tr');
            
            // Skip if there was an error
            if (result.error) {
                row.innerHTML = `
                    <td>${result.algorithm}</td>
                    <td colspan="3">Error: ${result.error}</td>
                `;
                tableBody.appendChild(row);
                continue;
            }
            
            row.innerHTML = `
                <td>${result.algorithm}</td>
                <td>${result.encryptionTime.toFixed(2)}</td>
                <td>${result.decryptionTime.toFixed(2)}</td>
                <td>${result.totalTime.toFixed(2)}</td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Create performance chart
        const ctx = document.getElementById('performance-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.performanceChart instanceof Chart) {
            window.performanceChart.destroy();
        }
        
        window.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: results.map(r => r.algorithm),
                datasets: [
                    {
                        label: 'Encryption Time (ms)',
                        data: results.map(r => r.encryptionTime),
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Decryption Time (ms)',
                        data: results.map(r => r.decryptionTime),
                        backgroundColor: 'rgba(153, 102, 255, 0.7)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Algorithm'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Encryption/Decryption Performance'
                    },
                    tooltip: {
                        callbacks: {
                            footer: (tooltipItems) => {
                                const result = results[tooltipItems[0].dataIndex];
                                return `Total Time: ${result.totalTime.toFixed(2)} ms`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Display security analysis results
     */
    function displaySecurityAnalysis() {
        // Update security details
        const securityDetails = document.getElementById('security-details');
        securityDetails.innerHTML = '';
        
        for (const result of results) {
            if (result.error) continue;
            
            const securityCard = document.createElement('div');
            securityCard.className = 'security-card';
            securityCard.innerHTML = `
                <h4>${result.algorithm}</h4>
                <div class="security-level">
                    <strong>Security Level:</strong> 
                    <span class="security-badge ${result.securityLevel.toLowerCase()}">${result.securityLevel}</span>
                </div>
                <p>${result.description}</p>
                <div class="complexity">
                    <div><strong>Time Complexity:</strong> ${result.timeComplexity}</div>
                    <div><strong>Space Complexity:</strong> ${result.spaceComplexity}</div>
                </div>
            `;
            
            securityDetails.appendChild(securityCard);
        }
        
        // Create security chart
        const ctx = document.getElementById('security-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.securityChart instanceof Chart) {
            window.securityChart.destroy();
        }
        
        const securityLevels = {
            'Low': 1,
            'Medium': 2,
            'High': 3,
            'Very High': 4
        };
        
        window.securityChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Security Level', 'Speed (Inverse of Total Time)', 'Memory Efficiency (Inverse of Usage)'],
                datasets: results.map((result, index) => {
                    // Skip if there was an error
                    if (result.error) return null;
                    
                    // Calculate normalized values
                    const securityValue = securityLevels[result.securityLevel] || 2;
                    
                    // Find max time for normalization
                    const maxTime = Math.max(...results.filter(r => !r.error).map(r => r.totalTime));
                    const speedValue = maxTime === 0 ? 1 : (maxTime - result.totalTime) / maxTime * 3 + 1;
                    
                    // Find max memory for normalization
                    const maxMemory = Math.max(...results.filter(r => !r.error).map(r => r.memorySizeMB));
                    const memoryValue = maxMemory === 0 ? 1 : (maxMemory - result.memorySizeMB) / maxMemory * 3 + 1;
                    
                    const colors = [
                        ['rgba(255, 99, 132, 0.7)', 'rgba(255, 99, 132, 1)'],
                        ['rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 1)'],
                        ['rgba(255, 206, 86, 0.7)', 'rgba(255, 206, 86, 1)']
                    ][index % 3];
                    
                    return {
                        label: result.algorithm,
                        data: [securityValue, speedValue, memoryValue],
                        backgroundColor: colors[0],
                        borderColor: colors[1],
                        borderWidth: 1
                    };
                }).filter(Boolean) // Remove null entries
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 4,
                        ticks: {
                            stepSize: 1,
                            display: false
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Algorithm Comparison'
                    }
                }
            }
        });
    }
    
    /**
     * Display resource consumption results
     */
    function displayResourceConsumption() {
        // Update complexity table
        const complexityTable = document.getElementById('complexity-table');
        const tableBody = complexityTable.querySelector('tbody') || complexityTable.appendChild(document.createElement('tbody'));
        
        tableBody.innerHTML = '';
        
        for (const result of results) {
            if (result.error) continue;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.algorithm}</td>
                <td>${result.timeComplexity}</td>
                <td>${result.spaceComplexity}</td>
                <td>${result.memorySizeMB.toFixed(4)}</td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Create resources chart
        const ctx = document.getElementById('resources-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.resourcesChart instanceof Chart) {
            window.resourcesChart.destroy();
        }
        
        window.resourcesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: results.map(r => r.algorithm),
                datasets: [
                    {
                        label: 'Memory Usage (MB)',
                        data: results.map(r => r.memorySizeMB),
                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Algorithm'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Memory Usage Comparison'
                    }
                }
            }
        });
    }
    
    // Public API
    return {
        algorithms,
        generateRandomData,
        runBenchmarks,
        displayResults,
        getResults: () => results
    };
})();