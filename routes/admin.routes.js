const express = require('express');
const router = express.Router();
const Usuario = require('../model/Usuario');
const Vehiculo = require('../model/Vehiculo');
const { normalizePlaca } = require('../utils/normalizer');
const catchAsync = require('../utils/catchAsync');
const supabase = require('../supabaseClient');

const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/admin/login');
    next();
};

router.get('/login', (req, res) => {
    res.render('admin/login-a', { titulo: 'Login' });
});

router.post('/login', catchAsync(async (req, res) => {
    const { 'admin-us': email, 'admin-clave': password } = req.body;
    const usuario = await Usuario.findByEmail(email);
    if (!usuario || !(await usuario.comparePassword(password))) {
        return res.status(401).send('Credenciales inválidas. <a href="/admin/login">Intentar de nuevo</a>');
    }
    req.session.userId = usuario.id_usuario;
    req.session.userName = usuario.primer_nombre;
    res.redirect('/admin/index');
}));

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/admin/index');
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

router.get('/index', requireLogin, (req, res) => {
    res.render('admin/index', { titulo: 'Inicio', userName: req.session.userName });
});

router.get('/vehiculos', requireLogin, (req, res) => {
    res.render('admin/vehiculos', { titulo: 'Vehículos', userName: req.session.userName });
});

router.get('/usuarios', requireLogin, (req, res) => {
    res.render('admin/usuarios', { titulo: 'Usuarios', userName: req.session.userName });
});

router.get('/historico', requireLogin, (req, res) => {
    res.render('admin/historico', { titulo: 'Histórico', userName: req.session.userName });
});

router.get('/crear_usuarios', requireLogin, (req, res) => {
    res.render('admin/crear_usuarios', { titulo: 'Crear Usuario', userName: req.session.userName });
});

router.get('/crear_vehiculo', requireLogin, (req, res) => {
    res.render('admin/vehiculos2', { titulo: 'Crear Vehículo', userName: req.session.userName });
});

router.get('/crear_celdas', requireLogin, async (req, res) => {
    try {
        const { data: parqueaderos } = await supabase.from('parqueadero').select('*');
        const { data: zonas } = await supabase.from('zona').select('*');
        const { data: celdas } = await supabase.from('celda').select('*');
        res.render('admin/crear_celdas', {
            titulo: 'Crear Celdas',
            userName: req.session.userName,
            parqueaderos: parqueaderos || [],
            zonas: zonas || [],
            celdas: celdas || []
        });
    } catch (err) {
        console.error('Error al cargar crear_celdas:', err.message);
        res.status(500).send('Error interno al cargar la vista.');
    }
});

router.get('/crear_zonas', requireLogin, (req, res) => {
    res.render('admin/crear_zonas', { titulo: 'Crear Zonas', userName: req.session.userName });
});

router.get('/zonas', requireLogin, async (req, res) => {
    if (req.query.json === '1') {
        try {
            const { data: zonas, error } = await supabase.from('zona').select('*').order('nombre');
            if (error) throw error;
            return res.json({ zonas: zonas || [] });
        } catch (err) {
            console.error('Error al cargar zonas (JSON):', err.message);
            return res.status(500).json({ zonas: [], error: err.message });
        }
    } else {
        res.render('admin/zonas', { titulo: 'Gestionar Zonas', userName: req.session.userName });
    }
});

router.get('/operar', requireLogin, async (req, res) => {
    try {
        const { data: parqueaderos } = await supabase.from('parqueadero').select('*');
        const { data: zonas } = await supabase.from('zona').select('*');
        const { data: celdas } = await supabase.from('celda').select('*');
        res.render('admin/operar', {
            titulo: 'Operar Parqueadero',
            userName: req.session.userName,
            parqueaderos: parqueaderos || [],
            zonas: zonas || [],
            celdas: celdas || []
        });
    } catch (err) {
        console.error('Error en /admin/operar:', err.message);
        res.status(500).send('Error interno al cargar operación.');
    }
});

router.get('/usuarios/buscar', requireLogin, async (req, res) => {
    const query = req.query.query?.trim();
    if (!query || query.length < 3) return res.json({ usuarios: [] });

    try {
        const { data, error } = await supabase
            .from('usuario')
            .select('id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_documento, direccion_correo, numero_celular')
            .or([
                `numero_documento.ilike.%${query}%`,
                `primer_nombre.ilike.%${query}%`,
                `primer_apellido.ilike.%${query}%`,
                `segundo_apellido.ilike.%${query}%`
            ])
            .limit(10);

        if (error) throw error;
        res.json({ usuarios: data || [] });
    } catch (err) {
        console.error('❌ Error en /usuarios/buscar:', err.message);
        res.status(500).json({ usuarios: [], error: err.message });
    }
});

router.get('/vehiculo/existe', requireLogin, async (req, res) => {
    const placa = req.query.placa;
    if (!placa) return res.status(400).json({ error: 'Placa no especificada' });

    try {
        const vehiculo = await Vehiculo.findByPlaca(placa);

        if (vehiculo) {
            return res.json({ existe: true, vehiculo: vehiculo.toJSON() });
        } else {
            return res.json({ existe: false });
        }
    } catch (err) {
        console.error('Error inesperado en vehiculo/existe:', err.message);
        res.status(500).json({ error: 'Error inesperado =(' });
    }
});

router.get('/vehiculo/historial-activo/:placa', requireLogin, async (req, res) => {
    const placa = req.params.placa;
    console.log(`DEBUG: Solicitud a /vehiculo/historial-activo para placa: ${placa}`);
    if (!placa) return res.status(400).json({ error: 'Placa requerida' });

    try {
        const vehiculo = await Vehiculo.findByPlaca(placa);
        console.log(`DEBUG: Vehículo encontrado en historial-activo: ${vehiculo ? vehiculo.placa : 'null'}`);

        if (!vehiculo) return res.status(404).json({ activo: false, mensaje: 'Vehículo no encontrado.' });

        const vehiculo_id = vehiculo.id;

        const { data: historial, error: errorHistorial } = await supabase
            .from('historial_parqueo')
            .select('id, celda_id, estado')
            .eq('vehiculo_id', vehiculo_id)
            .eq('estado', 'activo')
            .order('fecha_hora', { ascending: false })
            .limit(1);

        if (errorHistorial) throw errorHistorial;

        if (!historial?.length) return res.status(404).json({ activo: false, mensaje: 'Vehículo sin historial activo.' });

        res.json({ activo: true, historial: historial[0] });
    } catch (err) {
        console.error('❌ Error en historial-activo:', err.message);
        res.status(500).json({ activo: false, error: err.message });
    }
});

router.post('/vehiculo/liberar/:placa', requireLogin, async (req, res) => {
    const placa = req.params.placa;
    if (!placa) return res.status(400).json({ success: false, error: 'Placa requerida', mensaje: 'Placa requerida' });

    try {
        const vehiculo = await Vehiculo.findByPlaca(placa);

        if (!vehiculo) {
            return res.status(404).json({ success: false, error: 'Vehículo no registrado', mensaje: 'Vehículo no registrado' });
        }
        const vehiculo_id = vehiculo.id;

        const { data: historial, error: errorHistorial } = await supabase
            .from('historial_parqueo')
            .select('id, celda_id, fecha_hora')
            .eq('vehiculo_id', vehiculo_id)
            .eq('estado', 'activo')
            .order('fecha_hora', { ascending: false })
            .limit(1);

        if (errorHistorial) throw errorHistorial;
        if (!historial?.length) {
            return res.status(404).json({ success: false, error: 'Vehículo no encontrado en historial activo', mensaje: 'Vehículo no encontrado en historial activo' });
        }
        const historial_id = historial[0].id;
        const celda_id = historial[0].celda_id;

        const fecha_salida = new Date().toISOString();
        const { error: updateHistorialError } = await supabase
            .from('historial_parqueo')
            .update({ estado: 'finalizado', fecha_salida: fecha_salida })
            .eq('id', historial_id);

        if (updateHistorialError) throw updateHistorialError;

        const { data: celdaInfo, error: errorCelda } = await supabase
            .from('celda')
            .update({ estado: 'libre' })
            .eq('id', celda_id)
            .select('numero, zona_id, parqueadero_id'); // Select additional info

        if (errorCelda) throw errorCelda;

        // Fetch zona and parqueadero names
        let zonaNombre = 'N/A';
        let parqueaderoNombre = 'N/A';
        if (celdaInfo && celdaInfo[0]) {
            const { data: zonaData, error: zonaError } = await supabase
                .from('zona')
                .select('nombre')
                .eq('id', celdaInfo[0].zona_id)
                .single();
            if (zonaData) zonaNombre = zonaData.nombre;

            const { data: parqueaderoData, error: parqueaderoError } = await supabase
                .from('parqueadero')
                .select('nombre')
                .eq('id', celdaInfo[0].parqueadero_id)
                .single();
            if (parqueaderoData) parqueaderoNombre = parqueaderoData.nombre;
        }

        res.json({
            success: true,
            mensaje: 'Vehículo liberado correctamente.',
            placa,
            celdaLiberada: celda_id,
            celdaNumero: celdaInfo ? celdaInfo[0].numero : 'N/A',
            zonaNombre: zonaNombre,
            parqueaderoNombre: parqueaderoNombre
        });
    } catch (err) {
        console.error('🔥 Error inesperado en liberar celda:', err.message);
        res.status(500).json({ success: false, error: 'Error inesperado al liberar celda', mensaje: err.message });
    }
});

router.post('/parquear', requireLogin, async (req, res) => {
    const { vehiculo_id, celda_id, placa } = req.body;

    if (!vehiculo_id || !celda_id || !placa) {
        return res.status(400).json({ success: false, mensaje: 'Datos incompletos para parquear.' });
    }

    try {
        const { data: celdaData, error: celdaError } = await supabase
            .from('celda')
            .select('estado')
            .eq('id', celda_id)
            .single();

        if (celdaError) throw celdaError;
        if (!celdaData || celdaData.estado !== 'libre') {
            return res.status(409).json({ success: false, mensaje: 'La celda no está libre o no existe.' });
        }

        const { error: historialError } = await supabase
            .from('historial_parqueo')
            .insert([{ celda_id: celda_id, vehiculo_id: vehiculo_id, fecha_hora: new Date().toISOString(), estado: 'activo' }]);

        if (historialError) throw historialError;

        const { error: updateCeldaError } = await supabase
            .from('celda')
            .update({ estado: 'ocupada' })
            .eq('id', celda_id);

        if (updateCeldaError) throw updateCeldaError;

        res.status(200).json({ success: true, mensaje: 'Vehículo parqueado correctamente.' });

    } catch (error) {
        console.error('Error al parquear vehículo:', error.message);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor al parquear el vehículo.', error: error.message });
    }
});

router.post('/vehiculo/registrar', requireLogin, async (req, res) => {
    try {
        const { placa, color, modelo, marca, tipo, usuario_id_usuario } = req.body;

        if (!placa || !color || !modelo || !marca || !tipo || !usuario_id_usuario) {
            return res.status(400).json({ success: false, mensaje: 'Todos los campos son obligatorios.' });
        }

        const placaNormalizada = normalizePlaca(placa);

        const vehiculoExistente = await Vehiculo.findByPlaca(placaNormalizada);
        if (vehiculoExistente) {
            return res.status(409).json({ success: false, mensaje: 'Un vehículo con esta placa ya está registrado.' });
        }

        const nuevoVehiculo = new Vehiculo(
            null,
            placaNormalizada,
            color,
            modelo,
            marca,
            tipo,
            usuario_id_usuario
        );

        const vehiculoGuardado = await nuevoVehiculo.save();

        res.status(201).json({
            success: true,
            mensaje: 'Vehículo registrado exitosamente.',
            vehiculo: vehiculoGuardado.toJSON()
        });

    } catch (error) {
        console.error('Error en el controlador al registrar vehículo:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor al registrar el vehículo.',
            error: error.message
        });
    }
});

router.post('/usuario/registrar', requireLogin, async (req, res) => {
    try {
        const { documento, primer_nombre, primer_apellido, correo, celular } = req.body;

        if (!documento || !primer_nombre || !primer_apellido || !correo || !celular) {
            return res.status(400).json({ success: false, mensaje: 'Todos los campos de usuario son obligatorios.' });
        }

        const nuevoUsuario = new Usuario(
            null,
            documento,
            primer_nombre,
            null,
            primer_apellido,
            null,
            correo,
            celular,
            'CC',
            'default_clave',
            'activo',
            3
        );

        const usuarioGuardado = await nuevoUsuario.save();

        res.status(201).json({
            success: true,
            mensaje: 'Propietario registrado exitosamente.',
            usuario: usuarioGuardado.toJSON()
        });

    } catch (error) {
        console.error('Error en el controlador al registrar usuario:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor al registrar el propietario.',
            error: error.message
        });
    }
});

router.get('/celdas/disponibles', requireLogin, async (req, res) => {
    try {
        const { parqueadero_id, zona_id, all } = req.query;
        let query = supabase.from('celda').select('*, zona(nombre)');
        if (parqueadero_id) query = query.eq('parqueadero_id', parqueadero_id);
        if (zona_id) query = query.eq('zona_id', zona_id);
        if (!all) query = query.ilike('estado', '%libre%');

        const { data, error } = await query;
        if (error) throw error;

        const celdasConInfo = await Promise.all((data || []).map(async celda => {
            if (celda.zona && celda.zona.nombre) {
                celda.zona_nombre = celda.zona.nombre;
                delete celda.zona;
            }

            if (celda.estado === 'ocupada') {
                const { data: historialParqueo, error: histError } = await supabase
                    .from('historial_parqueo')
                    .select('vehiculo(placa, usuario(numero_documento))')
                    .eq('celda_id', celda.id)
                    .eq('estado', 'activo')
                    .order('fecha_hora', { ascending: false })
                    .limit(1)
                    .single();

                if (historialParqueo && historialParqueo.vehiculo) {
                    celda.placa = historialParqueo.vehiculo.placa;
                    celda.usuario = historialParqueo.vehiculo.usuario;
                }
            }
            return celda;
        }));

        res.json({ celdas: celdasConInfo });
    } catch (err) {
        console.error('Error al buscar celdas disponibles:', err.message);
        res.status(500).json({ celdas: [], error: err.message });
    }
});

router.get('/parqueaderos', requireLogin, async (req, res) => {
    if (req.query.json === '1') {
        try {
            const { data: parqueaderos, error } = await supabase.from('parqueadero').select('*').order('nombre');
            if (error) throw error;
            return res.json(parqueaderos || []);
        } catch (err) {
            console.error('Error al cargar parqueaderos (JSON):', err.message);
            return res.status(500).json({ parqueaderos: [], error: err.message });
        }
    } else {
        try {
            const { data: zonas } = await supabase.from('zona').select('*');
            const { data: celdas } = await supabase.from('celda').select('*');
            res.render('admin/parqueaderos', {
                titulo: 'Gestionar Parqueaderos',
                userName: req.session.userName,
                zonas: zonas || [],
                celdas: celdas || []
            });
        } catch (err) {
            console.error('Error al cargar vista de parqueaderos:', err.message);
            res.status(500).send('Error interno.');
        }
    }
});

router.get('/incidencia', requireLogin, async (req, res) => {
    try {
        const { data: reportes, error: errorReportes } = await supabase
            .from('reporte_incidencia')
            .select(`
                vehiculo:vehiculo_id (placa, marca),
                incidencia:incidencia_id (nombre),
                fecha_hora
            `);

        if (errorReportes) throw errorReportes;

        const { data: incidencias, error: errorIncidencias } = await supabase
            .from('incidencia')
            .select('*');

        if (errorIncidencias) throw errorIncidencias;

        const { data: vehiculos, error: errorVehiculos } = await supabase
            .from('vehiculo')
            .select('id, placa, marca');

        if (errorVehiculos) throw errorVehiculos;

        res.render('admin/incidencia', {
            userName: req.session.userName || 'Admin',
            reportes: reportes.map(r => ({
                placa: r.vehiculo.placa,
                marca: r.vehiculo.marca,
                incidencia_nombre: r.incidencia.nombre,
                fecha_hora: r.fecha_hora,
                vehiculo_id: r.vehiculo_id,
                incidencia_id: r.incidencia_id
            })),
            incidencias,
            vehiculos,
            titulo: 'Incidencias'
        });
    } catch (error) {
        console.error('Error cargando /admin/incidencia:', error);
        res.status(500).send('Error al cargar la vista de incidencias');
    }
});

router.post('/incidencia', requireLogin, async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });

    const { data, error } = await supabase
        .from('incidencia')
        .insert([{ nombre }])
        .select();

    if (error) {
        console.error('Error Supabase (tipo):', error);
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
});

router.get('/vista_parqueaderos', requireLogin, async (req, res) => {
    try {
        const { data: parqueaderos } = await supabase.from('parqueadero').select('*');
        const { data: zonas } = await supabase.from('zona').select('*');
        const { data: celdas } = await supabase.from('celda').select('*');
        res.render('admin/vista_parqueaderos', {
            titulo: 'Vista General de Parqueaderos',
            userName: req.session.userName,
            parqueaderos,
            zonas,
            celdas
        });
    } catch (err) {
        console.error('Error al cargar vista completa:', err.message);
        res.status(500).send('Error interno al cargar la vista.');
    }
});

module.exports = router;
