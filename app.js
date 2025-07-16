const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();

const vehiculoRoutes = require('./routes/vehiculo.routes');
const celdaRoutes = require('./routes/celda.routes');
const historialParqueoRoutes = require('./routes/historial_parqueo.routes');
const accesoSalidasRoutes = require('./routes/acceso_salida.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const reporteRoutes = require('./routes/reporte_incidencia.routes');
const reporteIncidenciasRoutes = require('./routes/reporte_incidencia.routes');
const picoPlacaRoutes = require('./routes/pico_placa.routes');
const perfilUsuarioRoutes = require('./routes/perfil_usuario.routes');
const zonaRoutes = require('./routes/zona.routes');
const parqueaderoRoutes = require('./routes/parqueadero.routes');
const statsRoutes = require('./routes/stats.routes');
const tipoIncidenciaRoutes = require('./routes/tipo_incidencia.routes');
const adminRoutes = require('./routes/admin.routes');
const loginRoutes = require('./routes/usuario/login.routes');
const registroRoutes = require('./routes/usuario/registro.routes');
const disponibilidadPublica = require('./routes/public/disponibilidad.routes');
const Usuarios = require('./model/usuario/Usuarios');

const PORT = process.env.PORT || 7000;

app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin/css', express.static(path.join(__dirname, 'views/admin/css')));
app.use('/admin/img', express.static(path.join(__dirname, 'views/admin/img')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));

app.use('/usuario', loginRoutes);
app.use('/usuario', registroRoutes);
app.use('/api/disponibilidad', disponibilidadPublica);

app.get('/', async (req, res) => {
  try {
    const response = await fetch('/api/disponibilidad/disponibilidad');
    const disponibilidad = await response.json();
    res.render('usuario/index', { disponibilidad });
  } catch (err) {
    console.error('Error al obtener disponibilidad:', err);
    res.render('usuario/index', { disponibilidad: {} });
  }
});

app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/celdas', celdaRoutes);
app.use('/api/historial_parqueo', historialParqueoRoutes);
app.use('/api/acceso_salidas', accesoSalidasRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/reporte_incidencias', reporteIncidenciasRoutes);
app.use('/api/reporte_incidencias', reporteRoutes);
app.use('/api/pico_placa', picoPlacaRoutes);
app.use('/api/perfil_usuario', perfilUsuarioRoutes);
app.use('/api/zonas', zonaRoutes);
app.use('/api/parqueaderos', parqueaderoRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tipos', tipoIncidenciaRoutes);

app.use('/admin', adminRoutes);
app.use('/admin/vehiculo', vehiculoRoutes);

app.get('/admin', (req, res) => {
  if (req.session.userId) {
    res.redirect('/admin/index');
  } else {
    res.redirect('/admin/login');
  }
});

app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

app.use((err, req, res, next) => {
  console.error('ERROR INESPERADO:', err.stack || err.message);
  res.status(500).send('¡Problemas con el servidor');
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

module.exports = app;
