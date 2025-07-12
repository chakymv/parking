const express = require('express');
const router = express.Router();
const Incidencia = require('../model/Incidencia');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto, normalizeFecha } = require('../utils/normalizer');

// 🔍 Obtener todas las incidencias
router.get('/', catchAsync(async (req, res) => {
  const incidencias = await Incidencia.findAll();
  res.json(incidencias.map(inc => inc.toJSON()));
}));

// 🔍 Obtener incidencia por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const incidencia = new Incidencia();
  const encontrada = await incidencia.findById(id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Incidencia no encontrada' });
  }

  res.json(encontrada.toJSON());
}));

// 🆕 Crear nueva incidencia
router.post('/', catchAsync(async (req, res) => {
  const nuevaIncidencia = new Incidencia(
    null,
    req.body.descripcion,
    req.body.fecha,
    req.body.usuario_id
  );

  await nuevaIncidencia.create();
  res.status(201).json(nuevaIncidencia.toJSON());
}));

// ✏️ Actualizar incidencia
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para actualizar' });

  const incidencia = new Incidencia();
  const encontrada = await incidencia.findById(id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Incidencia no encontrada para actualizar' });
  }

  incidencia.descripcion = req.body.descripcion;
  incidencia.fecha = req.body.fecha;
  incidencia.usuario_id = req.body.usuario_id;

  await incidencia.update();
  res.json(incidencia.toJSON());
}));

// 🗑️ Eliminar incidencia
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para eliminar' });

  const incidencia = new Incidencia();
  const encontrada = await incidencia.findById(id);
  if (!encontrada) {
    return res.status(404).json({ error: 'Incidencia no encontrada para eliminar' });
  }

  await incidencia.delete();
  res.status(204).end();
}));

module.exports = router;
