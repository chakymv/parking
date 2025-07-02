const express = require('express');
const router = express.Router();
const AccesoSalida = require('../model/AccesoSalida');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los accesos/salidas
router.get('/', catchAsync(async (req, res) => {
  const accesos = await AccesoSalida.getAll();
  res.json(accesos);
}));

// Obtener acceso/salida por ID
router.get('/:id', catchAsync(async (req, res) => {
  const acceso = await AccesoSalida.getById(req.params.id);
  res.json(acceso);
}));

// Crear nuevo acceso/salida
router.post('/', catchAsync(async (req, res) => {
  const nuevoAcceso = await AccesoSalida.create(req.body);
  res.status(201).json(nuevoAcceso);
}));

// Actualizar acceso/salida
router.put('/:id', catchAsync(async (req, res) => {
  const actualizado = await AccesoSalida.update(req.params.id, req.body);
  res.json(actualizado);
}));

// Eliminar acceso/salida
router.delete('/:id', catchAsync(async (req, res) => {
  await AccesoSalida.delete(req.params.id);
  res.status(204).end();
}));

module.exports = router;
