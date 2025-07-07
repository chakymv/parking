const express = require('express');
const router = express.Router();
const { Vehiculo } = require('../model');
const catchAsync = require('../utils/catchAsync');
const {
  validateCreateVehiculo,
  validateUpdateVehiculo,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

// GET /api/vehiculos - Obtener todos los vehículos
router.get('/', catchAsync(async (req, res) => {
  const vehiculos = await Vehiculo.findAll();
  res.json(vehiculos.map(v => v.toJSON()));
}));

// GET /api/vehiculos/:id - Obtener un vehículo por ID
router.get('/:id', catchAsync(async (req, res) => {
  const encontrado = await Vehiculo.findById(req.params.id);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Vehículo no encontrado' });
  }
}));

// GET /api/vehiculos/placa/:placa - Obtener un vehículo por placa
router.get('/placa/:placa', catchAsync(async (req, res) => {
  const encontrado = await Vehiculo.findByPlaca(req.params.placa);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Vehículo no encontrado' });
  }
}));

// POST /api/vehiculos - Crear un nuevo vehículo
router.post(
  '/',
  validateCreateVehiculo,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const datos = req.body;
    const nuevoVehiculo = new Vehiculo(
      null,
      datos.placa,
      datos.color,
      datos.modelo,
      datos.marca,
      datos.tipo,
      datos.usuario_id_usuario
    );
    await nuevoVehiculo.save();
    res.status(201).json(nuevoVehiculo.toJSON());
  })
);

// PUT /api/vehiculos/:id - Actualizar un vehículo
router.put(
  '/:id',
  validateUpdateVehiculo,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const encontrado = await Vehiculo.findById(req.params.id);
    if (!encontrado) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    Object.assign(encontrado, req.body);
    await encontrado.save();
    res.json(encontrado.toJSON());
  })
);

// DELETE /api/vehiculos/:id - Eliminar un vehículo
router.delete('/:id', catchAsync(async (req, res) => {
  const encontrado = await Vehiculo.findById(req.params.id);
  if (!encontrado) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }
  await encontrado.delete();
  res.status(200).json({ mensaje: 'Vehículo eliminado correctamente' });
}));

module.exports = router;