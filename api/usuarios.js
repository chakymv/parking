const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Mapeo y validación explícita de campos para inserción
function mapUsuarioBody(body) {
  return {
    tipo_documento: body.tipo_documento || null,
    numero_documento: body.numero_documento || null,
    primer_nombre: body.primer_nombre || null,
    segundo_nombre: body.segundo_nombre || null,
    primer_apellido: body.primer_apellido || null,
    segundo_apellido: body.segundo_apellido || null,
    direccion_correo: body.direccion_correo || null,
    numero_celular: body.numero_celular || null,
    foto_perfil: body.foto_perfil || null,
    estado: body.estado || null,
    clave: body.clave || null,
    perfil_usuario_id: body.perfil_usuario_id || null
  };
}

// Solo los campos presentes para update
function mapUsuarioUpdateBody(body) {
  const allowed = [
    'tipo_documento','numero_documento','primer_nombre','segundo_nombre','primer_apellido','segundo_apellido',
    'direccion_correo','numero_celular','foto_perfil','estado','clave','perfil_usuario_id'
  ];
  const updateObj = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updateObj[key] = body[key];
  }
  return updateObj;
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('usuario').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('usuario').select('*').eq('id_usuario', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Usuario no encontrado' });
  res.json(data);
});

// Obtener usuario por número de documento
router.get('/documento/:numero', async (req, res) => {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('numero_documento', req.params.numero)
    .single();
  if (error || !data) return res.status(404).json({ error: error ? error.message : 'Usuario no encontrado' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const usuario = mapUsuarioBody(req.body);
  const { data, error } = await supabase.from('usuario').insert([usuario]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const usuario = mapUsuarioUpdateBody(req.body);
  const { data, error } = await supabase.from('usuario').update(usuario).eq('id_usuario', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('usuario').delete().eq('id_usuario', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
