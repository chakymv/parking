const express = require('express');
const router = express.Router();
const PicoPlaca = require('../model/PicoPlaca');
const catchAsync = require('../utils/catchAsync');
const { normalizePlaca, normalizeTexto } = require('../utils/normalizer');

// 🔍 Obtener todas las restricciones de pico y placa
router.get('/', catchAsync(async (req, res) => {
  const restricciones = await PicoPlaca.findAll();
  res.json(restricciones.map(r => r.toJSON()));
}));

// 🔍 Obtener restricción por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const restriccion = await PicoPlaca.findById(id);
  if (!restriccion) return res.status(404).json({ error: 'Restricción no encontrada' });
  res.json(restriccion.toJSON());
}));

// 🆕 Crear nueva restricción
router.post('/', catchAsync(async (req, res) => {
  const placa = normalizePlaca(req.body.placa);
  const dia = normalizeTexto(req.body.dia);
  const hora_inicio = normalizeTexto(req.body.hora_inicio);
  const hora_fin = normalizeTexto(req.body.hora_fin);

  if (!placa || !dia || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const nuevaRestriccion = new PicoPlaca(null, placa, dia, hora_inicio, hora_fin);
  await nuevaRestriccion.create();
  res.status(201).json(nuevaRestriccion.toJSON());
}));

// ✏️ Actualizar restricción
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para actualizar' });

  const existente = await PicoPlaca.findById(id);
  if (!existente) return res.status(404).json({ error: 'Restricción no encontrada' });

  Object.assign(existente, {
    placa: normalizePlaca(req.body.placa || existente.placa),
    dia: normalizeTexto(req.body.dia || existente.dia),
    hora_inicio: normalizeTexto(req.body.hora_inicio || existente.hora_inicio),
    hora_fin: normalizeTexto(req.body.hora_fin || existente.hora_fin)
  });

  await existente.update();
  res.json(existente.toJSON());
}));

// 🗑️ Eliminar restricción
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para eliminar' });

  const existe = await PicoPlaca.findById(id);
  if (!existe) return res.status(404).json({ error: 'Restricción no encontrada' });

  await existe.delete();
  res.status(204).end();
}));

module.exports = router;
