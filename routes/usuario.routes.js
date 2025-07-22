const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto, normalizeDocumento, normalizeCorreo } = require('../utils/normalizer');

router.get('/', catchAsync(async (req, res) => {
    const usuarios = await Usuario.findAll();
    res.json(usuarios.map(u => u.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const encontrado = await Usuario.findById(id);
    if (encontrado) {
        res.json(encontrado.toJSON());
    } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
}));

router.get('/documento/:numero', catchAsync(async (req, res) => {
    const numero_documento = normalizeDocumento(req.params.numero);
    const encontrado = await Usuario.findByDocument(numero_documento);
    if (encontrado) {
        res.json(encontrado.toJSON());
    } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
}));

router.post('/', catchAsync(async (req, res) => {
    const {
        tipo_documento, documento, primer_nombre, segundo_nombre,
        primer_apellido, segundo_apellido, correo, celular,
        foto_perfil, estado, clave, perfil_usuario_id
    } = req.body;

    const numero_documento = normalizeDocumento(documento);
    const direccion_correo = normalizeCorreo(correo);
    const numero_celular = normalizeDocumento(celular);
    const p_nombre = normalizeTexto(primer_nombre);
    const s_nombre = normalizeTexto(segundo_nombre);
    const p_apellido = normalizeTexto(primer_apellido);
    const s_apellido = normalizeTexto(segundo_apellido);

    if (!numero_documento || !p_nombre || !p_apellido || !direccion_correo || !numero_celular || !clave) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes o inválidos.' });
    }

    try {
        const nuevoUsuario = new Usuario(
            null,
            tipo_documento || 'CC',
            numero_documento,
            p_nombre,
            s_nombre,
            p_apellido,
            s_apellido,
            direccion_correo,
            numero_celular,
            foto_perfil || null,
            estado || 'activo',
            clave,
            perfil_usuario_id || 3
        );

        const usuarioCreado = await nuevoUsuario.create();
        res.status(201).json(usuarioCreado.toJSON());
    } catch (error) {
        if (error.message.includes('unique_numero_documento') || error.message.includes('unique_direccion_correo')) {
            return res.status(409).json({ error: 'El número de documento o correo electrónico ya está registrado.' });
        }
        res.status(500).json({ error: 'Error interno al registrar usuario: ' + error.message });
    }
}));


router.put('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const usuarioExistente = await Usuario.findById(id);
    if (!usuarioExistente) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const datosActualizados = { ...req.body };
    if (datosActualizados.documento) datosActualizados.numero_documento = normalizeDocumento(datosActualizados.documento);
    if (datosActualizados.primer_nombre) datosActualizados.primer_nombre = normalizeTexto(datosActualizados.primer_nombre);
    if (datosActualizados.segundo_nombre) datosActualizados.segundo_nombre = normalizeTexto(datosActualizados.segundo_nombre);
    if (datosActualizados.primer_apellido) datosActualizados.primer_apellido = normalizeTexto(datosActualizados.primer_apellido);
    if (datosActualizados.segundo_apellido) datosActualizados.segundo_apellido = normalizeTexto(datosActualizados.segundo_apellido);
    if (datosActualizados.correo) datosActualizados.direccion_correo = normalizeCorreo(datosActualizados.correo);
    if (datosActualizados.celular) datosActualizados.numero_celular = normalizeDocumento(datosActualizados.celular);
    if (datosActualizados.clave) usuarioExistente.clave = datosActualizados.clave;


    Object.assign(usuarioExistente, {
        tipo_documento: datosActualizados.tipo_documento || usuarioExistente.tipo_documento,
        numero_documento: datosActualizados.numero_documento || usuarioExistente.numero_documento,
        primer_nombre: datosActualizados.primer_nombre || usuarioExistente.primer_nombre,
        segundo_nombre: datosActualizados.segundo_nombre || usuarioExistente.segundo_nombre,
        primer_apellido: datosActualizados.primer_apellido || usuarioExistente.primer_apellido,
        segundo_apellido: datosActualizados.segundo_apellido || usuarioExistente.segundo_apellido,
        direccion_correo: datosActualizados.direccion_correo || usuarioExistente.direccion_correo,
        numero_celular: datosActualizados.numero_celular || usuarioExistente.numero_celular,
        foto_perfil: datosActualizados.foto_perfil !== undefined ? datosActualizados.foto_perfil : usuarioExistente.foto_perfil,
        estado: datosActualizados.estado || usuarioExistente.estado,
        perfil_usuario_id: datosActualizados.perfil_usuario_id || usuarioExistente.perfil_usuario_id
    });

    await usuarioExistente.update();
    res.json(usuarioExistente.toJSON());
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const usuarioExistente = await Usuario.findById(id);
    if (!usuarioExistente) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    await Usuario.delete(id);
    res.json({ mensaje: 'Usuario eliminado' });
}));

module.exports = router;
