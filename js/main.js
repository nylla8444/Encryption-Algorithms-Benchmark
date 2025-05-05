/**
 * Main JavaScript file for the Encryption Algorithm Comparison application
 * Handles UI interactions and initializes the application
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const inputDataTextarea = document.getElementById('input-data');
    const dataSizeSelect = document.getElementById('data-size');
    const testTypeSelect = document.getElementById('test-type');
    const generateDataButton = document.getElementById('generate-data');
    const startBenchmarkButton = document.getElementById('start-benchmark');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize performance.memory if it doesn't exist (for browsers that don't support it)
    if (!performance.memory) {
        performance.memory = { 
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
        };
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Generate random data button
        generateDataButton.addEventListener('click', function() {
            const size = parseInt(dataSizeSelect.value);
            const randomData = Benchmarking.generateRandomData(size);
            inputDataTextarea.value = randomData;
            
            // Show notification
            showNotification(`Generated ${(size / 1024).toFixed(1)} KB of random data`);
        });
        
        // Start benchmark button
        startBenchmarkButton.addEventListener('click', function() {
            const data = inputDataTextarea.value;
            if (!data) {
                showNotification('Please enter or generate data first', 'error');
                return;
            }
            
            const testType = testTypeSelect.value;
            runBenchmarks(data, testType);
        });
        
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }
    
    /**
     * Run benchmarks with the provided data
     * @param {string} data - Data to use for benchmarking
     * @param {string} testType - Type of test (encrypt, decrypt, or both)
     */
    function runBenchmarks(data, testType) {
        showNotification(`Running benchmarks (${testType})...`, 'info');
        startBenchmarkButton.disabled = true;
        generateDataButton.disabled = true;
        
        // Use setTimeout to allow the UI to update before starting potentially long calculations
        setTimeout(() => {
            try {
                // Run the benchmarks
                const results = Benchmarking.runBenchmarks(data, testType);
                
                // Display the results
                Benchmarking.displayResults();
                
                showNotification('Benchmark completed successfully');
                
                // Switch to performance tab to show results
                switchTab('performance');
            } catch (error) {
                console.error('Error during benchmarking:', error);
                showNotification('Error running benchmarks: ' + error.message, 'error');
            } finally {
                startBenchmarkButton.disabled = false;
                generateDataButton.disabled = false;
            }
        }, 100);
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
     * Display a notification to the user
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (info, error, success)
     */
    function showNotification(message, type = 'success') {
        // Check if notification container exists
        let notificationContainer = document.querySelector('.notification-container');
        
        // Create container if it doesn't exist
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
            
            // Add styles for notification container
            const style = document.createElement('style');
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                .notification {
                    padding: 12px 20px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    color: white;
                    width: 300px;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.16);
                    animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-out 2.5s forwards;
                    cursor: pointer;
                }
                .notification.success { background-color: #2c5364; }
                .notification.error { background-color: #e74c3c; }
                .notification.info { background-color: #3498db; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; visibility: hidden; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add click event to dismiss notification
        notification.addEventListener('click', function() {
            this.remove();
        });
        
        // Add notification to container
        notificationContainer.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Initialize the application
     */
    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Generate a small sample of data to start with
        inputDataTextarea.value = "This is a sample text to encrypt and decrypt using the different algorithms. Edit this text or generate a larger random data sample for more accurate benchmarking.";
        
        // Show a welcome notification
        showNotification('Welcome to the Encryption Algorithm Comparison Tool', 'info');
    }
    
    // Initialize the application
    init();
});