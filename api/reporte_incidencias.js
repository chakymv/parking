// File: api/reporte_incidencias.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Obtener todos los reportes
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('reporte_incidencia')
        .select('*');
    
    if (error) {
        console.error('Error al obtener todos los reportes de incidencia:', error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});
// ultimo agregado
const { data: existe } = await supabase
  .from('reporte_incidencia')
  .select()
  .eq('vehiculo_id', vehiculo_id)
  .eq('incidencia_id', incidencia_id)
  .eq('fecha_hora', fecha_hora);

if (existe.length > 0) {
  return res.status(409).json({ error: 'Ya existe un reporte con esta combinación.' });
}



// Obtener reporte por vehiculo + incidencia
router.get('/:vehiculo_id/:incidencia_id', async (req, res) => {
    const { vehiculo_id, incidencia_id } = req.params;

    const { data, error } = await supabase
        .from('reporte_incidencia')
        .select('*')
        .eq('vehiculo_id', vehiculo_id)
        .eq('incidencia_id', incidencia_id);
    
    if (error) {
        console.error('Error al obtener reportes por vehiculo e incidencia:', error);
        return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'No se encontraron reportes para esta combinación.' });
    }
    res.json(data);
});

// Crear nuevo reporte
router.post('/', async (req, res) => {
    const { vehiculo_id, incidencia_id, fecha_hora } = req.body;

    if (!vehiculo_id || !incidencia_id || !fecha_hora) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const { data, error } = await supabase
        .from('reporte_incidencia')
        .insert([{ vehiculo_id, incidencia_id, fecha_hora }])
        .select(); // NO uses .single()

    if (error) {
        console.error('Error al crear reporte de incidencia:', error);
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data[0]); // Retornar el primer elemento del array
});

// Actualizar un reporte existente
router.put('/:vehiculo_id/:incidencia_id/:fecha_hora', async (req, res) => {
    const { vehiculo_id, incidencia_id, fecha_hora } = req.params;

    const decodedFechaHora = decodeURIComponent(fecha_hora);

    const { data, error } = await supabase
        .from('reporte_incidencia')
        .update(req.body)
        .eq('vehiculo_id', vehiculo_id)
        .eq('incidencia_id', incidencia_id)
        .eq('fecha_hora', decodedFechaHora)
        .select(); // tampoco usar .single()

    if (error) {
        console.error('Error al actualizar reporte:', error);
        return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Reporte no encontrado para actualizar.' });
    }

    res.json(data[0]);
});

// Eliminar reporte
router.delete('/:vehiculo_id/:incidencia_id/:fecha_hora', async (req, res) => {
    const { vehiculo_id, incidencia_id, fecha_hora } = req.params;

    const decodedFechaHora = decodeURIComponent(fecha_hora);

    const { error } = await supabase
        .from('reporte_incidencia')
        .delete()
        .eq('vehiculo_id', vehiculo_id)
        .eq('incidencia_id', incidencia_id)
        .eq('fecha_hora', decodedFechaHora);

    if (error) {
        console.error('Error al eliminar reporte de incidencia:', error);
        return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
});

module.exports = router;
