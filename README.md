# Enhancing Data Security through Encryption

A web-based tool for comparing the performance, security, and resource consumption of different encryption algorithms.

## Overview

This project implements and compares three advanced multiplication algorithms used in cryptography:

- **Karatsuba Algorithm**: O(n^1.585)
- **Toom-Cook Algorithm**: O(n^1.465)
- **Schönhage-Strassen Algorithm**: O(n log n log log n)

The application provides interactive visualizations and performance metrics to help understand the trade-offs between these algorithms in terms of speed, security level, and resource consumption.

## Live Demo

Visit the [live demo](https://github.com/nylla8444/Encryption-Algorithms-Benchmark) to try the application without installation.

## Installation

### Option 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/nylla8444/Encryption-Algorithms-Benchmark.git

# Navigate to the project directory
cd Encryption-Algorithms-Benchmark
```

### Option 2: Download as ZIP

1. Visit https://github.com/nylla8444/Encryption-Algorithms-Benchmark
2. Click the "Code" button and select "Download ZIP"
3. Extract the ZIP file to your preferred location

## Running the Application

1. Open the `index.html` file in your web browser
   - For best results, use Chrome, Firefox, or Edge
   - Note: Due to JavaScript's security model, you may need to use a local server for all features to work correctly
   
2. To run with a local server:
   ```bash
   # If you have Python installed
   python -m http.server
   
   # Or with Node.js
   npx serve

   # OR with Live Server in VSCode
   ```
   Then navigate to `http://localhost:8000` (Python) or `http://localhost:3000` (Node.js)

## Using the Application

1. **Input Data**: 
   - Enter text in the input area or generate random data of different sizes
   - Select data size from the dropdown (1KB to 1MB)

2. **Running Tests**:
   - Choose test type: Encryption, Decryption, or Both
   - Click "Run Benchmark" to start performance measurement

3. **Viewing Results**:
   - **Performance**: Compare encryption and decryption times
   - **Security Level**: Visual comparison of security attributes
   - **Resource Consumption**: Memory usage and complexity analysis

## Algorithm Information

### Karatsuba Multiplication
- **Time Complexity**: O(n^log₂3) ≈ O(n^1.585)
- **Security Level**: Medium
- A divide-and-conquer algorithm that reduces multiplication of two n-digit numbers to three multiplications of n/2-digit numbers

### Toom-Cook Multiplication (Toom-3)
- **Time Complexity**: O(n^log₃5) ≈ O(n^1.465) 
- **Security Level**: High
- Further improves Karatsuba by splitting numbers into 3 parts, reducing 9 multiplications to 5

### Schönhage-Strassen Algorithm
- **Time Complexity**: O(n log n log log n)
- **Security Level**: Very High
- Uses Fast Fourier Transform (FFT) techniques for integer multiplication

## Technical Details

- Pure JavaScript implementation
- Uses BigInt for handling large integers
- Chart.js for visualizations
- No external dependencies besides Chart.js
- Responsive design with CSS

## Educational Purpose

This project is designed for educational purposes to demonstrate:

1. Different multiplication algorithms and their performance characteristics
2. How these algorithms can be applied to encryption
3. Performance benchmarking techniques in JavaScript

## Contributors

- This project was created as part of the Algorithm & Complexity final project

## License

MIT License - See LICENSE file for details