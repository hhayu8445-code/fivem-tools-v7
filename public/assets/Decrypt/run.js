const DecryptAPI = require('./src/api/decrypt-api');

// Initialize the API
const api = new DecryptAPI();

console.log('FiveM Decrypt API initialized successfully');
console.log('API ready to process decryption requests');

// Example usage (uncomment to test):
/*
const testFile = {
    originalname: 'test.zip',
    buffer: null // Add your file buffer here
};

api.startDecryption(testFile, 'your-cfx-key', 'your-api-key', '127.0.0.1')
    .then(result => {
        console.log('Decryption started:', result);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
*/