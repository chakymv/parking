const express = require('express');
const router = express.Router();
const AccesoSalida = require('../model/AccesoSalida');

// Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const accesos = await AccesoSalida.findAll();
    res.json(accesos.map(a => a.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un registro por ID
router.get('/:id', async (req, res) => {
  try {
    const acceso = new AccesoSalida();
    const found = await acceso.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(acceso.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un registro
router.post('/', async (req, res) => {
  try {
    const { movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id } = req.body;
    if (!movimiento || !fecha_hora || !puerta || tiempo_estadia === undefined || !vehiculo_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const acceso = new AccesoSalida(null, movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id);
    await acceso.create();
    res.status(201).json(acceso.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar un registro
router.put('/:id', async (req, res) => {
  try {
    const acceso = new AccesoSalida();
    const found = await acceso.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Registro no encontrado' });
    Object.keys(req.body).forEach(key => {
      if (acceso.hasOwnProperty(`_${key}`)) {
        acceso[`_${key}`] = req.body[key];
      }
    });
    await acceso.update();
    res.json(acceso.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un registro
router.delete('/:id', async (req, res) => {
  try {
    const acceso = new AccesoSalida();
    const found = await acceso.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Registro no encontrado' });
    await acceso.delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
