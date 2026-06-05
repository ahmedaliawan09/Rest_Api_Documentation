const fs = require('fs');

// Read the original file
const data = fs.readFileSync('Cart_API_Complete_50_Tests.postman_collection.json', 'utf8');

// Replace all occurrences
let updated = data.replace(/localhost:5000/g, 'localhost:5001');
updated = updated.replace(/"port": "5000"/g, '"port": "5001"');
updated = updated.replace(/"Cart API - 50\+ Test Cases"/, '"Cart API - Docker Tests (Port 5001)"');

// Write the new file
fs.writeFileSync('Cart_API_Docker_Tests.postman_collection.json', updated, 'utf8');

console.log('Docker test collection created successfully!');
