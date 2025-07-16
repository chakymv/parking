const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { normalizeFecha } = require('../utils/normalizer');

// 🧹 Sanitiza body para creación
function mapHistorialParqueoBody(body) {
  return {
    celda_id: Number(body.celda_id) || null,
    vehiculo_id: Number(body.vehiculo_id) || null,
    fecha_hora: normalizeFecha(body.fecha_hora) || null
  };
}

// 🧱 Sanitiza body para actualización
function mapHistorialParqueoUpdateBody(body) {
  const allowed = ['celda_id', 'vehiculo_id', 'fecha_hora'];
  const updateObj = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updateObj[key] = key === 'fecha_hora' ? normalizeFecha(body[key]) :
                       key === 'celda_id' || key === 'vehiculo_id' ? Number(body[key]) :
                       body[key];
    }
  }
  return updateObj;
}

// 🔍 GET todos los registros con detalles de vehículo
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('historial_parqueo')
    .select(`
      celda_id,
      vehiculo_id,
      fecha_hora,
      vehiculo:vehiculo_id (
        placa,
        tipo,
        marca,
        modelo,
        color
      )
    `);

  if (error) return res.status(500).json({ error: error.message });

  // Mapear estructura para la vista
  const mapped = data.map(row => ({
    celda_id: row.celda_id,
    fecha_hora: row.fecha_hora,
    placa: row.vehiculo?.placa,
    tipo: row.vehiculo?.tipo,
    marca: row.vehiculo?.marca,
    modelo: row.vehiculo?.modelo,
    color: row.vehiculo?.color
  }));

  res.status(200).json(mapped);
});

// 🔎 GET por ID compuesto
router.get('/:celda_id/:vehiculo_id', async (req, res) => {
  const celda_id = Number(req.params.celda_id);
  const vehiculo_id = Number(req.params.vehiculo_id);
  if (isNaN(celda_id) || isNaN(vehiculo_id)) {
    return res.status(400).json({ error: 'IDs inválidos' });
  }

  const { data, error } = await supabase
    .from('historial_parqueo')
    .select('*')
    .eq('celda_id', celda_id)
    .eq('vehiculo_id', vehiculo_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: error ? error.message : 'Registro no encontrado' });
  }

  res.json(data);
});

// 🆕 POST para crear registro
router.post('/', async (req, res) => {
  const registro = mapHistorialParqueoBody(req.body);
  if (!registro.celda_id || !registro.vehiculo_id || !registro.fecha_hora) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const { data, error } = await supabase
    .from('historial_parqueo')
    .insert([registro])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// ✏️ PUT para actualizar registro
router.put('/:celda_id/:vehiculo_id', async (req, res) => {
  const celda_id = Number(req.params.celda_id);
  const vehiculo_id = Number(req.params.vehiculo_id);
  if (isNaN(celda_id) || isNaN(vehiculo_id)) {
    return res.status(400).json({ error: 'IDs inválidos' });
  }

  const registro = mapHistorialParqueoUpdateBody(req.body);

  const { data, error } = await supabase
    .from('historial_parqueo')
    .update(registro)
    .eq('celda_id', celda_id)
    .eq('vehiculo_id', vehiculo_id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// 🗑️ DELETE para borrar registro
router.delete('/:celda_id/:vehiculo_id', async (req, res) => {
  const celda_id = Number(req.params.celda_id);
  const vehiculo_id = Number(req.params.vehiculo_id);
  if (isNaN(celda_id) || isNaN(vehiculo_id)) {
    return res.status(400).json({ error: 'IDs inválidos' });
  }

  const { error } = await supabase
    .from('historial_parqueo')
    .delete()
    .eq('celda_id', celda_id)
    .eq('vehiculo_id', vehiculo_id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
