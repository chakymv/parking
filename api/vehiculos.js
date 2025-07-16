const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Mapeo y validación explícita de campos para inserción
function mapVehiculoBody(body) {
  return {
    placa: body.placa || null,
    color: body.color || null,
    modelo: body.modelo || null,
    marca: body.marca || null,
    tipo: body.tipo || null,
    usuario_id_usuario: body.usuario_id_usuario || null
  };
}

function mapVehiculoUpdateBody(body) {
  const allowed = ['placa','color','modelo','marca','tipo','usuario_id_usuario'];
  const updateObj = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updateObj[key] = body[key];
  }
  return updateObj;
}

// Obtener todos los vehículos
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('vehiculo').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Obtener un vehículo por ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('vehiculo').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Vehículo no encontrado' });
  res.json(data);
});

// Obtener un vehículo por placa
router.get('/placa/:placa', async (req, res) => {
  const { data, error } = await supabase
    .from('vehiculo')
    .select('*')
    .eq('placa', req.params.placa)
    .single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Vehículo no encontrado' });
  res.json(data);
});

// Crear un vehículo
router.post('/', async (req, res) => {
  const vehiculo = mapVehiculoBody(req.body);
  if (!vehiculo.placa || !vehiculo.color || !vehiculo.modelo || !vehiculo.marca || !vehiculo.tipo || !vehiculo.usuario_id_usuario) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const { data, error } = await supabase.from('vehiculo').insert([vehiculo]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Actualizar un vehículo
router.put('/:id', async (req, res) => {
  const vehiculo = mapVehiculoUpdateBody(req.body);
  const { data, error } = await supabase.from('vehiculo').update(vehiculo).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Eliminar un vehículo
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('vehiculo').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;