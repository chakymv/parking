// File: routes/reporte_incidencia.routes.js
const express = require('express');
const router = express.Router();
const ReporteIncidencia = require('../model/ReporteIncidencia');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const reportes = await ReporteIncidencia.findAll();
  res.json(reportes.map(reporte => reporte.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
  const reporte = await ReporteIncidencia.getById(req.params.id);
  if (!reporte) {
    return res.status(404).json({ error: 'Reporte de incidencia no encontrado' });
  }
  res.json(reporte.toJSON());
}));

router.post('/', catchAsync(async (req, res) => {
  const nuevoReporte = await ReporteIncidencia.create(req.body);
  res.status(201).json(nuevoReporte.toJSON());
}));

router.put('/:id', catchAsync(async (req, res) => {
  try {
    const actualizado = await ReporteIncidencia.update(req.params.id, req.body);
    res.json(actualizado.toJSON());
  } catch (error) {
    if (error.message === 'Reporte de incidencia no encontrado para actualizar') {
      return res.status(404).json({ error: error.message });
    }
    throw error;
  }
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const exists = await ReporteIncidencia.getById(req.params.id);
  if (!exists) {
      return res.status(404).json({ error: 'Reporte de incidencia no encontrado para eliminar' });
  }

  await ReporteIncidencia.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
