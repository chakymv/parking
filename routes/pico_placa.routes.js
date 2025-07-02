const express = require('express');
const router = express.Router();
const PicoPlaca = require('../model/PicoPlaca');
const catchAsync = require('../utils/catchAsync');

// Obtener todas las restricciones de pico y placa
router.get('/', catchAsync(async (req, res) => {
  const restricciones = await PicoPlaca.getAll();
  res.json(restricciones);
}));

// Obtener restricción por ID
router.get('/:id', catchAsync(async (req, res) => {
  const restriccion = await PicoPlaca.getById(req.params.id);
  res.json(restriccion);
}));

// Crear nueva restricción
router.post('/', catchAsync(async (req, res) => {
  const nuevaRestriccion = await PicoPlaca.create(req.body);
  res.status(201).json(nuevaRestriccion);
}));

// Actualizar restricción
router.put('/:id', catchAsync(async (req, res) => {
  const actualizada = await PicoPlaca.update(req.params.id, req.body);
  res.json(actualizada);
}));

// Eliminar restricción
router.delete('/:id', catchAsync(async (req, res) => {
  await PicoPlaca.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
