const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los usuarios
router.get('/', catchAsync(async (req, res) => {
  const usuarios = await Usuario.findAll();
  res.json(usuarios.map(u => u.toJSON()));
}));

// Obtener usuario por ID
router.get('/:id', catchAsync(async (req, res) => {
  const encontrado = await Usuario.findById(req.params.id);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
}));

// Obtener usuario por número de documento
router.get('/documento/:numero', catchAsync(async (req, res) => {
  const encontrado = await Usuario.findByDocument(req.params.numero);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
}));

// Crear nuevo usuario
router.post('/', catchAsync(async (req, res) => {
  const datos = req.body;
  const nuevoUsuario = new Usuario(
    null,
    datos.tipo_documento,
    datos.numero_documento,
    datos.primer_nombre,
    datos.segundo_nombre,
    datos.primer_apellido,
    datos.segundo_apellido,
    datos.direccion_correo,
    datos.numero_celular,
    datos.foto_perfil,
    datos.estado,
    datos.clave,
    datos.perfil_usuario_id
  );
  await nuevoUsuario.create();
  res.status(201).json(nuevoUsuario.toJSON());
}));

// Actualizar usuario por ID
router.put('/:id', catchAsync(async (req, res) => {
  const usuarioExistente = await Usuario.findById(req.params.id);
  if (!usuarioExistente) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  Object.assign(usuarioExistente, req.body);
  await usuarioExistente.update();
  res.json(usuarioExistente.toJSON());
}));

// Eliminar usuario por ID
router.delete('/:id', catchAsync(async (req, res) => {
  const usuarioExistente = await Usuario.findById(req.params.id);
  if (!usuarioExistente) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  await usuarioExistente.delete();
  res.json({ mensaje: 'Usuario eliminado' });
}));

module.exports = router;
