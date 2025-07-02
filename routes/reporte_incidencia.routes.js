const express = require('express');
const router = express.Router();
const ReporteIncidencia = require('../model/ReporteIncidencia');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los reportes de incidencia
router.get('/', catchAsync(async (req, res) => {
  const reportes = await ReporteIncidencia.getAll();
  res.json(reportes);
}));

// Obtener reporte por ID
router.get('/:id', catchAsync(async (req, res) => {
  const reporte = await ReporteIncidencia.getById(req.params.id);
  res.json(reporte);
}));

// Crear nuevo reporte
router.post('/', catchAsync(async (req, res) => {
  const nuevoReporte = await ReporteIncidencia.create(req.body);
  res.status(201).json(nuevoReporte);
}));

// Actualizar reporte
router.put('/:id', catchAsync(async (req, res) => {
  const actualizado = await ReporteIncidencia.update(req.params.id, req.body);
  res.json(actualizado);
}));

// Eliminar reporte
router.delete('/:id', catchAsync(async (req, res) => {
  await ReporteIncidencia.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
