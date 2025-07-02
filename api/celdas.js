const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

function mapCeldaBody(body) {
  return {
    tipo: body.tipo || null,
    estado: body.estado || null
  };
}

function mapCeldaUpdateBody(body) {
  const allowed = ['tipo','estado'];
  const updateObj = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updateObj[key] = body[key];
  }
  return updateObj;
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('celda').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('celda').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Celda no encontrada' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const celda = mapCeldaBody(req.body);
  if (!celda.tipo || !celda.estado) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const { data, error } = await supabase.from('celda').insert([celda]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const celda = mapCeldaUpdateBody(req.body);
  const { data, error } = await supabase.from('celda').update(celda).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('celda').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
