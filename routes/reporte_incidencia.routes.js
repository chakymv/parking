const express = require('express');
const router = express.Router();
const ReporteIncidencia = require('../model/ReporteIncidencia');
const catchAsync = require('../utils/catchAsync');

// 🔍 Obtener todos los reportes
router.get('/', catchAsync(async (req, res) => {
  const reportes = await ReporteIncidencia.findAllExtendido();
  res.json(reportes);
}));

// 🆕 Crear reporte
router.post('/', catchAsync(async (req, res) => {
  const { vehiculo_id, incidencia_id, fecha_hora } = req.body;
  const reporte = new ReporteIncidencia(vehiculo_id, incidencia_id, fecha_hora);
  await reporte.create();
  res.status(201).json({ success: true });
}));

// 🗑 Eliminar reporte
router.delete('/:vehiculo_id/:incidencia_id/:fecha_hora', catchAsync(async (req, res) => {
  await ReporteIncidencia.delete(
    req.params.vehiculo_id,
    req.params.incidencia_id,
    decodeURIComponent(req.params.fecha_hora)
  );
  res.status(204).end();
}));

module.exports = router;
