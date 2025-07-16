const express = require('express');
const router = express.Router();
const { Nivel } = require('../model');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const niveles = await Nivel.findAll();
  res.json(niveles.map(n => n.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
  const nivel = await Nivel.findById(req.params.id);
  if (!nivel) return res.status(404).json({ error: 'Nivel no encontrado' });
  res.json(nivel.toJSON());
}));

router.post('/', catchAsync(async (req, res) => {
  try {
    const nuevoNivel = new Nivel(null, req.body.nombre, req.body.descripcion);
    await nuevoNivel.save();
    res.status(201).json(nuevoNivel.toJSON());
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: `El nivel con el nombre '${req.body.nombre}' ya existe.` });
    }
    throw error; // Re-throw other errors
  }
}));

router.put('/:id', catchAsync(async (req, res) => {
  const nivel = await Nivel.findById(req.params.id);
  if (!nivel) return res.status(404).json({ error: 'Nivel no encontrado' });
  try {
    nivel.nombre = req.body.nombre;
    nivel.descripcion = req.body.descripcion;
    await nivel.save();
    res.json(nivel.toJSON());
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: `El nivel con el nombre '${req.body.nombre}' ya existe.` });
    }
    throw error; // Re-throw other errors
  }
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const nivel = await Nivel.findById(req.params.id);
  if (!nivel) return res.status(404).json({ error: 'Nivel no encontrado' });
  await nivel.delete();
  res.status(200).json({ mensaje: 'Nivel eliminado' });
}));

module.exports = router;