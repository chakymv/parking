const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

function mapHistorialParqueoBody(body) {
  return {
    celda_id: body.celda_id || null,
    vehiculo_id: body.vehiculo_id || null,
    fecha_hora: body.fecha_hora || null
  };
}

function mapHistorialParqueoUpdateBody(body) {
  const allowed = ['celda_id','vehiculo_id','fecha_hora'];
  const updateObj = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updateObj[key] = body[key];
  }
  return updateObj;
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('historial_parqueo').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:celda_id/:vehiculo_id', async (req, res) => {
  const { data, error } = await supabase.from('historial_parqueo').select('*')
    .eq('celda_id', req.params.celda_id)
    .eq('vehiculo_id', req.params.vehiculo_id)
    .single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Registro no encontrado' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const registro = mapHistorialParqueoBody(req.body);
  if (!registro.celda_id || !registro.vehiculo_id || !registro.fecha_hora) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const { data, error } = await supabase.from('historial_parqueo').insert([registro]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:celda_id/:vehiculo_id', async (req, res) => {
  const registro = mapHistorialParqueoUpdateBody(req.body);
  const { data, error } = await supabase.from('historial_parqueo').update(registro)
    .eq('celda_id', req.params.celda_id)
    .eq('vehiculo_id', req.params.vehiculo_id)
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:celda_id/:vehiculo_id', async (req, res) => {
  const { error } = await supabase.from('historial_parqueo').delete()
    .eq('celda_id', req.params.celda_id)
    .eq('vehiculo_id', req.params.vehiculo_id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
