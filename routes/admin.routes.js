const express = require('express');
const router = express.Router();
const { Usuario } = require('../model');
const catchAsync = require('../utils/catchAsync');

// Middleware para verificar si el usuario ha iniciado sesión
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
  return res.redirect('/admin/login');
  }
next();
};

// --- RUTAS DE AUTENTICACIÓN ---

// GET /admin/login - Muestra el formulario de login
router.get('/login', (req, res) => {
  res.render('admin/login-a', { titulo: 'Login' });
});

// POST /admin/login - Procesa el login
router.post('/login', catchAsync(async (req, res) => {
  const { 'admin-us': email, 'admin-clave': password } = req.body;

  const usuario = await Usuario.findByEmail(email);
  if (!usuario) {
   
    return res.status(401).send('Credenciales inválidas. <a href="/admin/login">Intentar de nuevo</a>');
  }

  const esValida = await usuario.comparePassword(password);
  if (esValida) {
  req.session.userId = usuario.id_usuario;
  req.session.userName = usuario.primer_nombre;
  res.redirect('/admin/index');
  } else {
   
    res.status(401).send('Credenciales inválidas. <a href="/admin/login">Intentar de nuevo</a>');
  }
}));

// POST /admin/logout - Cierra la sesión
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/admin/index'); 
    }
    res.clearCookie('connect.sid'); 
    res.redirect('/admin/login');
  });
});

// --- RUTAS PROTEGIDAS DEL PANEL DE ADMINISTRACIÓN ---
// Todas las rutas a partir de aquí requerirán login

router.get('/index', requireLogin, (req, res) => {
  res.render('admin/index', { titulo: 'Inicio', userName: req.session.userName });
});

router.get('/vehiculos', requireLogin, (req, res) => {
  res.render('admin/vehiculos', { titulo: 'Vehículos', userName: req.session.userName });
});

router.get('/usuarios', requireLogin, (req, res) => {
  res.render('admin/usuarios', { titulo: 'Usuarios', userName: req.session.userName });
});

router.get('/historico', requireLogin, (req, res) => {
  res.render('admin/historico', { titulo: 'Histórico', userName: req.session.userName });
});

router.get('/crear_usuarios', requireLogin, (req, res) => {
  res.render('admin/crear_usuarios', { titulo: 'Crear Usuario', userName: req.session.userName });
});

router.get('/crear_vehiculo', requireLogin, (req, res) => {
  res.render('admin/vehiculos2', { titulo: 'Crear Vehículo', userName: req.session.userName });
});

router.get('/crear_celdas', requireLogin, (req, res) => {
  res.render('admin/crear_celdas', { titulo: 'Crear Celdas', userName: req.session.userName });
});

router.get('/crear_zonas', requireLogin, (req, res) => {
  res.render('admin/crear_zonas', { titulo: 'Crear Zonas', userName: req.session.userName });
});

router.get('/operar', requireLogin, (req, res) => {
  res.render('admin/operar', { titulo: 'Operar', userName: req.session.userName });
});

router.get('/zonas', requireLogin, (req, res) => {
  res.render('admin/zonas', { titulo: 'Gestionar Zonas', userName: req.session.userName });
});

router.get('/parqueaderos', requireLogin, (req, res) => {
  res.render('admin/parqueaderos', { titulo: 'Gestionar Parqueaderos', userName: req.session.userName });
});

router.get('admin/incidencia', requireLogin, (req, res) => {
  res.render('admin/incidencia', { titulo: 'Gestionar Inicidencias', userName: req.session.userName });
});



router.get('/niveles', requireLogin, (req, res) => {
res.render('admin/niveles', { titulo: 'Gestionar Niveles', userName: req.session.userName });
});

module.exports = router;