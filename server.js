const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`[DEBUG] Request received: ${req.method} ${req.url}`);
    next();
});

// Important: Serve static files BEFORE defining API routes
app.use(express.static(path.join(__dirname)));

// Path to the database file
const DB_PATH = path.join(__dirname, 'database', 'db.json');

// Ensure database folder exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Ensure database file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }), 'utf8');
}

// Read database
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: [] };
    }
}

// Write to database
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing to database:', error);
        return false;
    }
}

// API endpoints for /api/users
app.get('/api/users', (req, res) => {
    const db = readDatabase();
    res.json(db.users);
});

app.post('/api/users', (req, res) => {
    const db = readDatabase();
    const newUser = req.body;

    // Check if user already exists
    const existingUser = db.users.find(user => user.email === newUser.email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    db.users.push(newUser);

    if (writeDatabase(db)) {
        res.status(201).json(newUser);
    } else {
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// Handle /users endpoints
app.get('/users', (req, res) => {
    const db = readDatabase();
    res.json(db.users);
});

app.post('/users', (req, res) => {
    const db = readDatabase();
    const newUser = req.body;

    // Check if user already exists
    const existingUser = db.users.find(user => user.email === newUser.email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    db.users.push(newUser);

    if (writeDatabase(db)) {
        res.status(201).json(newUser);
    } else {
        res.status(500).json({ error: 'Failed to save user' });
    }
});


// POST endpoint for updating user decryption time
app.post('/users/:email/decryption-time', (req, res) => {
    const email = req.params.email;
    const { decryptionTime } = req.body;

    if (decryptionTime === undefined) {
        return res.status(400).json({ error: 'Decryption time is required' });
    }

    const db = readDatabase();
    const userIndex = db.users.findIndex(user => user.email === email);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Update user with decryption time
    db.users[userIndex].decryptionTime = decryptionTime;

    if (writeDatabase(db)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Explicitly handle routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/system.html', (req, res) => {
    console.log('[DEBUG] Handling /system.html route');
    const systemPath = path.join(__dirname, 'system.html');
    console.log(`[DEBUG] Looking for system.html at: ${systemPath}`);
    console.log(`[DEBUG] File exists: ${fs.existsSync(systemPath)}`);

    res.sendFile(systemPath);
});

// Handle other static files that might be missed
app.get('*', (req, res, next) => {
    const filePath = path.join(__dirname, req.url);
    console.log(`[DEBUG] Fallback handler: ${req.url}`);
    console.log(`[DEBUG] Looking for file at: ${filePath}`);

    // Check if file exists and send it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        console.log(`[DEBUG] File exists, sending: ${filePath}`);
        return res.sendFile(filePath);
    }

    // Check if we need to add .html extension
    const htmlPath = `${filePath}.html`;
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        console.log(`[DEBUG] HTML file exists, sending: ${htmlPath}`);
        return res.sendFile(htmlPath);
    }

    // If not found, proceed to next middleware
    next();
});

// Final 404 handler
app.use((req, res) => {
    res.status(404).send('Resource not found');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Database initialized at ${DB_PATH}`);
});