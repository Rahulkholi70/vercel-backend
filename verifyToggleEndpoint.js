const express = require('express');
const router = express.Router();
const inventoryRoutes = require('./routes/inventory');

// Create a test app to verify routes
const testApp = express();
testApp.use('/api/inventory', inventoryRoutes);

// Function to print all registered routes
function printRoutes(stack, prefix = '') {
    stack.forEach((layer) => {
        if (layer.route) {
            // This is a route
            const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
            const path = prefix + layer.route.path;
            console.log(`${methods.padEnd(8)} ${path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            // This is a router middleware, recurse into it
            const newPrefix = prefix + (layer.regexp.fast_slash ? '' : layer.regexp.toString().replace(/^\/\^\\\//, '').replace(/\\\/\?\(\?=\/\|\$\)\/\$$/, '').replace(/\\\//g, '/'));
            printRoutes(layer.handle.stack, newPrefix);
        }
    });
}

console.log('=== REGISTERED INVENTORY ROUTES ===');
printRoutes(inventoryRoutes.stack);
console.log('===================================');

// Check if toggle endpoint exists
const hasToggleEndpoint = inventoryRoutes.stack.some(layer => {
    return layer.route && 
           layer.route.path.includes('/toggle') && 
           Object.keys(layer.route.methods).includes('patch');
});

if (hasToggleEndpoint) {
    console.log('✅ Toggle endpoint is registered correctly');
} else {
    console.log('❌ Toggle endpoint is NOT registered');
    console.log('Available routes:');
    inventoryRoutes.stack.forEach(layer => {
        if (layer.route) {
            console.log(`- ${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
        }
    });
}
