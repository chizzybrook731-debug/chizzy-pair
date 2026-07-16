const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/pair', async (req, res) => {
  const { number } = req.body;
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  await delay(2000);
  const code = await sock.requestPairingCode(number);
  
  res.json({ code: code });
});

module.exports = app;
