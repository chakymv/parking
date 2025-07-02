const express = require('express');
const router = express.Router();
const Celda = require('../model/Celda');
const catchAsync = require('../utils/catchAsync');

// Obtener todas las celdas
router.get('/', catchAsync(async (req, res) => {
  const celdas = await Celda.getAll();
  res.json(celdas);
}));

// Obtener celda por ID
router.get('/:id', catchAsync(async (req, res) => {
  const celda = await Celda.getById(req.params.id);
  res.json(celda);
}));

// Crear nueva celda
router.post('/', catchAsync(async (req, res) => {
  const nuevaCelda = await Celda.create(req.body);
  res.status(201).json(nuevaCelda);
}));

// Actualizar celda
router.put('/:id', catchAsync(async (req, res) => {
  const celdaActualizada = await Celda.update(req.params.id, req.body);
  res.json(celdaActualizada);
}));

// Eliminar celda
router.delete('/:id', catchAsync(async (req, res) => {
  await Celda.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
