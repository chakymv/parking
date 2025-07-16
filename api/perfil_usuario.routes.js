const express = require('express');
const router = express.Router();
const PerfilUsuario = require('../model/PerfilUsuario');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto } = require('../utils/normalizer');

// 🔍 Obtener todos los perfiles de usuario
router.get('/', catchAsync(async (req, res) => {
  const perfiles = await PerfilUsuario.getAll();
  res.json(perfiles.map(p => p.toJSON?.() || p));
}));

// 🔍 Obtener perfil por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const perfil = await PerfilUsuario.getById(id);
  if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
  res.json(perfil.toJSON?.() || perfil);
}));

// 🆕 Crear nuevo perfil
router.post('/', catchAsync(async (req, res) => {
  const datos = {
    nombre: normalizeTexto(req.body.nombre),
    descripcion: normalizeTexto(req.body.descripcion)
  };

  if (!datos.nombre) return res.status(400).json({ error: 'Nombre de perfil requerido' });

  const nuevoPerfil = await PerfilUsuario.create(datos);
  res.status(201).json(nuevoPerfil.toJSON?.() || nuevoPerfil);
}));

// ✏️ Actualizar perfil
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para actualizar' });

  const actual = await PerfilUsuario.getById(id);
  if (!actual) return res.status(404).json({ error: 'Perfil no encontrado' });

  const actualizado = await PerfilUsuario.update(id, {
    nombre: normalizeTexto(req.body.nombre || actual.nombre),
    descripcion: normalizeTexto(req.body.descripcion || actual.descripcion)
  });

  res.json(actualizado.toJSON?.() || actualizado);
}));

// 🗑️ Eliminar perfil
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido para eliminar' });

  const existe = await PerfilUsuario.getById(id);
  if (!existe) return res.status(404).json({ error: 'Perfil no encontrado' });

  await PerfilUsuario.delete(id);
  res.status(204).end();
}));

module.exports = router;
