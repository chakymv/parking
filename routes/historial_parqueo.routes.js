const express = require('express');
const router = express.Router();
const HistorialParqueo = require('../model/HistorialParqueo');
const Celda = require('../model/Celda');
const catchAsync = require('../utils/catchAsync');
const { normalizeFecha } = require('../utils/normalizer');

// 🔍 Obtener todos los historiales con detalles de vehículo
router.get('/', catchAsync(async (req, res) => {
  const historial = await HistorialParqueo.findAllWithVehicleDetails();
  res.json(historial);
}));

// 🔎 Verificar ingreso activo por vehículo
router.get('/activo/:vehiculo_id', catchAsync(async (req, res) => {
  const vehiculoId = Number(req.params.vehiculo_id);
  if (isNaN(vehiculoId)) return res.status(400).json({ error: 'ID de vehículo inválido' });

  const registro = await HistorialParqueo.findByVehicleId(vehiculoId);
  if (registro) {
    res.json(registro.toJSON());
  } else {
    res.status(404).json({ error: 'No hay ingreso activo para este vehículo.' });
  }
}));

// 🔍 Obtener registro específico por celda y vehículo
router.get('/celda/:celda_id/vehiculo/:vehiculo_id', catchAsync(async (req, res) => {
  const celdaId = Number(req.params.celda_id);
  const vehiculoId = Number(req.params.vehiculo_id);
  if (isNaN(celdaId) || isNaN(vehiculoId)) {
    return res.status(400).json({ error: 'IDs inválidos' });
  }

  const registro = new HistorialParqueo();
  await registro.findById(celdaId, vehiculoId);
  if (registro.celda_id) {
    res.json(registro.toJSON());
  } else {
    res.status(404).json({ error: 'Registro no encontrado' });
  }
}));

// 🆕 Crear nuevo historial (ingreso)
router.post('/', catchAsync(async (req, res) => {
  const celdaId = Number(req.body.celda_id);
  const vehiculoId = Number(req.body.vehiculo_id);
  if (isNaN(celdaId) || isNaN(vehiculoId)) {
    return res.status(400).json({ error: 'Datos inválidos para ingreso' });
  }

  const celda = await Celda.findById(celdaId);
  if (!celda) return res.status(404).json({ error: 'La celda no existe' });
  if (celda.estado !== 'disponible') {
    return res.status(400).json({ error: 'La celda ya está ocupada' });
  }

  const nuevoRegistro = new HistorialParqueo(celdaId, vehiculoId, new Date());
  await nuevoRegistro.create();

  celda.estado = 'ocupado';
  await celda.save();

  res.status(201).json({
    mensaje: 'Ingreso registrado exitosamente',
    registro: nuevoRegistro.toJSON()
  });
}));

// 📤 Procesar salida de vehículo
router.post('/salida', catchAsync(async (req, res) => {
  const vehiculoId = Number(req.body.vehiculo_id);
  if (isNaN(vehiculoId)) {
    return res.status(400).json({ error: 'ID de vehículo inválido' });
  }

  const registroHistorial = await HistorialParqueo.findByVehicleId(vehiculoId);
  if (!registroHistorial) {
    return res.status(404).json({ error: 'El vehículo no se encuentra ingresado' });
  }

  await registroHistorial.delete();

  const celda = await Celda.findById(registroHistorial.celda_id);
  if (celda) {
    celda.estado = 'disponible';
    await celda.save();
  }

  res.status(200).json({
    mensaje: 'Salida procesada exitosamente',
    celda_id: registroHistorial.celda_id
  });
}));

// ✏️ Actualizar fecha de historial
router.put('/celda/:celda_id/vehiculo/:vehiculo_id', catchAsync(async (req, res) => {
  const celdaId = Number(req.params.celda_id);
  const vehiculoId = Number(req.params.vehiculo_id);
  if (isNaN(celdaId) || isNaN(vehiculoId)) {
    return res.status(400).json({ error: 'IDs inválidos' });
  }

  const registro = new HistorialParqueo();
  await registro.findById(celdaId, vehiculoId);
  if (!registro.celda_id) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }

  registro.fecha_hora = normalizeFecha(req.body.fecha_hora) || registro.fecha_hora;
  await registro.update();
  res.json(registro.toJSON());
}));

// 🗑️ Eliminar historial por celda y vehículo
router.delete('/celda/:celda_id/vehiculo/:vehiculo_id', catchAsync(async (req, res) => {
  const celdaId = Number(req.params.celda_id);
  const vehiculoId = Number(req.params.vehiculo_id);
  if (isNaN(celdaId) || isNaN(vehiculoId)) {
    return res.status(400).json({ error: 'IDs inválidos' });
  }

  const registro = new HistorialParqueo(celdaId, vehiculoId);
  await registro.delete();
  res.status(200).json({ mensaje: 'Registro eliminado correctamente' });
}));

module.exports = router;
