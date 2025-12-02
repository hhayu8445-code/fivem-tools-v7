const DecryptAPI = require('./src/api/decrypt-api');

const api = new DecryptAPI();

console.log('🚀 FiveM Decrypt API STARTED');
console.log('✅ Ready to process decryption requests');

module.exports = api;