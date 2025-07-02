const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('reporte_incidencia').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:vehiculo_id/:incidencia_id', async (req, res) => {
  const { data, error } = await supabase.from('reporte_incidencia').select('*')
    .eq('vehiculo_id', req.params.vehiculo_id)
    .eq('incidencia_id', req.params.incidencia_id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('reporte_incidencia').insert([req.body]).single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:vehiculo_id/:incidencia_id', async (req, res) => {
  const { data, error } = await supabase.from('reporte_incidencia').update(req.body)
    .eq('vehiculo_id', req.params.vehiculo_id)
    .eq('incidencia_id', req.params.incidencia_id)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:vehiculo_id/:incidencia_id', async (req, res) => {
  const { error } = await supabase.from('reporte_incidencia').delete()
    .eq('vehiculo_id', req.params.vehiculo_id)
    .eq('incidencia_id', req.params.incidencia_id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
