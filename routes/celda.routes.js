const express = require('express');
const router = express.Router();
const { Celda } = require('../model');
const catchAsync = require('../utils/catchAsync');

// 🔍 Obtener todas las celdas (opcionalmente filtrar por estado, tipo, zona, nivel)
router.get('/', catchAsync(async (req, res) => {
  const { estado, tipo, zona, nivel } = req.query;
  const filters = {
    ...(estado && { estado }),
    ...(tipo && { tipo }),
    ...(zona && { zona }),
    ...(nivel && { nivel })
  };
  const celdas = await Celda.findAll(filters);
  res.json(celdas.map(c => c.toJSON()));
}));

// ✅ Obtener celdas libres por tipo (usado en operar.ejs)
router.get('/disponibles/:tipo', catchAsync(async (req, res) => {
  const tipo = req.params.tipo;
  const celdas = await Celda.findAll({ estado: 'libre', tipo });

  res.json(celdas.map(c => c.toJSON()));
}));

// 🔍 Obtener celda por ID
router.get('/:id', catchAsync(async (req, res) => {
  const encontrada = await Celda.findById(req.params.id);
  if (encontrada) {
    res.json(encontrada.toJSON());
  } else {
    res.status(404).json({ error: 'Celda no encontrada' });
  }
}));

// ➕ Crear nueva celda
router.post('/', catchAsync(async (req, res) => {
  const { tipo, estado, zona, nivel } = req.body;
  const nuevaCelda = new Celda(null, tipo, estado, zona, nivel);
  await nuevaCelda.save();
  res.status(201).json(nuevaCelda.toJSON());
}));

// ✏️ Actualizar celda
router.put('/:id', catchAsync(async (req, res) => {
  const encontrada = await Celda.findById(req.params.id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Celda no encontrada' });
  }

  // Actualiza solo los campos presentes en el body
  encontrada.tipo = req.body.tipo ?? encontrada.tipo;
  encontrada.estado = req.body.estado ?? encontrada.estado;
  encontrada.zona = req.body.zona ?? encontrada.zona;
  encontrada.nivel = req.body.nivel ?? encontrada.nivel;

  await encontrada.save();
  res.json(encontrada.toJSON());
}));

// 🗑 Eliminar celda
router.delete('/:id', catchAsync(async (req, res) => {
  const encontrada = await Celda.findById(req.params.id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Celda no encontrada' });
  }
  await encontrada.delete();
  res.json({ mensaje: 'Celda eliminada' });
}));

module.exports = router;
