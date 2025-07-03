const express = require('express');
const usuarioRoutes = require('./routes/usuario.routes');
const vehiculoRoutes = require('./api/vehiculos');
const celdaRoutes = require('./api/celdas');
const historialParqueoRoutes = require('./api/historial_parqueo');
const accesoSalidasRoutes = require('./api/acceso_salidas');
const incidenciaRoutes = require('./api/incidencias');
const reporteIncidenciasRoutes = require('./api/reporte_incidencias');
const picoPlacaRoutes = require('./api/pico_placa');
const perfilUsuarioRoutes = require('./api/perfil_usuario');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/celdas', celdaRoutes);
app.use('/api/historial_parqueo', historialParqueoRoutes);
app.use('/api/acceso_salidas', accesoSalidasRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/reporte_incidencias', reporteIncidenciasRoutes);
app.use('/api/pico_placa', picoPlacaRoutes);
app.use('/api/perfil_usuario', perfilUsuarioRoutes);
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

