const express = require('express');
const router = express.Router();
const HistorialParqueo = require('../model/HistorialParqueo');

// Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const registros = await HistorialParqueo.findAll();
    res.json(registros.map(r => r.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un registro por celda_id y vehiculo_id
router.get('/:celda_id/:vehiculo_id', async (req, res) => {
  try {
    const historial = new HistorialParqueo();
    const found = await historial.findById(req.params.celda_id, req.params.vehiculo_id);
    if (!found) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(historial.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un registro
router.post('/', async (req, res) => {
  try {
    const { celda_id, vehiculo_id, fecha_hora } = req.body;
    if (!celda_id || !vehiculo_id || !fecha_hora) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const historial = new HistorialParqueo(celda_id, vehiculo_id, fecha_hora);
    await historial.create();
    res.status(201).json(historial.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar un registro
router.put('/:celda_id/:vehiculo_id', async (req, res) => {
  try {
    const historial = new HistorialParqueo();
    const found = await historial.findById(req.params.celda_id, req.params.vehiculo_id);
    if (!found) return res.status(404).json({ error: 'Registro no encontrado' });
    Object.keys(req.body).forEach(key => {
      if (historial.hasOwnProperty(`_${key}`)) {
        historial[`_${key}`] = req.body[key];
      }
    });
    await historial.update();
    res.json(historial.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un registro
router.delete('/:celda_id/:vehiculo_id', async (req, res) => {
  try {
    const historial = new HistorialParqueo();
    const found = await historial.findById(req.params.celda_id, req.params.vehiculo_id);
    if (!found) return res.status(404).json({ error: 'Registro no encontrado' });
    await historial.delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
