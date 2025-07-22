const express = require('express');
const router = express.Router();
const { Usuario } = require('../model');
const Vehiculo = require('../model/Vehiculo');
const catchAsync = require('../utils/catchAsync');
const { normalizePlaca, normalizeDocumento, normalizeCorreo, normalizeTexto } = require('../utils/normalizer');

router.post('/usuario', catchAsync(async (req, res) => {
    const {
        tipo_documento,
        numero_documento,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        direccion_correo,
        numero_celular,
        foto_perfil,
        estado,
        clave,
        perfil_usuario_id
    } = req.body;

    const nuevoUsuario = new Usuario(
        null,
        tipo_documento || 'CC',
        normalizeDocumento(numero_documento),
        normalizeTexto(primer_nombre),
        normalizeTexto(segundo_nombre),
        normalizeTexto(primer_apellido),
        normalizeTexto(segundo_apellido),
        normalizeCorreo(direccion_correo),
        normalizeDocumento(numero_celular),
        foto_perfil || null,
        estado || 'activo',
        clave || 'default_clave',
        perfil_usuario_id || 3
    );

    await nuevoUsuario.create();
    
    res.status(201).json(nuevoUsuario.toJSON());
}));

router.post('/vehiculo', catchAsync(async (req, res) => {
    const { placa, color, modelo, marca, tipo, usuario_id_usuario } = req.body;

    // Se usa el método estático create del modelo Vehiculo
    const nuevoVehiculo = await Vehiculo.create({
        placa: normalizePlaca(placa),
        color: color,
        modelo: modelo,
        marca: marca,
        tipo: tipo,
        usuario_id_usuario: Number(usuario_id_usuario)
    });
    
    res.status(201).json(nuevoVehiculo.toJSON());
}));

module.exports = router;
