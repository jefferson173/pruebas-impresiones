const express = require('express');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

const app = express();
app.use(express.json());
const PORT = 3000;
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: '//localhost/EPSON1', // Reemplaza con el nombre de tu impresora si es necesario
});

app.post('/print', async (req, res) => {
    try {
      const { text, qrCode } = req.body; // Supón que envías texto y código QR en el cuerpo de la solicitud
  
      printer.alignCenter();
      printer.println(text);
      printer.printQR(qrCode);
      printer.cut();
  
      await printer.execute();
      res.status(200).send('Printed successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to print');
    }
  });


app.listen(PORT, () => {
  console.log(`Servidor de impresión escuchando en el puerto ${PORT}`);
});