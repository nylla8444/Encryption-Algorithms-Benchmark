/**
 * System.js - Handles user authentication with encryption/decryption
 * Demonstrates encryption algorithms in a real-world scenario
 */

document.addEventListener('DOMContentLoaded', async function () {
    // DOM Elements - Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // DOM Elements - Login
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginAlgorithm = document.getElementById('login-algorithm');

    // DOM Elements - Register
    const registerForm = document.getElementById('register-form');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerAlgorithm = document.getElementById('register-algorithm');

    // DOM Elements - Results
    const securityLevelDisplay = document.getElementById('security-level');
    const timeComplexityDisplay = document.getElementById('time-complexity');

    // DOM Elements - Data Display
    const originalDataDisplay = document.getElementById('original-data');
    const encryptedDataDisplay = document.getElementById('encrypted-data');
    const decryptedDataDisplay = document.getElementById('decrypted-data');

    // Chart containers
    const statsChartCanvas = document.getElementById('stats-chart');

    // Database elements
    const usersTableBody = document.getElementById('users-table').querySelector('tbody');

    // Algorithm mapping
    const algorithmMap = {
        'karatsuba': Karatsuba,
        'toomcook': ToomCook,
        'schonhage': SchonhageStrassen
    };

    // Initialize user database from server or create empty one
    let userDatabase = await loadDatabase();

    // Update the users table
    updateUsersTable();

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Login form submission
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleLogin();
        });

        // Register form submission
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleRegistration();
        });
    }

    /**
     * Switch between tabs
     * @param {string} tabId - ID of tab to switch to
     */
    function switchTab(tabId) {
        // Update active tab button
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Show selected tab content
        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    /**
     * Handle login form submission
     */
    async function handleLogin() {
        const email = loginEmail.value;
        const password = loginPassword.value;

        // Find user in database
        const user = userDatabase.find(u => u.email === email);
        if (!user) {
            showNotification('User not found. Please register first.', 'error');
            return;
        }

        // Get algorithm from user's stored data
        const algorithmName = user.algorithm;
        const algorithm = algorithmMap[algorithmName];

        if (!algorithm) {
            showNotification('Error: Invalid encryption algorithm in user data', 'error');
            return;
        }

        try {
            // Display original password 
            originalDataDisplay.textContent = password;

            // Display encrypted password from database
            encryptedDataDisplay.textContent = user.encryptedPassword;

            // Start timing for decryption
            const startTime = performance.now();

            // Decrypt password with stored key
            const key = BigInt(user.key);
            const decryptedPassword = algorithm.decrypt(user.encryptedPassword, key);

            // Calculate decryption time
            const decryptionTime = performance.now() - startTime;
            algorithm.lastDecryptionTime = decryptionTime;

            // Display decrypted password
            decryptedDataDisplay.textContent = decryptedPassword;

            // Check if passwords match
            if (password === decryptedPassword) {
                showNotification('Login successful!', 'success');

                // Save decryption time to user data
                user.decryptionTime = decryptionTime;

                // Update user in database on server
                const updated = await updateUserDecryptionTime(user.email, decryptionTime);
                if (updated) {
                    console.log('Decryption time saved successfully!');
                }
                // Update the users table with the new decryption time
                updateUsersTable();

                updateAlgorithmDisplay(algorithm);
                drawLoginChart(algorithm, user.encryptionTime, decryptionTime);

                // Show radar chart comparison
                drawRadarChart(algorithm, user.encryptionTime, decryptionTime);
            } else {
                showNotification('Login failed. Incorrect password.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification(`Login error: ${error.message}`, 'error');
        }
    }

    /**
     * Update user decryption time in database
     * @param {string} email - User email
     * @param {number} decryptionTime - Time taken for decryption in ms
     * @returns {Promise<boolean>} - Promise resolving to success status
     */
    async function updateUserDecryptionTime(email, decryptionTime) {
        try {
            const response = await fetch(`/users/${encodeURIComponent(email)}/decryption-time`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ decryptionTime })
            });

            return response.ok;
        } catch (error) {
            console.error('Error updating decryption time:', error);
            return false;
        }
    }

    /**
     * Handle registration submission
     */
    async function handleRegistration() {
        const email = registerEmail.value;
        const password = registerPassword.value;
        const algorithmName = registerAlgorithm.value;

        // Check if user already exists
        if (userDatabase.some(u => u.email === email)) {
            showNotification('User already exists. Please use a different email.', 'error');
            return;
        }

        // Get algorithm object
        const algorithm = algorithmMap[algorithmName];

        if (!algorithm) {
            showNotification('Invalid algorithm selected.', 'error');
            return;
        }

        try {
            // Generate key pair for encryption
            const keyPair = algorithm.generateKeyPair();

            // Important: For these algorithms, we should use the same key for both encryption and decryption
            // Store the key we'll use for both operations
            const encryptionKey = keyPair.privateKey;

            // Display original password
            originalDataDisplay.textContent = password;

            // Measure encryption time
            const startTime = performance.now();

            // Encrypt the password with our key
            const encryptedPassword = algorithm.encrypt(password, encryptionKey);

            // Calculate encryption time
            const encryptionTime = performance.now() - startTime;

            // Display encrypted password only (not decryption during registration)
            encryptedDataDisplay.textContent = encryptedPassword;

            // Clear decryption display during registration
            decryptedDataDisplay.textContent = "Login to see decryption";

            // Create new user object - store the same key we used for encryption
            const newUser = {
                email,
                encryptedPassword,
                algorithm: algorithmName,
                key: encryptionKey.toString(),
                encryptionTime
            };

            // Add to database
            userDatabase.push(newUser);

            // Save to server
            const saved = await saveDatabase(userDatabase);

            if (saved) {
                showNotification('Registration successful!', 'success');
                updateUsersTable();
                updateAlgorithmDisplay(algorithm);

                // Only show encryption time in chart during registration
                const zeroDecryptTime = 0;
                drawRegistrationChart(algorithm, encryptionTime, zeroDecryptTime);

                // Show radar chart with only encryption data
                drawRadarChart(algorithm, encryptionTime, 0);

                // Clear the form
                registerForm.reset();
            } else {
                showNotification('Error saving user data.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification(`Registration error: ${error.message}`, 'error');
        }
    }

    /**
  * Update the users table with current database
  */
    function updateUsersTable() {
        // Clear the table
        usersTableBody.innerHTML = '';

        // Add each user
        userDatabase.forEach(user => {
            const row = document.createElement('tr');

            const emailCell = document.createElement('td');
            emailCell.textContent = user.email;

            const algorithmCell = document.createElement('td');
            const algoName = algorithmMap[user.algorithm] ?
                algorithmMap[user.algorithm].fullName : user.algorithm;
            algorithmCell.textContent = algoName;

            const encTimeCell = document.createElement('td');
            encTimeCell.textContent = `${user.encryptionTime.toFixed(2)} ms`;

            const decTimeCell = document.createElement('td');
            decTimeCell.textContent = user.decryptionTime ?
                `${user.decryptionTime.toFixed(2)} ms` : 'Not measured';

            row.appendChild(emailCell);
            row.appendChild(algorithmCell);
            row.appendChild(encTimeCell);
            row.appendChild(decTimeCell);

            usersTableBody.appendChild(row);
        });
    }

    /**
     * Update algorithm display with security info
     * @param {Object} algorithm - Algorithm object
     */
    function updateAlgorithmDisplay(algorithm) {
        securityLevelDisplay.textContent = algorithm.securityLevel;
        timeComplexityDisplay.textContent = algorithm.timeComplexity;
    }

    /**
     * Draw performance chart for algorithm during registration (encryption only)
     * @param {Object} algorithm - Algorithm object
     * @param {number} encryptionTime - Time taken for encryption 
     * @param {number} decryptionTime - Zero or minimal value for registration view
     */
    function drawRegistrationChart(algorithm, encryptionTime, decryptionTime) {
        // Check if chart already exists and destroy it
        if (window.statsChart) {
            window.statsChart.destroy();
        }

        // Create new chart with emphasis on encryption
        window.statsChart = new Chart(statsChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Encryption', 'Decryption'],
                datasets: [{
                    label: 'Time (ms)',
                    data: [encryptionTime, decryptionTime],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(220, 220, 220, 0.6)' // Gray for decryption (not relevant during registration)
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(200, 200, 200, 1)'
                    ],
                    borderWidth: 1
                }]
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
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${algorithm.fullName} Registration Performance`,
                        font: {
                            size: 16
                        }
                    },
                    subtitle: {
                        display: true,
                        text: `Time Complexity: ${algorithm.timeComplexity}`,
                        padding: {
                            bottom: 10
                        }
                    }
                }
            }
        });
    }

    /**
 * Draw performance chart for algorithm during login (showing both encryption and decryption)
 * @param {Object} algorithm - Algorithm object
 * @param {number} encryptionTime - Previously recorded encryption time
 * @param {number} decryptionTime - Current decryption time
 */
    function drawLoginChart(algorithm, encryptionTime, decryptionTime) {
        // Check if chart already exists and destroy it
        if (window.statsChart) {
            window.statsChart.destroy();
        }

        // Create new chart showing both times
        window.statsChart = new Chart(statsChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Encryption', 'Decryption'],
                datasets: [{
                    label: 'Time (ms)',
                    data: [encryptionTime, decryptionTime],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)', // Blue for encryption
                        'rgba(255, 99, 132, 0.6)'  // Red for decryption
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
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
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${algorithm.fullName} Authentication Performance`,
                        font: {
                            size: 16
                        }
                    },
                    subtitle: {
                        display: true,
                        text: `Time Complexity: ${algorithm.timeComplexity}`,
                        padding: {
                            bottom: 10
                        }
                    }
                }
            }
        });
    }

    /**
     * Draw radar chart comparing all algorithms
     * @param {Object} currentAlgorithm - Current algorithm being used
     * @param {number} encryptionTime - Encryption time of current algorithm
     * @param {number} decryptionTime - Decryption time of current algorithm
     */
    function drawRadarChart(currentAlgorithm, encryptionTime, decryptionTime) {
        // Check if chart already exists and destroy it
        if (window.radarChart) {
            window.radarChart.destroy();
        }

        // Security level mapping
        const securityLevels = {
            'Low': 1,
            'Medium': 2,
            'High': 3,
            'Very High': 4
        };

        // Fixed algorithm colors (match with CSS legend)
        const algoColors = {
            'karatsuba': ['rgba(255, 99, 132, 0.7)', 'rgba(255, 99, 132, 1)'],
            'toomcook': ['rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 1)'],
            'schonhage': ['rgba(255, 206, 86, 0.7)', 'rgba(255, 206, 86, 1)']
        };

        // Create a collection of algorithm performance data from the database
        const algoStats = {};

        // Initialize with all algorithms
        for (const algoName in algorithmMap) {
            algoStats[algoName] = {
                encryptionTimes: [],
                decryptionTimes: [],
                algorithm: algorithmMap[algoName]
            };
        }

        // Collect all algorithm stats from the database
        userDatabase.forEach(user => {
            const algoName = user.algorithm;

            // Skip if algorithm not in our map (shouldn't happen but just in case)
            if (!algoStats[algoName]) return;

            // Add times to our collection
            if (user.encryptionTime) {
                algoStats[algoName].encryptionTimes.push(user.encryptionTime);
            }

            if (user.decryptionTime) {
                algoStats[algoName].decryptionTimes.push(user.decryptionTime);
            }
        });

        // Also include the current algorithm's data if it's not in the database yet
        if (currentAlgorithm) {
            const algoName = Object.keys(algorithmMap).find(key => algorithmMap[key] === currentAlgorithm);
            if (algoName && encryptionTime) {
                algoStats[algoName].encryptionTimes.push(encryptionTime);
            }
            if (algoName && decryptionTime) {
                algoStats[algoName].decryptionTimes.push(decryptionTime);
            }
        }

        // Get maximum times from all data
        const maxEncTime = Math.max(
            ...Object.values(algoStats)
                .map(stats => stats.encryptionTimes.length > 0 ?
                    stats.encryptionTimes.reduce((a, b) => a + b, 0) / stats.encryptionTimes.length : 0)
        );

        const maxDecTime = Math.max(
            ...Object.values(algoStats)
                .map(stats => stats.decryptionTimes.length > 0 ?
                    stats.decryptionTimes.reduce((a, b) => a + b, 0) / stats.decryptionTimes.length : 0)
        );

        // Add data for each algorithm
        const algorithmData = [];

        for (const algoName in algoStats) {
            const stats = algoStats[algoName];
            const algo = stats.algorithm;

            // Calculate average times if we have data
            const encTimes = stats.encryptionTimes;
            const decTimes = stats.decryptionTimes;

            // Skip algorithms with no data
            if (encTimes.length === 0 && decTimes.length === 0) {
                continue;
            }

            // Calculate average times
            const avgEncTime = encTimes.length > 0 ?
                encTimes.reduce((a, b) => a + b, 0) / encTimes.length : 0;

            const avgDecTime = decTimes.length > 0 ?
                decTimes.reduce((a, b) => a + b, 0) / decTimes.length : 0;

            // Scale times relatively - faster gets higher score
            // Use inverse proportion to max times
            const encryptionScore = encTimes.length > 0 && maxEncTime > 0 ?
                1 + 3 * (1 - (avgEncTime / maxEncTime)) : 1;

            const decryptionScore = decTimes.length > 0 && maxDecTime > 0 ?
                1 + 3 * (1 - (avgDecTime / maxDecTime)) : 1;

            // Security level is directly mapped
            const securityScore = securityLevels[algo.securityLevel] || 2;

            algorithmData.push({
                label: algo.fullName,
                data: [securityScore, encryptionScore, decryptionScore],
                backgroundColor: algoColors[algoName][0],
                borderColor: algoColors[algoName][1],
                borderWidth: 1,
                pointRadius: 6,
                pointBackgroundColor: algoColors[algoName][1],
                pointHoverRadius: 8,
                pointHoverBackgroundColor: algoColors[algoName][1],
            });
        }

        // Create radar chart with larger font sizes and better visuals
        const radarCtx = document.getElementById('radar-chart').getContext('2d');
        window.radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Security Level', 'Encryption Speed', 'Decryption Speed'],
                datasets: algorithmData
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 4,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            showLabelBackdrop: false,
                            font: {
                                size: 14
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 25
                        },
                        grid: {
                            color: "rgba(0, 0, 0, 0.1)"
                        },
                        angleLines: {
                            color: "rgba(0, 0, 0, 0.2)"
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                const label = context.dataset.label;
                                const metric = context.label;

                                if (metric === 'Security Level') {
                                    const levels = ['', 'Low', 'Medium', 'High', 'Very High'];
                                    return `${label}: ${levels[Math.round(value)]}`;
                                } else {
                                    return `${label}: ${value.toFixed(2)} (higher is better)`;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Add a function to load the radar chart on initial page load
    function initializeRadarChart() {
        if (userDatabase.length === 0) return;

        drawRadarChart(null, 0, 0);
    }


    /**
     * Load database from server
     * @returns {Promise<Array>} - Promise resolving to user array
     */
    async function loadDatabase() {
        try {
            const response = await fetch('/users');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading database:', error);
            return [];
        }
    }

    /**
     * Save database to server
     * @param {Array} users - Array of user objects
     * @returns {Promise<boolean>} - Promise resolving to success status
     */
    async function saveDatabase(users) {
        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(users[users.length - 1])
            });

            return response.ok;
        } catch (error) {
            console.error('Error saving database:', error);
            return false;
        }
    }

    /**
     * Display a notification to the user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error)
     */
    function showNotification(message, type = 'success') {
        // Check if notification container exists
        let notificationContainer = document.querySelector('.notification-container');

        // Create container if it doesn't exist
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add click event to dismiss notification
        notification.addEventListener('click', function () {
            this.remove();
        });

        // Add notification to container
        notificationContainer.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Initialize by setting up event listeners
    setupEventListeners();

    // Switch to login tab initially
    switchTab('login');


    // Initialize radar chart with existing database data
    initializeRadarChart();
});