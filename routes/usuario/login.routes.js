const express = require('express');
const router = express.Router();
const Usuarios = require('../../model/usuario/Usuarios');
const catchAsync = require('../../utils/catchAsync');

// Ruta GET para mostrar el formulario de inicio de sesión
router.get('/iniciar-sesion', (req, res) => {
res.render('usuario/iniciar_sesion');

});

// Ruta POST para procesar el login del usuario
router.post('/', catchAsync(async (req, res) => {
  const { direccion_correo, clave } = req.body;

  try {
    const usuario = await Usuarios.login(direccion_correo, clave);
    res.json(usuario); // Puedes redirigir o establecer sesión si lo deseas
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}));

module.exports = router;
