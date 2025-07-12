const express = require('express');
const router = express.Router();
const Usuarios = require('../model/usuario/Usuarios');

const catchAsync = require('../utils/catchAsync');
const {
  validateCreateVehiculo,
  validateUpdateVehiculo,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');
const { normalizePlaca } = require('../utils/normalizer');
const supabase = require('../supabaseClient');


 // ⚠️ Verificá esta ruta según tu estructura

// 🔍 Buscar vehículo por placa
router.get('/placa/:placa', catchAsync(async (req, res) => {
  const placa = normalizePlaca(req.params.placa);
  if (!placa) return res.status(400).json({ error: 'Placa no proporcionada o inválida' });

  const encontrado = await Vehiculo.findByPlaca(placa);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Vehículo no encontrado por placa' });
  }
}));

// 🔍 Obtener todos los vehículos
router.get('/', catchAsync(async (req, res) => {
  const vehiculos = await Vehiculo.findAll();
  res.json(vehiculos.map(v => v.toJSON()));
}));

// 🔍 Obtener vehículo por ID
router.get('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrado = await Vehiculo.findById(id);
  if (encontrado) {
    res.json(encontrado.toJSON());
  } else {
    res.status(404).json({ error: 'Vehículo no encontrado por ID' });
  }
}));

// 🆕 Crear nuevo vehículo
router.post(
  '/',
  validateCreateVehiculo,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const datos = req.body;

    const nuevoVehiculo = new Vehiculo(
      null,
      normalizePlaca(datos.placa),
      datos.color?.trim(),
      datos.modelo?.trim(),
      datos.marca?.trim(),
      datos.tipo?.trim(),
      Number(datos.usuario_id_usuario)
    );

    await nuevoVehiculo.save();
    res.status(201).json(nuevoVehiculo.toJSON());
  })
);

// ✏️ Actualizar vehículo
router.put(
  '/:id',
  validateUpdateVehiculo,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const encontrado = await Vehiculo.findById(id);
    if (!encontrado) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    Object.assign(encontrado, {
      placa: normalizePlaca(req.body.placa),
      color: req.body.color?.trim(),
      modelo: req.body.modelo?.trim(),
      marca: req.body.marca?.trim(),
      tipo: req.body.tipo?.trim(),
      usuario_id_usuario: Number(req.body.usuario_id_usuario)
    });

    await encontrado.save();
    res.json(encontrado.toJSON());
  })
);

// 🗑️ Eliminar vehículo
router.delete('/:id', catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrado = await Vehiculo.findById(id);
  if (!encontrado) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }

  await encontrado.delete();
  res.status(200).json({ mensaje: 'Vehículo eliminado correctamente' });
}));

// 🔍 Verificar historial activo por placa
router.get('/historial-activo/:placa', catchAsync(async (req, res) => {
  const placa = normalizePlaca(req.params.placa);
  const { data, error } = await supabase.rpc('get_historial_activo_por_placa', { p_placa: placa });

  if (error) return res.status(500).json({ error: 'Error al consultar historial activo.' });
  if (!data || data.length === 0) return res.status(404).json({ mensaje: 'Sin historial activo' });

  res.json(data[0]);
}));

// 🔓 Liberar celda y finalizar historial
router.post('/liberar/:placa', catchAsync(async (req, res) => {
  const placa = normalizePlaca(req.params.placa);
  const { data: historial, error: errorHistorial } = await supabase.rpc('get_historial_activo_por_placa', { p_placa: placa });

  if (errorHistorial || !historial || historial.length === 0) {
    return res.status(404).json({ mensaje: 'No hay historial activo para liberar celda.' });
  }

  const celdaId = historial[0].celda_id;
  const vehiculoId = historial[0].vehiculo_id;

  const { error: errorCelda } = await supabase
    .from('celda')
    .update({ estado: 'libre' })
    .eq('id', celdaId);

  const { error: errorHistorialUpdate } = await supabase
    .from('historial_parqueo')
    .update({ estado: 'finalizado' })
    .eq('vehiculo_id', vehiculoId)
    .eq('celda_id', celdaId);

  if (errorCelda || errorHistorialUpdate) {
    return res.status(500).json({ mensaje: 'Error al liberar celda o cerrar historial.' });
  }

  res.json({ mensaje: 'Celda liberada y historial finalizado exitosamente.' });
}));

module.exports = router;
