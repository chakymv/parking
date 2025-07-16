const express = require('express');
const router = express.Router();
const Celda = require('../model/Celda');
const catchAsync = require('../utils/catchAsync');
const { normalizeTexto } = require('../utils/normalizer');

// Obtener todas las celdas con filtros opcionales
router.get('/', catchAsync(async (req, res) => {
    const { estado, tipo, zona_id } = req.query;
    const filters = {
        ...(estado && { estado: normalizeTexto(estado) }),
        ...(tipo && { tipo: normalizeTexto(tipo) }),
        ...(zona_id && { zona_id: Number(zona_id) })
    };
    const celdas = await Celda.findAll(filters);
    res.json(celdas.map(c => c.toJSON()));
}));

// Obtener disponibilidad agrupada por parqueadero y zona
router.get('/disponibilidad', catchAsync(async (req, res) => {
    const celdas = await Celda.findAll();

    const agrupado = {};
    celdas.forEach(celda => {
        const nombreParqueadero = celda.parqueadero_nombre || 'Parqueadero sin nombre'; // Usar nombre real
        const nombreZona = celda.zona_nombre || 'Zona sin nombre'; // Usar nombre real

        if (!agrupado[nombreParqueadero]) { // Agrupar por nombre de parqueadero
            agrupado[nombreParqueadero] = {};
        }
        if (!agrupado[nombreParqueadero][nombreZona]) { // Agrupar por nombre de zona
            agrupado[nombreParqueadero][nombreZona] = [];
        }
        agrupado[nombreParqueadero][nombreZona].push(celda.toJSON());
    });

    res.json(agrupado);
}));

// Otras rutas (buscar por ID, crear, actualizar, eliminar)
router.get('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    const encontrada = await Celda.findById(id);
    if (encontrada) res.json(encontrada.toJSON());
    else res.status(404).json({ error: 'Celda no encontrada' });
}));

router.post('/', catchAsync(async (req, res) => {
    // Extraer todos los campos necesarios del cuerpo de la solicitud
    const { numero, tipo, estado, zona_id, parqueadero_id } = req.body;

    // Crear una nueva instancia de Celda pasando los parámetros en el orden correcto
    // constructor(id_celda, numero, tipo, estado, zona_id, parqueadero_id, ...)
    const nuevaCelda = new Celda(
        null, // id_celda (null para nueva creación)
        numero, // numero
        tipo, // tipo
        estado, // estado
        Number(zona_id), // zona_id
        Number(parqueadero_id) // parqueadero_id
    );
    await nuevaCelda.save();
    res.status(201).json(nuevaCelda.toJSON());
}));

router.put('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    const encontrada = await Celda.findById(id);
    if (!encontrada) return res.status(404).json({ error: 'Celda no encontrada' });

    // Actualizar solo los campos que se proporcionan en el cuerpo de la solicitud
    encontrada.numero = req.body.numero !== undefined ? req.body.numero : encontrada.numero;
    encontrada.tipo = req.body.tipo !== undefined ? normalizeTexto(req.body.tipo) : encontrada.tipo;
    encontrada.estado = req.body.estado !== undefined ? normalizeTexto(req.body.estado) : encontrada.estado;
    encontrada.zona_id = req.body.zona_id !== undefined ? Number(req.body.zona_id) : encontrada.zona_id;
    encontrada.parqueadero_id = req.body.parqueadero_id !== undefined ? Number(req.body.parqueadero_id) : encontrada.parqueadero_id; // Asegúrate de actualizar también parqueadero_id

    await encontrada.save();
    res.json(encontrada.toJSON());
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    const encontrada = await Celda.findById(id);
    if (!encontrada) return res.status(404).json({ error: 'Celda no encontrada' });

    await encontrada.delete();
    res.json({ mensaje: 'Celda eliminada correctamente' });
}));

module.exports = router;
