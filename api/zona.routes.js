const express = require('express');
const router = express.Router();
const Zona = require('../model/Zona');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto } = require('../utils/normalizer');

// 🔍 Obtener todas las zonas
router.get('/', catchAsync(async (req, res) => {
  const zonas = await Zona.findAll();
  res.json(zonas.map(z => z.toJSON()));
}));

// 🔍 Obtener zona por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const zona = await Zona.findById(id);
  if (!zona) return res.status(404).json({ error: 'Zona no encontrada' });
  res.json(zona.toJSON());
}));

// 🆕 Crear nueva zona
router.post('/', catchAsync(async (req, res) => {
  try {
    const nombre = normalizeTexto(req.body.nombre);
    const descripcion = normalizeTexto(req.body.descripcion);

    const nuevaZona = new Zona(null, nombre, descripcion);
    await nuevaZona.save();
    res.status(201).json(nuevaZona.toJSON());
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: `La zona con el nombre '${req.body.nombre}' ya existe.` });
    }
    throw error;
  }
}));

// ✏️ Actualizar zona existente
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const zona = await Zona.findById(id);
  if (!zona) return res.status(404).json({ error: 'Zona no encontrada' });

  try {
    zona.nombre = normalizeTexto(req.body.nombre);
    zona.descripcion = normalizeTexto(req.body.descripcion);
    await zona.save();
    res.json(zona.toJSON());
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: `La zona con el nombre '${req.body.nombre}' ya existe.` });
    }
    throw error;
  }
}));

// 🗑️ Eliminar zona
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const zona = await Zona.findById(id);
  if (!zona) return res.status(404).json({ error: 'Zona no encontrada' });

  await zona.delete();
  res.status(200).json({ mensaje: 'Zona eliminada correctamente' });
}));

module.exports = router;
