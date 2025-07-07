const express = require('express');
const router = express.Router();
const { Zona } = require('../model');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const zonas = await Zona.findAll();
  res.json(zonas.map(z => z.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
  const zona = await Zona.findById(req.params.id);
  if (!zona) return res.status(404).json({ error: 'Zona no encontrada' });
  res.json(zona.toJSON());
}));

router.post('/', catchAsync(async (req, res) => {
  try {
    const nuevaZona = new Zona(null, req.body.nombre, req.body.descripcion);
    await nuevaZona.save();
    res.status(201).json(nuevaZona.toJSON());
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: `La zona con el nombre '${req.body.nombre}' ya existe.` });
    }
    throw error; // Re-throw other errors
  }
}));

router.put('/:id', catchAsync(async (req, res) => {
  const zona = await Zona.findById(req.params.id);
  if (!zona) return res.status(404).json({ error: 'Zona no encontrada' });
  try {
    zona.nombre = req.body.nombre;
    zona.descripcion = req.body.descripcion;
    await zona.save();
    res.json(zona.toJSON());
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: `La zona con el nombre '${req.body.nombre}' ya existe.` });
    }
    throw error; // Re-throw other errors
  }
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const zona = await Zona.findById(req.params.id);
  if (!zona) return res.status(404).json({ error: 'Zona no encontrada' });
  await zona.delete();
  res.status(200).json({ mensaje: 'Zona eliminada' });
}));

module.exports = router;