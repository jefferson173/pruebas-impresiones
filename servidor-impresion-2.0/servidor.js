// server.js
const net = require('net');
const RemoteEventEmitter = require('remote-events');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const express = require('express');
const cors = require('cors');

const app = express();
const httpServer = require('http').createServer(app);

const STREAM_PORT = 7896;
const HTTP_PORT = 3000;

app.use(cors());
app.use(express.json());

const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: '//localhost/EPSON1',
    removeSpecialCharacters: false,
    lineCharacter: "=",
});

const clients = new Set();

const tcpServer = net.createServer((con) => {
  let remote = new RemoteEventEmitter();
  con.pipe(remote.getStream()).pipe(con);

  clients.add(con);

  con.on('close', () => {
    clients.delete(con);
  });
  remote.on('print', async (data) => {
    try {
      printer.alignCenter();
      printer.println(data.message);
      printer.cut();
      await printer.execute();
      console.log('Impresión realizada con éxito');
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  });
});

tcpServer.listen(STREAM_PORT, () => {
  console.log(`Servidor TCP escuchando en el puerto ${STREAM_PORT}`);
});

app.post('/print', (req, res) => {
  const message = req.body.message;
  clients.forEach((client) => {
    let remote = new RemoteEventEmitter();
    remote.emit('print', { message });
    client.write(JSON.stringify({ event: 'print', data: { message } }));
  });
  res.send('Solicitud de impresión enviada');
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${HTTP_PORT}`);
});