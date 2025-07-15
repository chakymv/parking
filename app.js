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
const reporteRoutes = require('./routes/reporte_incidencia.routes');
const reporteIncidenciasRoutes = require('./routes/reporte_incidencia.routes');
const picoPlacaRoutes = require('./routes/pico_placa.routes');
const perfilUsuarioRoutes = require('./routes/perfil_usuario.routes');
const zonaRoutes = require('./routes/zona.routes');
const parqueaderoRoutes = require('./routes/parqueadero.routes');
const statsRoutes = require('./routes/stats.routes');
const tipoIncidenciaRoutes = require('./routes/tipo_incidencia.routes');
const adminRoutes = require('./routes/admin.routes');


//Usuario
const loginRoutes = require('./routes/usuario/login.routes');

const registroRoutes = require('./routes/usuario/registro.routes');
const disponibilidadPublica = require('./routes/public/disponibilidad.routes');

const Usuarios = require('./model/usuario/Usuarios');








const app = express();
const PORT = process.env.PORT || 7000;

//Permitir JS
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'public')));


// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin/css', express.static(path.join(__dirname, 'views/admin/css')));
app.use('/admin/img', express.static(path.join(__dirname, 'views/admin/img')));

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/admin/vehiculo', vehiculoRoutes);

//Usuarios routes
app.use('/usuario', loginRoutes);
app.use('routes/public/register', registroRoutes);
//publica
app.use('routes/public/disponibilidad', disponibilidadPublica);

// Configuración de sesión
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

// Rutas API
app.use('/api/usuarios', usuarioRoutes);
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



// Rutas de administración

app.use('/admin', require('./routes/admin.routes'));


// Ruta raíz
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/admin/index');
  } else {
    res.redirect('/admin/login');
  }
});

// Ruta 404
app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('ERROR INESPERADO:', err.stack || err.message);
  res.status(500).send('¡Algo salió mal en el servidor!');
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

module.exports = app;