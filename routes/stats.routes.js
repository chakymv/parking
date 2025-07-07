const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const catchAsync = require('../utils/catchAsync');

// GET /api/stats/dashboard - Obtener estadísticas para el dashboard
router.get('/dashboard', catchAsync(async (req, res) => {
    // Llamamos a las funciones que creamos en la base de datos
    const [celdasResult, vehiculosResult, activosResult] = await Promise.all([
        supabase.rpc('get_celdas_por_estado'),
        supabase.rpc('get_vehiculos_por_tipo'),
        supabase.rpc('get_vehiculos_activos_count') // Nueva llamada
    ]);

    if (celdasResult.error) throw new Error(`Error en RPC get_celdas_por_estado: ${celdasResult.error.message}`);
    if (vehiculosResult.error) throw new Error(`Error en RPC get_vehiculos_por_tipo: ${vehiculosResult.error.message}`);
    if (activosResult.error) throw new Error(`Error en RPC get_vehiculos_activos_count: ${activosResult.error.message}`);

    res.json({
        celdasPorEstado: celdasResult.data,
        vehiculosPorTipo: vehiculosResult.data,
        vehiculosActivos: activosResult.data // Nuevo dato
    });
}));

module.exports = router;