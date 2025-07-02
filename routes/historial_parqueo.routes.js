const express = require('express');
const router = express.Router();
const HistorialParqueo = require('../model/HistorialParqueo');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los historiales
router.get('/', catchAsync(async (req, res) => {
  const historial = await HistorialParqueo.getAll();
  res.json(historial);
}));

// Obtener historial por ID
router.get('/:id', catchAsync(async (req, res) => {
  const registro = await HistorialParqueo.getById(req.params.id);
  res.json(registro);
}));

// Crear nuevo historial
router.post('/', catchAsync(async (req, res) => {
  const nuevoRegistro = await HistorialParqueo.create(req.body);
  res.status(201).json(nuevoRegistro);
}));

// Actualizar historial
router.put('/:id', catchAsync(async (req, res) => {
  const actualizado = await HistorialParqueo.update(req.params.id, req.body);
  res.json(actualizado);
}));

// Eliminar historial
router.delete('/:id', catchAsync(async (req, res) => {
  await HistorialParqueo.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
