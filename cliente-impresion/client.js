const net = require('net');
const RemoteEventEmitter = require('remote-events');

const STREAM_PORT = 7896;
const HOST = 'localhost';

const con = net.connect(STREAM_PORT, HOST, () => {
  console.log('Conectado al servidor');
});

const client = new RemoteEventEmitter();
con.pipe(client.getStream()).pipe(con);

client.on('print', async (data) => {
  console.log('Evento de impresión recibido:', data);
  client.emit('dbaction', { message: 'Hola' });
  const ThermalPrinter = require('node-thermal-printer').printer;
  const PrinterTypes = require('node-thermal-printer').types;

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: '//localhost/EPSON1',
    removeSpecialCharacters: false,
    lineCharacter: "=",
  });

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

con.on('error', (err) => {
  console.error('Error en la conexión TCP:', err);
});

module.exports = { client, con };