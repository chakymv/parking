const express = require('express');
const router = express.Router();
const Parqueadero = require('../model/Parqueadero');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto, normalizeFecha } = require('../utils/normalizer');

// 🔍 Obtener todos los parqueaderos
router.get('/', catchAsync(async (req, res) => {
  const parqueaderos = await Parqueadero.findAll();
  res.json(parqueaderos.map(p => p.toJSON()));
}));

// 🔍 Obtener parqueadero por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const parqueadero = await Parqueadero.findById(id);
  if (!parqueadero) return res.status(404).json({ error: 'Parqueadero no encontrado' });
  res.json(parqueadero.toJSON());
}));

// 🆕 Crear nuevo parqueadero
router.post('/', catchAsync(async (req, res) => {
  try {
    const nuevoParqueadero = new Parqueadero(
      null,
      normalizeTexto(req.body.nombre),
      normalizeTexto(req.body.codigo),
      normalizeTexto(req.body.tipo),
      Number(req.body.capacidad),
      Number(req.body.creado_por),
      null // fecha_creacion será asignada automáticamente por Supabase
    );

    await nuevoParqueadero.save();
    res.status(201).json(nuevoParqueadero.toJSON());
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: `El parqueadero con el código '${req.body.codigo}' ya existe.` });
    }
    throw error;
  }
}));

// ✏️ Actualizar parqueadero
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para actualizar' });

  const parqueadero = await Parqueadero.findById(id);
  if (!parqueadero) return res.status(404).json({ error: 'Parqueadero no encontrado' });

  try {
    Object.assign(parqueadero, {
      nombre: normalizeTexto(req.body.nombre || parqueadero.nombre),
      codigo: normalizeTexto(req.body.codigo || parqueadero.codigo),
      tipo: normalizeTexto(req.body.tipo || parqueadero.tipo),
      capacidad: Number(req.body.capacidad ?? parqueadero.capacidad),
      creado_por: Number(req.body.creado_por ?? parqueadero.creado_por)
    });

    await parqueadero.save();
    res.json(parqueadero.toJSON());
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: `El parqueadero con el código '${req.body.codigo}' ya existe.` });
    }
    throw error;
  }
}));

// 🗑️ Eliminar parqueadero
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para eliminar' });

  const parqueadero = await Parqueadero.findById(id);
  if (!parqueadero) return res.status(404).json({ error: 'Parqueadero no encontrado' });

  await parqueadero.delete();
  res.status(200).json({ mensaje: 'Parqueadero eliminado correctamente' });
}));

module.exports = router;
