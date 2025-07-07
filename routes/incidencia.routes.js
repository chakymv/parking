const express = require('express');
const router = express.Router();
const Incidencia = require('../model/Incidencia');
const catchAsync = require('../utils/catchAsync');

// Obtener todas las incidencias
router.get('/', catchAsync(async (req, res) => {
  const incidencias = await Incidencia.getAll();
  res.json(incidencias);
}));

// Obtener incidencia por ID
router.get('/:id', catchAsync(async (req, res) => {
  const incidencia = await Incidencia.getById(req.params.id);
  res.json(incidencia);
}));

// Crear nueva incidencia
router.post('/', catchAsync(async (req, res) => {
  const nuevaIncidencia = await Incidencia.create(req.body);
  res.status(201).json(nuevaIncidencia);
}));

// Actualizar incidencia
router.put('/:id', catchAsync(async (req, res) => {
  const actualizada = await Incidencia.update(req.params.id, req.body);
  res.json(actualizada);
}));

// Eliminar incidencia
router.delete('/:id', catchAsync(async (req, res) => {
  await Incidencia.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
