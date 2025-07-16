const express = require('express');
const router = express.Router();
const TipoIncidencia = require('../model/TipoIncidencia');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto } = require('../utils/normalizer');

// 🔍 Obtener todos los tipos de incidencia
router.get('/', catchAsync(async (req, res) => {
  const tipos = await TipoIncidencia.findAll();
  res.json(tipos.map(t => t.toJSON()));
}));

// 🆕 Crear nuevo tipo de incidencia
router.post('/', catchAsync(async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre del tipo es requerido.' });
  }

  const tipo = new TipoIncidencia(null, nombre);
  await tipo.create();
  res.status(201).json(tipo.toJSON());
}));

// ✏️ Actualizar tipo de incidencia
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre } = req.body;

  if (isNaN(id) || !nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'Datos inválidos para actualizar tipo.' });
  }

  const tipo = new TipoIncidencia(id, nombre);
  await tipo.update();
  res.json(tipo.toJSON());
}));

// 🗑️ Eliminar tipo de incidencia
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para eliminar tipo.' });

  const tipo = new TipoIncidencia(id);
  await tipo.delete();
  res.status(204).end();
}));

module.exports = router;
