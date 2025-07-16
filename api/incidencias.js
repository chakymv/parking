// File: api/incidencias.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('incidencia').select('*');
    if (error) {
        console.error('Error al obtener todas las incidencias:', error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

router.get('/:id', async (req, res) => {
    const { data, error } = await supabase.from('incidencia').select('*').eq('id', req.params.id).single();
    if (error) {
        console.error('Error al obtener incidencia por ID:', error);
        if (error.code === 'PGRST116') { // Supabase error code for "No rows found"
            return res.status(404).json({ error: 'Incidencia no encontrada.' });
        }
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});



router.put('/:id', async (req, res) => {
    const { data, error } = await supabase.from('incidencia').update(req.body).eq('id', req.params.id).select().single();
    if (error) {
        console.error('Error al actualizar incidencia:', error);
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('incidencia').delete().eq('id', req.params.id);
    if (error) {
        console.error('Error al eliminar incidencia:', error);
        return res.status(400).json({ error: error.message });
    }
    res.status(204).send();
});

module.exports = router;
