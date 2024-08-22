const net = require('net');
const RemoteEventEmitter = require('remote-events');

const STREAM_PORT = 7896;
const HOST = 'localhost';

const con = net.connect(STREAM_PORT, HOST, () => {
  console.log('Conectado al servidor para enviar solicitud de impresión');
  const client = new RemoteEventEmitter();
  con.pipe(client.getStream()).pipe(con);

  client.emit('print', { message: 'Este es un mensaje de prueba' });

  con.end(); // Cierra la conexión después de enviar el mensaje
});

con.on('error', (err) => {
  console.error('Error en la conexión TCP:', err);
});