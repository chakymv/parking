const express = require('express');
const router = express.Router();
const Vehiculo = require('../model/Vehiculo');
const HistorialParqueo = require('../model/HistorialParqueo');
const Celda = require('../model/Celda');
const Usuario = require('../model/Usuario');
const { normalizePlaca } = require('../utils/normalizer');
const { supabase } = require('../supabaseClient');

const {
    validateCreateVehiculo,
    validateUpdateVehiculo,
    handleValidationErrors,
} = require('../middlewares/validation.middleware');
const catchAsync = require('../utils/catchAsync');

router.get('/placa/:placa', catchAsync(async (req, res) => {
    const placa = normalizePlaca(req.params.placa);
    if (!placa) return res.status(400).json({ error: 'Placa no proporcionada o inválida' });

    const encontrado = await Vehiculo.findByPlaca(placa);
    if (encontrado) {
        res.json(encontrado.toJSON());
    } else {
        res.status(404).json({ error: 'Vehículo no encontrado por placa' });
    }
}));

router.get('/', catchAsync(async (req, res) => {
    const vehiculos = await Vehiculo.findAll();
    res.json(vehiculos.map(v => v.toJSON()));
}));

router.get('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const encontrado = await Vehiculo.findById(id);
    if (encontrado) {
        res.json(encontrado.toJSON());
    } else {
        res.status(404).json({ error: 'Vehículo no encontrado por ID' });
    }
}));

router.post(
    '/',
    validateCreateVehiculo,
    handleValidationErrors,
    catchAsync(async (req, res) => {
        const datos = req.body;

        const nuevoVehiculo = await Vehiculo.create({
            placa: normalizePlaca(datos.placa),
            color: datos.color?.trim(),
            modelo: datos.modelo?.trim(),
            marca: datos.marca?.trim(),
            tipo: datos.tipo?.trim(),
            usuario_id_usuario: Number(datos.usuario_id_usuario)
        });

        res.status(201).json(nuevoVehiculo.toJSON());
    })
);

router.put(
    '/:id',
    validateUpdateVehiculo,
    handleValidationErrors,
    catchAsync(async (req, res) => {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        const encontrado = await Vehiculo.findById(id);
        if (!encontrado) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        encontrado.placa = req.body.placa !== undefined ? normalizePlaca(req.body.placa) : encontrado.placa;
        encontrado.color = req.body.color !== undefined ? req.body.color?.trim() : encontrado.color;
        encontrado.modelo = req.body.modelo !== undefined ? req.body.modelo?.trim() : encontrado.modelo;
        encontrado.marca = req.body.marca !== undefined ? req.body.marca?.trim() : encontrado.marca;
        encontrado.tipo = req.body.tipo !== undefined ? req.body.tipo?.trim() : encontrado.tipo;
        if (req.body.usuario_id_usuario !== undefined) {
            encontrado.usuario_id_usuario = Number(req.body.usuario_id_usuario);
        }

        await encontrado.update();
        res.json(encontrado.toJSON());
    })
);

router.delete('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    await Vehiculo.delete(id);
    res.status(200).json({ mensaje: 'Vehículo eliminado correctamente' });
}));

router.get('/check-status/:placa', catchAsync(async (req, res) => {
    const placa = normalizePlaca(req.params.placa);
    const vehiculo = await Vehiculo.findByPlaca(placa);
    let historialActivo = null;

    if (vehiculo) {
        const historialData = await HistorialParqueo.findByVehicleId(vehiculo.id);

        if (historialData) {
            historialActivo = historialData.toJSON();

            const celdaInfo = await Celda.findById(historialActivo.celda_id);
            if (celdaInfo) {
                historialActivo.celda_numero = celdaInfo.numero;

                const { data: zonaData, error: zonaError } = await supabase
                    .from('zona')
                    .select('nombre')
                    .eq('id', celdaInfo.zona_id)
                    .single();
                if (zonaError && zonaError.code !== 'PGRST116') throw zonaError;
                historialActivo.zona_nombre = zonaData ? zonaData.nombre : 'N/A';

                const { data: parqueaderoData, error: parqueaderoError } = await supabase
                    .from('parqueadero')
                    .select('nombre')
                    .eq('id', celdaInfo.parqueadero_id)
                    .single();
                if (parqueaderoError && parqueaderoError.code !== 'PGRST116') throw parqueaderoError;
                historialActivo.parqueadero_nombre = parqueaderoData ? parqueaderoData.nombre : 'N/A';
            } else {
                historialActivo.celda_numero = 'N/A';
                historialActivo.zona_nombre = 'N/A';
                historialActivo.parqueadero_nombre = 'N/A';
            }
        }
    }

    res.json({
        vehiculo: vehiculo ? vehiculo.toJSON() : null,
        historialActivo: historialActivo
    });
}));

module.exports = router;
