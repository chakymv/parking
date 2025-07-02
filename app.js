const express = require('express');
const usuarioRoutes = require('./routes/usuario.routes');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/usuarios', usuarioRoutes);


app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Usuarios funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

