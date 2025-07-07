const express = require('express');
const router = express.Router();
const { Parqueadero } = require('../model');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const parqueaderos = await Parqueadero.findAll();
  res.json(parqueaderos.map(p => p.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
  const parqueadero = await Parqueadero.findById(req.params.id);
  if (!parqueadero) return res.status(404).json({ error: 'Parqueadero no encontrado' });
  res.json(parqueadero.toJSON());
}));

router.post('/', catchAsync(async (req, res) => {
  try {
    const { nombre, codigo, tipo, capacidad, creado_por } = req.body;
    const nuevoParqueadero = new Parqueadero(null, nombre, codigo, tipo, capacidad, creado_por);
    await nuevoParqueadero.save();
    res.status(201).json(nuevoParqueadero.toJSON());
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: `El parqueadero con el código '${req.body.codigo}' ya existe.` });
    }
    throw error;
  }
}));

router.put('/:id', catchAsync(async (req, res) => {
  const parqueadero = await Parqueadero.findById(req.params.id);
  if (!parqueadero) return res.status(404).json({ error: 'Parqueadero no encontrado' });
  try {
    Object.assign(parqueadero, req.body);
    await parqueadero.save();
    res.json(parqueadero.toJSON());
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: `El parqueadero con el código '${req.body.codigo}' ya existe.` });
    }
    throw error;
  }
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const parqueadero = await Parqueadero.findById(req.params.id);
  if (!parqueadero) return res.status(404).json({ error: 'Parqueadero no encontrado' });
  await parqueadero.delete();
  res.status(200).json({ mensaje: 'Parqueadero eliminado' });
}));

module.exports = router;