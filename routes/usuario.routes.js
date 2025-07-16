const express = require('express');
const router = express.Router();
const Usuarios = require('../model/usuario/Usuarios');

const catchAsync = require('../utils/catchAsync');
const {
  normalizeDocumento,
  normalizeCorreo,
} = require('../utils/normalizer');

// 🔍 Obtener todos los usuarios
router.get('/', catchAsync(async (req, res) => {
  const usuarios = await Usuario.findAll();
  res.json(usuarios.map(u => u.toJSON()));
}));

// 🔍 Obtener usuario por número de documento
router.get('/documento/:numero', catchAsync(async (req, res) => {
  const doc = normalizeDocumento(req.params.numero);
  if (!doc) return res.status(400).json({ error: 'Documento inválido' });

  const encontrado = await Usuario.findByDocument(doc);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Usuario no encontrado por documento' });
  }
}));

// 🔍 Obtener usuario por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrado = await Usuario.findById(id);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Usuario no encontrado por ID' });
  }
}));

// 🆕 Crear nuevo usuario
router.post('/', catchAsync(async (req, res) => {
  const datos = req.body;

  const usuario = new Usuario(
    null,
    datos.tipo_documento?.trim(),
    normalizeDocumento(datos.numero_documento),
    datos.primer_nombre?.trim(),
    datos.segundo_nombre?.trim(),
    datos.primer_apellido?.trim(),
    datos.segundo_apellido?.trim(),
    normalizeCorreo(datos.direccion_correo),
    datos.numero_celular?.trim(),
    datos.foto_perfil,
    datos.estado?.trim(),
    datos.clave,
    Number(datos.perfil_usuario_id)
  );

  await usuario.create();
  res.status(201).json(usuario.toJSON());
}));

// ✏️ Actualizar usuario
router.put('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrado = await Usuario.findById(id);
  if (!encontrado) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  Object.assign(encontrado, {
    tipo_documento: req.body.tipo_documento?.trim(),
    numero_documento: normalizeDocumento(req.body.numero_documento),
    primer_nombre: req.body.primer_nombre?.trim(),
    segundo_nombre: req.body.segundo_nombre?.trim(),
    primer_apellido: req.body.primer_apellido?.trim(),
    segundo_apellido: req.body.segundo_apellido?.trim(),
    direccion_correo: normalizeCorreo(req.body.direccion_correo),
    numero_celular: req.body.numero_celular?.trim(),
    foto_perfil: req.body.foto_perfil,
    estado: req.body.estado?.trim(),
    clave: req.body.clave,
    perfil_usuario_id: Number(req.body.perfil_usuario_id)
  });

  await encontrado.update();
  res.json(encontrado.toJSON());
}));

// 🗑️ Eliminar usuario
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrado = await Usuario.findById(id);
  if (!encontrado) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  await encontrado.delete();
  res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
}));

module.exports = router;
