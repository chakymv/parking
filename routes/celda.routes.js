const express = require('express');
const router = express.Router();
const Celda = require('../model/Celda');


const catchAsync = require('../utils/catchAsync');
const { normalizeTexto } = require('../utils/normalizer');

// 🔍 Obtener todas las celdas (con filtros)
router.get('/', catchAsync(async (req, res) => {
  const { estado, tipo, zona_id } = req.query;
  const filters = {
    ...(estado && { estado: normalizeTexto(estado) }),
    ...(tipo && { tipo: normalizeTexto(tipo) }),
    ...(zona_id && { zona_id: Number(zona_id) })
  };
  const celdas = await Celda.findAll(filters);
  res.json(celdas.map(c => c.toJSON()));
}));

// ✅ Obtener celdas libres por tipo (usado en operar.ejs)
router.get('/disponibles/:tipo', catchAsync(async (req, res) => {
  const tipo = normalizeTexto(req.params.tipo);
  if (!tipo) return res.status(400).json({ error: 'Tipo de celda no proporcionado' });

  const celdas = await Celda.findAll({ estado: 'libre', tipo });
  res.json(celdas.map(c => c.toJSON()));
}));

// 🔍 Obtener celda por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrada = await Celda.findById(id);
  if (encontrada) {
    res.json(encontrada.toJSON());
  } else {
    res.status(404).json({ error: 'Celda no encontrada' });
  }
}));

// ➕ Crear nueva celda
router.post('/', catchAsync(async (req, res) => {
  const tipo = normalizeTexto(req.body.tipo);
  const estado = normalizeTexto(req.body.estado);
  const zona_id = Number(req.body.zona_id);

  const nuevaCelda = new Celda(null, tipo, estado, zona_id);
  await nuevaCelda.save();
  res.status(201).json(nuevaCelda.toJSON());
}));

// ✏️ Actualizar celda
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrada = await Celda.findById(id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Celda no encontrada' });
  }

  encontrada.tipo = req.body.tipo ? normalizeTexto(req.body.tipo) : encontrada.tipo;
  encontrada.estado = req.body.estado ? normalizeTexto(req.body.estado) : encontrada.estado;
  encontrada.zona_id = req.body.zona_id ? Number(req.body.zona_id) : encontrada.zona_id;

  await encontrada.save();
  res.json(encontrada.toJSON());
}));

// 🗑 Eliminar celda
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrada = await Celda.findById(id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Celda no encontrada' });
  }

  await encontrada.delete();
  res.json({ mensaje: 'Celda eliminada correctamente' });
}));

module.exports = router;
