const express = require('express');
const multer = require('multer');
const DecryptAPI = require('./src/api/decrypt-api');

const app = express();
const upload = multer();
const api = new DecryptAPI();

app.use(express.json());

app.post('/decrypt', upload.single('file'), async (req, res) => {
    try {
        const { cfxKey, apiKey } = req.body;
        const file = req.file;
        const userIP = req.ip;

        const result = await api.startDecryption(file, cfxKey, apiKey, userIP);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/status/:sessionId', (req, res) => {
    const status = api.getSessionStatus(req.params.sessionId);
    res.json(status || { error: 'Session not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 FiveM Decrypt API Server STARTED on port ${PORT}`);
    console.log(`✅ Full API endpoints available:`);
    console.log(`   POST /decrypt - Start decryption`);
    console.log(`   GET /status/:sessionId - Check status`);
});