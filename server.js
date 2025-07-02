// Servidor Express para exponer la API de Usuario
const express = require('express');
const usuarioRoutes = require('./routes/usuario.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rutas para usuario
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);

app.get('/', (req, res) => {
  res.send('API de Usuarios funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Middleware global para el manejo de errores
// Este middleware capturará cualquier error lanzado por las rutas asíncronas
// y enviará una respuesta de error JSON.
app.use((err, req, res, next) => {
  console.error('ERROR 💥', err); // Loguear el error para depuración
  res.status(err.statusCode || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});
