const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

// Criar uma única instância do WhatsApp
const client = new Client();

client.on('qr', qr => {
    console.log(`QR RECEIVED:`);
    console.log(`QR CODE: ${qr}`);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', handleMessage);

// Criar uma nova instância do WhatsApp
app.post('/new-instance', (req, res) => {
    return res.status(400).json({ status: 'error', message: 'Instance creation not allowed. Single instance already exists.' });
});

// Enviar mensagem usando a instância única
app.post('/send-message', sendMessage);

async function sendWebhookMessage(message) {
    console.log(message);
    const webhookUrl = 'https://nexusempire.up.railway.app/webhook/webwhatsapp';

    try {
        const response = await axios.post(webhookUrl, { message });
        console.log('Webhook message sent successfully', response.data);
    } catch (error) {
        console.error('Error sending webhook message:', error.message);
    }
}
async function sendWebhookMessageTest(message) {
    console.log(message);
    const webhookUrl = 'https://nexusempire.up.railway.app/webhook-test/webwhatsapp';

    try {
        const response = await axios.post(webhookUrl, { message });
        console.log('Webhook message sent successfully', response.data);
    } catch (error) {
        console.error('Error sending webhook message:', error.message);
    }
}

function handleMessage(message) {
    console.log(`Message received: ${message.body}`);
    if (message.body.includes("!test")) {
        sendWebhookMessageTest(message);
    } else {
        sendWebhookMessage(message);
    }
}

function sendMessage(req, res) {
    const number = req.body.number;
    const message = req.body.message;

    client.sendMessage(`${number}@c.us`, message)
        .then(response => {
            res.status(200).json({ status: 'success', response });
        })
        .catch(err => {
            res.status(500).json({ status: 'error', response: err });
        });
}

app.listen(port, () => {
    console.log('HTTP SERVER RUNNING');
});

// Inicializar a instância única do WhatsApp
client.initialize();
