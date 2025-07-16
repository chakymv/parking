const express = require('express');
const router = express.Router();
const Usuarios = require('../../model/usuario/Usuarios');
const catchAsync = require('../../utils/catchAsync');

router.post('/', catchAsync(async (req, res) => {
  try {
    await Usuarios.crear(req.body); // bcrypt se aplica dentro del modelo
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}));

module.exports = router;
