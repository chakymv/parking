const express = require('express');
const router = express.Router();
const Celda = require('../model/Celda');

// Obtener todas las celdas
router.get('/', async (req, res) => {
  try {
    const celdas = await Celda.findAll();
    res.json(celdas.map(c => c.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una celda por ID
router.get('/:id', async (req, res) => {
  try {
    const celda = new Celda();
    const found = await celda.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Celda no encontrada' });
    res.json(celda.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una celda
router.post('/', async (req, res) => {
  try {
    const { tipo, estado } = req.body;
    if (!tipo || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const celda = new Celda(null, tipo, estado);
    await celda.create();
    res.status(201).json(celda.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar una celda
router.put('/:id', async (req, res) => {
  try {
    const celda = new Celda();
    const found = await celda.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Celda no encontrada' });
    Object.keys(req.body).forEach(key => {
      if (celda.hasOwnProperty(`_${key}`)) {
        celda[`_${key}`] = req.body[key];
      }
    });
    await celda.update();
    res.json(celda.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar una celda
router.delete('/:id', async (req, res) => {
  try {
    const celda = new Celda();
    const found = await celda.findById(req.params.id);
    if (!found) return res.status(404).json({ error: 'Celda no encontrada' });
    await celda.delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
