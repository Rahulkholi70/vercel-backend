const express = require('express');
const app = express();
const cors = require('cors');

// Debug server to log all incoming requests
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log('=== INCOMING REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('========================');
    next();
});

// Catch-all route to log 404s
app.use('*', (req, res) => {
    console.log('=== 404 NOT FOUND ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('=====================');
    res.status(404).json({ message: 'Route not found', requestedUrl: req.url });
});

app.listen(5002, () => {
    console.log('Debug server running on port 5002');
    console.log('This will log all incoming requests to help debug the 404 issue');
});
