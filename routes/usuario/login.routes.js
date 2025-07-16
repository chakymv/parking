const express = require('express');
const router = express.Router();
const Usuarios = require('../../model/usuario/Usuarios');
const catchAsync = require('../../utils/catchAsync');

router.post('/', catchAsync(async (req, res) => {
  const { direccion_correo, clave } = req.body;

  try {
    const usuario = await Usuarios.login(direccion_correo, clave);
    res.json(usuario);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}));

module.exports = router;
