const express = require('express');
const app = express();
const cors = require('cors');

// Simple test server to check frontend connection
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint is working!', timestamp: new Date().toISOString() });
});

app.listen(5001, () => {
    console.log('Test server running on port 5001');
    console.log('Test endpoint: http://localhost:5001/api/test');
});
