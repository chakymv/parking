const express = require('express');
const router = express.Router();
const Vehiculo = require('../model/Vehiculo');

// Obtener todos los vehículos
router.get('/', async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll();
    res.json(vehiculos.map(v => v.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un vehículo por ID
router.get('/:id', async (req, res) => {
  try {
    const vehiculo = new Vehiculo();
    const found = await vehiculo.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(vehiculo.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un vehículo
router.post('/', async (req, res) => {
  try {
    const { placa, color, modelo, marca, tipo, usuario_id_usuario } = req.body;
    if (!placa || !color || !modelo || !marca || !tipo || !usuario_id_usuario) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const vehiculo = new Vehiculo(null, placa, color, modelo, marca, tipo, usuario_id_usuario);
    await vehiculo.create();
    res.status(201).json(vehiculo.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar un vehículo
router.put('/:id', async (req, res) => {
  try {
    const vehiculo = new Vehiculo();
    const found = await vehiculo.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Vehículo no encontrado' });
    // Solo actualiza los campos presentes en el body
    Object.keys(req.body).forEach(key => {
      if (vehiculo.hasOwnProperty(`_${key}`)) {
        vehiculo[`_${key}`] = req.body[key];
      }
    });
    await vehiculo.update();
    res.json(vehiculo.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un vehículo
router.delete('/:id', async (req, res) => {
  try {
    const vehiculo = new Vehiculo();
    const found = await vehiculo.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Vehículo no encontrado' });
    await vehiculo.delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;