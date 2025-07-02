// Handler serverless para todos los endpoints de usuario en Vercel
const express = require('express');
const usuarioRoutes = require('../../routes/usuario.routes');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

const app = express();
app.use(bodyParser.json());
app.use('/', usuarioRoutes); // Monta todas las rutas de usuario directamente

// Respuesta para la raíz de la API de usuario
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Usuarios funcionando correctamente (Vercel catchall)' });
});

module.exports = serverless(app);
