const express = require('express');
const path = require('path');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay } = require('@whiskeysockets/baileys');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/pair', async (req, res) => {
  try {
    const { number } = req.body;
    const sessionId = "session_" + Date.now();
    const { state, saveCreds } = await useMultiFileAuthState(sessionId);
    
    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS("Chrome")
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    await delay(3000);
    const code = await sock.requestPairingCode(number);
    
    await sock.logout();
    fs.rmSync(sessionId, { recursive: true, force: true });
    
    res.json({ code: code });
  } catch (e) {
    res.json({ code: "ERROR: " + e.message });
  }
});

module.exports = app;
