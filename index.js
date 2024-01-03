const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

// Armazenar as instâncias dos clientes
let clients = {};

// Criar uma nova instância do WhatsApp
app.post('/new-instance', (req, res) => {
    const instanceId = req.body.instanceId;

    if (!instanceId) {
        return res.status(400).json({ status: 'error', message: 'No instance ID provided' });
    }

    if (clients[instanceId]) {
        return res.status(400).json({ status: 'error', message: 'Instance already exists' });
    }

    const client = new Client();

    client.on('qr', qr => {
        console.log(`QR RECEIVED for instance ${instanceId}:`);
        console.log(`QR CODE: ${qr}`);
        qrcode.generate(qr, { small: true })
    });

    client.on('ready', () => {
        console.log(`Client is ready for instance ${instanceId}!`);
    });

    client.initialize();
    clients[instanceId] = client;

    res.status(200).json({ status: 'success', message: `Instance ${instanceId} created` });
});

// Enviar mensagem usando uma instância específica
app.post('/:instanceId/send-message', (req, res) => {
    const instanceId = req.params.instanceId;
    const number = req.body.number;
    const message = req.body.message;

    const client = clients[instanceId];

    if (!client) {
        return res.status(404).json({ status: 'error', message: 'Instance not found' });
    }

    client.sendMessage(number + '@c.us', message)
        .then(response => {
            res.status(200).json({ status: 'success', response });
        })
        .catch(err => {
            res.status(500).json({ status: 'error', response: err });
        });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
