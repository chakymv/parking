const express = require('express');
const router = express.Router();
const PerfilUsuario = require('../model/PerfilUsuario');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los perfiles de usuario
router.get('/', catchAsync(async (req, res) => {
  const perfiles = await PerfilUsuario.getAll();
  res.json(perfiles);
}));

// Obtener perfil por ID
router.get('/:id', catchAsync(async (req, res) => {
  const perfil = await PerfilUsuario.getById(req.params.id);
  res.json(perfil);
}));

// Crear nuevo perfil
router.post('/', catchAsync(async (req, res) => {
  const nuevoPerfil = await PerfilUsuario.create(req.body);
  res.status(201).json(nuevoPerfil);
}));

// Actualizar perfil
router.put('/:id', catchAsync(async (req, res) => {
  const actualizado = await PerfilUsuario.update(req.params.id, req.body);
  res.json(actualizado);
}));

// Eliminar perfil
router.delete('/:id', catchAsync(async (req, res) => {
  await PerfilUsuario.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
