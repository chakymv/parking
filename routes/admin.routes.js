const express = require('express');
const router = express.Router();
const { Usuario } = require('../model');
const catchAsync = require('../utils/catchAsync');

// Middleware para verificar si el usuario ha iniciado sesión
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    // Si no hay sesión, redirigir a la página de login
    return res.redirect('/admin/login');
  }
  // Si hay sesión, continuar a la siguiente ruta
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
    // Usuario no encontrado, redirigir con un mensaje de error (usando flash sería ideal)
    return res.status(401).send('Credenciales inválidas. <a href="/admin/login">Intentar de nuevo</a>');
  }

  const esValida = await usuario.comparePassword(password);
  if (esValida) {
    // Contraseña válida, guardar ID en la sesión
    req.session.userId = usuario.id_usuario;
    req.session.userName = usuario.primer_nombre;
    // Redirigir al panel de administración
    res.redirect('/admin/index');
  } else {
    // Contraseña inválida
    res.status(401).send('Credenciales inválidas. <a href="/admin/login">Intentar de nuevo</a>');
  }
}));

// POST /admin/logout - Cierra la sesión
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/admin/index'); // O a una página de error
    }
    res.clearCookie('connect.sid'); // Limpiar la cookie de sesión
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

router.get('/niveles', requireLogin, (req, res) => {
  // Nota: Asegúrate de tener un archivo llamado 'niveles.ejs' en 'views/admin/'
  // para que esta ruta funcione correctamente.
  res.render('admin/niveles', { titulo: 'Gestionar Niveles', userName: req.session.userName });
});

module.exports = router;