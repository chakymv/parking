const express = require('express');
const router = express.Router();
const HistorialParqueo = require('../model/HistorialParqueo');
const catchAsync = require('../utils/catchAsync');
const { Celda } = require('../model');

// Obtener todos los historiales
router.get('/', catchAsync(async (req, res) => {
  const historial = await HistorialParqueo.findAllWithVehicleDetails();
  res.json(historial);
}));

// Verificar si un vehículo tiene un ingreso activo
router.get('/activo/:vehiculo_id', catchAsync(async (req, res) => {
  const { vehiculo_id } = req.params;
  const registro = await HistorialParqueo.findByVehicleId(vehiculo_id);
  if (registro) {
    res.json(registro.toJSON());
  } else {
    res.status(404).json({ error: 'No hay un ingreso activo para este vehículo.' });
  }
}));

// Obtener un registro específico del historial por su clave compuesta
// Ejemplo: GET /api/historial_parqueo/celda/1/vehiculo/5
router.get('/celda/:celda_id/vehiculo/:vehiculo_id', catchAsync(async (req, res) => {
  const { celda_id, vehiculo_id } = req.params;
  const registro = new HistorialParqueo();
  await registro.findById(celda_id, vehiculo_id);
  if (registro.celda_id) { // Verificar si el registro fue encontrado
    res.json(registro.toJSON());
  } else {
    res.status(404).json({ error: 'Registro de historial no encontrado' });
  }
}));

// Crear nuevo historial
router.post('/', catchAsync(async (req, res) => {
  const { celda_id, vehiculo_id } = req.body;

  // 1. Validar que la celda y el vehículo existan y que la celda esté libre.
  const celda = await Celda.findById(celda_id);
  if (!celda) {
    return res.status(404).json({ error: 'La celda especificada no existe.' });
  }
  if (celda.estado !== 'disponible') {
    return res.status(400).json({ error: 'La celda seleccionada ya está ocupada.' });
  }

  // 2. Crear el registro en el historial de parqueo
  const fecha_hora = new Date();
  const nuevoRegistro = new HistorialParqueo(celda_id, vehiculo_id, fecha_hora);
  await nuevoRegistro.create();

  // 3. Actualizar el estado de la celda a 'ocupada'
  celda.estado = 'ocupado';
  await celda.save();

  // 4. Responder con éxito
  res.status(201).json({ mensaje: 'Ingreso registrado exitosamente.', registro: nuevoRegistro.toJSON() });
}));

// Procesar la salida de un vehículo
router.post('/salida', catchAsync(async (req, res) => {
  const { vehiculo_id } = req.body;
  if (!vehiculo_id) {
    return res.status(400).json({ error: 'El ID del vehículo es requerido.' });
  }

  // 1. Encontrar el registro de historial activo para el vehículo
  const registroHistorial = await HistorialParqueo.findByVehicleId(vehiculo_id);
  if (!registroHistorial) {
    return res.status(404).json({ error: 'El vehículo no se encuentra actualmente en el parqueadero.' });
  }

  const celdaIdParaLiberar = registroHistorial.celda_id;

  // 2. Eliminar el registro del historial (marcando la salida)
  await registroHistorial.delete();

  // 3. Actualizar el estado de la celda a 'libre'
  const celda = await Celda.findById(celdaIdParaLiberar);
  if (celda) {
    celda.estado = 'disponible';
    await celda.save(); // Usamos save() que internamente actualiza
  }

  // 4. Responder con éxito
  res.status(200).json({ mensaje: 'Salida procesada exitosamente.', celda_id: celdaIdParaLiberar });
}));

// Actualizar historial
// Ejemplo: PUT /api/historial_parqueo/celda/1/vehiculo/5
router.put('/celda/:celda_id/vehiculo/:vehiculo_id', catchAsync(async (req, res) => {
  const { celda_id, vehiculo_id } = req.params;
  const registro = new HistorialParqueo();
  await registro.findById(celda_id, vehiculo_id);

  if (!registro.celda_id) {
    return res.status(404).json({ error: 'Registro de historial no encontrado' });
  }

  registro.fecha_hora = req.body.fecha_hora || registro.fecha_hora;
  await registro.update();
  res.json(registro.toJSON());
}));

// Eliminar historial
// Ejemplo: DELETE /api/historial_parqueo/celda/1/vehiculo/5
router.delete('/celda/:celda_id/vehiculo/:vehiculo_id', catchAsync(async (req, res) => {
  const { celda_id, vehiculo_id } = req.params;
  const registro = new HistorialParqueo(celda_id, vehiculo_id);
  await registro.delete();
  res.status(200).json({ mensaje: 'Registro de historial eliminado' });
}));

module.exports = router;
