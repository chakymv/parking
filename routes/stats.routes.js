const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const catchAsync = require('../utils/catchAsync');

// 🔍 GET /api/stats/dashboard - Obtener estadísticas para el dashboard
router.get('/dashboard', catchAsync(async (req, res) => {
  const [celdasResult, vehiculosResult, activosResult] = await Promise.all([
    supabase.rpc('get_celdas_por_estado'),
    supabase.rpc('get_vehiculos_por_tipo'),
    supabase.rpc('get_vehiculos_activos_count')
  ]);

  if (celdasResult.error) {
    return res.status(500).json({ error: 'Error obteniendo celdas por estado', detalle: celdasResult.error.message });
  }

  if (vehiculosResult.error) {
    return res.status(500).json({ error: 'Error obteniendo vehículos por tipo', detalle: vehiculosResult.error.message });
  }

  if (activosResult.error) {
    return res.status(500).json({ error: 'Error obteniendo cantidad de vehículos activos', detalle: activosResult.error.message });
  }

res.status(200).json({
  celdasPorEstado: Array.isArray(celdasResult.data) ? celdasResult.data : [],
  vehiculosPorTipo: Array.isArray(vehiculosResult.data) ? vehiculosResult.data : [],
  vehiculosActivos: typeof activosResult.data === 'number' ? activosResult.data : 0
});

}));

module.exports = router;
