const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

function mapAccesoSalidaBody(body) {
  return {
    movimiento: body.movimiento || null,
    fecha_hora: body.fecha_hora || null,
    puerta: body.puerta || null,
    tiempo_estadia: body.tiempo_estadia || null,
    vehiculo_id: body.vehiculo_id || null
  };
}

function mapAccesoSalidaUpdateBody(body) {
  const allowed = ['movimiento','fecha_hora','puerta','tiempo_estadia','vehiculo_id'];
  const updateObj = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updateObj[key] = body[key];
  }
  return updateObj;
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('acceso_salida').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('acceso_salida').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Registro no encontrado' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const acceso = mapAccesoSalidaBody(req.body);
  if (!acceso.movimiento || !acceso.fecha_hora || !acceso.puerta || acceso.tiempo_estadia === undefined || !acceso.vehiculo_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const { data, error } = await supabase.from('acceso_salida').insert([acceso]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const acceso = mapAccesoSalidaUpdateBody(req.body);
  const { data, error } = await supabase.from('acceso_salida').update(acceso).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('acceso_salida').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
