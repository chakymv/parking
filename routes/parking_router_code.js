const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const catchAsync = require('../utils/catchAsync');

router.post('/entrada', catchAsync(async (req, res) => {
    const { vehiculo_id, celda_id } = req.body;

    const { data, error } = await supabase
        .from('historial_parqueo')
        .insert({
            vehiculo_id: vehiculo_id,
            celda_id: celda_id,
            entrada: new Date(),
            estado: 'activo'
        })
        .select();

    if (error) {
        console.error('Error al registrar entrada:', error);
        throw new Error(`Error al registrar entrada: ${error.message}`);
    }

    const { error: celdaUpdateError } = await supabase
        .from('celda')
        .update({ estado: 'ocupada' })
        .eq('id', celda_id);

    if (celdaUpdateError) {
        console.error('Error al actualizar estado de celda:', celdaUpdateError);
        throw new Error(`Error al actualizar estado de celda: ${celdaUpdateError.message}`);
    }

    res.status(201).json({ mensaje: 'Entrada registrada correctamente', data: data[0] });
}));

router.post('/salida', catchAsync(async (req, res) => {
    const { id_historial } = req.body;

    const { data: registro, error: fetchError } = await supabase
        .from('historial_parqueo')
        .select('celda_id')
        .eq('id', id_historial)
        .single();

    if (fetchError) {
        console.error('Error al buscar registro de historial:', fetchError);
        throw new Error(`Registro de historial no encontrado o error: ${fetchError.message}`);
    }

    const { error: updateError } = await supabase
        .from('historial_parqueo')
        .update({
            salida: new Date(),
            estado: 'finalizado'
        })
        .eq('id', id_historial);

    if (updateError) {
        console.error('Error al registrar salida en historial:', updateError);
        throw new Error(`Error al registrar salida: ${updateError.message}`);
    }

    const { error: celdaUpdateError } = await supabase
        .from('celda')
        .update({ estado: 'libre' })
        .eq('id', registro.celda_id);

    if (celdaUpdateError) {
        console.error('Error al liberar celda:', celdaUpdateError);
        throw new Error(`Error al liberar celda: ${celdaUpdateError.message}`);
    }

    res.status(200).json({ mensaje: 'Salida registrada correctamente' });
}));

router.get('/salidas', catchAsync(async (req, res) => {
    const { data, error } = await supabase
        .from('historial_parqueo')
        .select(`
            id,
            entrada,
            salida,
            estado,
            vehiculo (
                placa,
                tipo,
                color,
                modelo,
                usuario_id_usuario,
                usuario (
                    primer_nombre,
                    primer_apellido,
                    numero_documento
                )
            ),
            celda (
                numero,
                estado,
                tipo,
                zona (
                    nombre
                )
            )
        `)
        .order('entrada', { ascending: false })
        .limit(100);

    if (error) {
        console.error('Error al obtener historial de salidas:', error);
        throw new Error(`Error al obtener historial de salidas: ${error.message}`);
    }

    res.status(200).json(data);
}));

module.exports = router;
