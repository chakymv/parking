const express = require('express');
const router = express.Router();
const AccesoSalida = require('../model/AccesoSalida');
const HistorialParqueo = require('../model/HistorialParqueo');
const Celda = require('../model/Celda');
const catchAsync = require('../utils/catchAsync');


router.get('/', catchAsync(async (req, res) => {
  const accesos = await AccesoSalida.findAll();
  res.json(accesos);
}));


router.get('/:id', catchAsync(async (req, res) => {
  const acceso = await AccesoSalida.findById(req.params.id);
  if (!acceso) return res.status(404).json({ error: 'Registro no encontrado.' });
  res.json(acceso);
}));


router.post('/', catchAsync(async (req, res) => {
  const acceso = new AccesoSalida(
    null,
    req.body.movimiento,
    req.body.fecha_hora,
    req.body.puerta,
    req.body.tiempo_estadia,
    req.body.vehiculo_id
  );
  const creado = await acceso.create();
  res.status(201).json(creado);
}));


router.put('/:id', catchAsync(async (req, res) => {
  const acceso = await AccesoSalida.findById(req.params.id);
  if (!acceso) return res.status(404).json({ error: 'Acceso no encontrado.' });

  acceso.movimiento = req.body.movimiento || acceso.movimiento;
  acceso.fecha_hora = req.body.fecha_hora || acceso.fecha_hora;
  acceso.puerta = req.body.puerta || acceso.puerta;
  acceso.tiempo_estadia = req.body.tiempo_estadia || acceso.tiempo_estadia;
  acceso.vehiculo_id = req.body.vehiculo_id || acceso.vehiculo_id;

  await acceso.update();
  res.json(acceso);
}));


router.delete('/:id', catchAsync(async (req, res) => {
  const acceso = await AccesoSalida.findById(req.params.id);
  if (!acceso) return res.status(404).json({ error: 'Registro no encontrado.' });

  await acceso.delete();
  res.status(204).end();
}));

// 🚗 Registrar salida completa de un vehículo
router.post('/registrar-salida', catchAsync(async (req, res) => {
  const { vehiculo_id, puerta = 'Principal' } = req.body;
  if (!vehiculo_id) {
    return res.status(400).json({ error: 'Falta el ID del vehículo.' });
  }

  // 1. Verificar ingreso activo
  const ingreso = await HistorialParqueo.findByVehicleId(vehiculo_id);
  if (!ingreso) {
    return res.status(404).json({ error: 'El vehículo no tiene ingreso registrado.' });
  }

  // 2. Calcular estadía
  const salidaHora = new Date().toISOString();
  const minutos = Math.floor((new Date(salidaHora) - new Date(ingreso.fecha_hora)) / 60000);

  // 3. Crear movimiento de salida
  const salida = new AccesoSalida(
    null,
    'Salida',
    salidaHora,
    puerta,
    minutos,
    vehiculo_id
  );
  await salida.create();

  // 4. Eliminar ingreso y liberar celda
  await ingreso.delete();
  const celda = await Celda.findById(ingreso.celda_id);
  celda.estado = 'libre';
  await celda.save();

  res.status(200).json({
    mensaje: 'Salida registrada correctamente.',
    celda_id: celda.id_celda,
    tiempo_estadia: minutos
  });
}));

module.exports = router;
