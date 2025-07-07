// File: api/reporte_incidencias.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('reporte_incidencia').select('*');
    if (error) {
        console.error('Error al obtener todos los reportes de incidencia:', error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

router.get('/:vehiculo_id/:incidencia_id', async (req, res) => {
    const { data, error } = await supabase.from('reporte_incidencia').select('*')
        .eq('vehiculo_id', req.params.vehiculo_id)
        .eq('incidencia_id', req.params.incidencia_id);
    
    if (error) {
        console.error('Error al obtener reportes por vehiculo_id e incidencia_id:', error);
        return res.status(500).json({ error: error.message });
    }
    
    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'No se encontraron reportes para la combinación de vehículo e incidencia.' });
    }
    res.json(data);
});

router.post('/', async (req, res) => {
    const { data, error } = await supabase.from('reporte_incidencia').insert([req.body]).select().single();
    if (error) {
        console.error('Error al crear reporte de incidencia:', error);
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
});

router.put('/:vehiculo_id/:incidencia_id', async (req, res) => {
    const { data, error } = await supabase.from('reporte_incidencia').update(req.body)
        .eq('vehiculo_id', req.params.vehiculo_id)
        .eq('incidencia_id', req.params.incidencia_id)
        .select()
        .single();
    
    if (error) {
        console.error('Error al actualizar reporte de incidencia:', error);
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

router.delete('/:vehiculo_id/:incidencia_id/:fecha_hora', async (req, res) => {
    const { vehiculo_id, incidencia_id, fecha_hora } = req.params;
    
    const decodedFechaHora = decodeURIComponent(fecha_hora);

    const { error } = await supabase.from('reporte_incidencia').delete()
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