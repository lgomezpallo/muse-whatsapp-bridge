const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
let lastQR = null;

app.get('/', (req,res) => res.send('Muse WhatsApp Bridge - Activo'));
app.get('/qr', async (req,res) => {
  if(!lastQR) return res.send('No hay QR pendiente. Ya estas logueado o esperando.');
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<html><body style="font-family:sans-serif;text-align:center"><h2>Escanea con tu celu LABORAL</h2><img src="${img}"/><p>WhatsApp > Dispositivos vinculados > Vincular dispositivo</p></body></html>`);
});

app.listen(PORT, () => console.log(`Web QR en puerto ${PORT}`));

const client = new Client({
  authStrategy: new LocalAuth({ 
    clientId: "muse-laboral",
    dataPath: process.env.WEBJS_AUTH_PATH || "./.wwebjs_auth"
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu']
  }
});

client.on('qr', qr => {
  lastQR = qr;
  console.log('QR generado -> anda a /qr en tu URL de Render');
});

client.on('ready', () => {
  console.log('✅ WhatsApp laboral conectado y listo');
  lastQR = null;
});

client.on('authenticated', () => console.log('Autenticado OK'));
client.on('auth_failure', m => console.error('Auth fail', m));

client.on('message', async msg => {
  // Solo responde si empieza con MUSE: o si es mensaje tuyo a vos mismo
  if (msg.fromMe) return; // evita loops
  const isFromOwner = msg.from.endsWith('@c.us'); // mensaje directo
  if (!msg.body.toUpperCase().startsWith('MUSE:') && !msg.body.toUpperCase().startsWith('TRABAJO:')) return;

  const prompt = msg.body.replace(/^(MUSE:|TRABAJO:)/i,'').trim();
  console.log(`-> Muse: ${prompt} (de ${msg.from})`);

  try {
    // LLAMADA A MUSE - Cambia esto cuando tengas el token oficial de Muse API
    // Por ahora podes usar un webhook/email que tu Muse monitoree
    const MUSE_WEBHOOK = process.env.MUSE_WEBHOOK_URL; // ej: tu Zapier, Make, o endpoint de Muse
    
    let museReply = "Recibido. Procesando...";
    
    if (MUSE_WEBHOOK) {
      const fetch = require('node-fetch');
      const r = await fetch(MUSE_WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ from: msg.from, text: prompt, source: 'whatsapp-laboral-render' })
      });
      const data = await r.json().catch(()=>({}));
      museReply = data.reply || data.text || museReply;
    } else {
      museReply = `Listo, recibí: "${prompt}".\n\nConfigura MUSE_WEBHOOK_URL en Render para que te responda con tu Muse real.`;
    }

    await msg.reply(museReply);
  } catch (e) {
    console.error(e);
    await msg.reply('Error conectando con Muse. Revisa logs en Render.');
  }
});

client.initialize();