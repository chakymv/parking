File: routes/incidencia.routes.js
const express = require('express');
const router = express.Router();
const Incidencia = require('../model/Incidencia');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const incidencias = await Incidencia.findAll();
  res.json(incidencias.map(inc => inc.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
  const incidencia = await Incidencia.getById(req.params.id);
  if (!incidencia) {
    return res.status(404).json({ error: 'Incidencia no encontrada' });
  }
  res.json(incidencia.toJSON());
}));

router.post('/', catchAsync(async (req, res) => {
  const nuevaIncidencia = await Incidencia.create(req.body);
  res.status(201).json(nuevaIncidencia.toJSON());
}));

router.put('/:id', catchAsync(async (req, res) => {
  try {
    const actualizada = await Incidencia.update(req.params.id, req.body);
    res.json(actualizada.toJSON());
  } catch (error) {
    if (error.message === 'Incidencia no encontrada para actualizar') {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const exists = await Incidencia.getById(req.params.id);
  if (!exists) {
      return res.status(404).json({ error: 'Incidencia no encontrada para eliminar' });
  }

  await Incidencia.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
