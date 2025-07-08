const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');

const usuarioRoutes = require('./routes/usuario.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const celdaRoutes = require('./routes/celda.routes');
const historialParqueoRoutes = require('./routes/historial_parqueo.routes');
const accesoSalidasRoutes = require('./routes/acceso_salida.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const reporteIncidenciasRoutes = require('./routes/reporte_incidencia.routes');
const picoPlacaRoutes = require('./routes/pico_placa.routes');
const perfilUsuarioRoutes = require('./routes/perfil_usuario.routes');
const zonaRoutes = require('./routes/zona.routes');

const parqueaderoRoutes = require('./routes/parqueadero.routes');
const statsRoutes = require('./routes/stats.routes.js');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 7000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos (CSS, JS, imágenes)
// Se define antes de las rutas para asegurar que se encuentren primero.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin/css', express.static(path.join(__dirname, 'views/admin/css')));
app.use('/admin/img', express.static(path.join(__dirname, 'views/admin/img')));

// Middlewares para procesar peticiones
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de Sesión
// Debe ir después de los parsers y antes de las rutas que la usan.
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 semana
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/celdas', celdaRoutes);
app.use('/api/historial_parqueo', historialParqueoRoutes);
app.use('/api/acceso_salidas', accesoSalidasRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/reporte_incidencias', reporteIncidenciasRoutes);
app.use('/api/pico_placa', picoPlacaRoutes);
app.use('/api/perfil_usuario', perfilUsuarioRoutes);
app.use('/api/zonas', zonaRoutes);

app.use('/api/parqueaderos', parqueaderoRoutes);
app.use('/api/stats', statsRoutes);

app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/admin/index');
  } else {
    res.redirect('/admin/login');
  }
});

app.use((err, req, res, next) => {
  // Si el error no tiene un stack, lo creamos para tener un trace
  const errorStack = err.stack || new Error(err.message || 'Error desconocido').stack;
  console.error('ERROR INESPERADO:', errorStack);
  res.status(500).send('¡Algo salió mal en el servidor!'); // Mantenemos un mensaje genérico al cliente
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
