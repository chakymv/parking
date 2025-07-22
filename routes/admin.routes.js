const express = require('express');
const router = express.Router();
const { Usuario } = require('../model');
const Vehiculo = require('../model/Vehiculo');
const HistorialParqueo = require('../model/HistorialParqueo');
const Celda = require('../model/Celda');
const catchAsync = require('../utils/catchAsync');
const { normalizePlaca } = require('../utils/normalizer');

const { supabase } = require('../supabaseClient');

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

router.get('/crear_celdas', requireLogin, (req, res) => {
    res.render('admin/crear_celdas', { titulo: 'Crear Celdas', userName: req.session.userName });
});

router.get('/crear_zonas', requireLogin, (req, res) => {
    res.render('admin/crear_zonas', { titulo: 'Crear Zonas', userName: req.session.userName });
});

router.get('/zonas', requireLogin, async (req, res) => {
    try {
        const { data: zonas, error } = await supabase
            .from('zona')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            return res.status(500).json({ error: 'Error al obtener zonas' });
        }

        if (req.query.json === '1') {
            return res.json({ zonas });
        }

        res.render('admin/zonas', { titulo: 'Gestionar Zonas', userName: req.session.userName, zonas: zonas || [] });
    } catch (err) {
        res.status(500).json({ error: 'Error inesperado al obtener zonas' });
    }
});

router.post('/', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });

    const { data, error } = await supabase
        .from('incidencia')
        .insert([{ nombre }])
        .select();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
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
        res.status(500).send('Error al cargar la vista de incidencias');
    }
});

router.get('/parqueaderos', requireLogin, async (req, res) => {
    try {
        const { data: parqueaderos, error: parqueaderosError } = await supabase.from('parqueadero').select('*');
        if (parqueaderosError) throw parqueaderosError;

        if (req.query.json === '1') {
            return res.json(parqueaderos);
        }

        const { data: zonas, error: zonasError } = await supabase.from('zona').select('*');
        if (zonasError) throw zonasError;
        const { data: celdas, error: celdasError } = await supabase.from('celda').select('*');
        if (celdasError) throw celdasError;

        res.render('admin/parqueaderos', {
            titulo: 'Gestionar Parqueaderos',
            userName: req.session.userName,
            parqueaderos: parqueaderos || [],
            zonas: zonas || [],
            celdas: celdas || []
        });
    } catch (err) {
        res.status(500).send('Error interno.');
    }
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
        res.status(500).send('Error interno al cargar la vista.');
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
        res.status(500).send('Error interno al cargar operación.');
    }
});

router.get('/vehiculo/existe', requireLogin, async (req, res) => {
    const placa = req.query.placa;
    if (!placa) return res.status(400).json({ error: 'Placa no especificada' });

    try {
        const vehiculo = await Vehiculo.findByPlaca(placa);
        let historialActivo = null;

        if (vehiculo) {
            const historialData = await HistorialParqueo.findByVehicleId(vehiculo.id);

            if (historialData && historialData.estado === 'activo') {
                historialActivo = historialData.toJSON();

                const celdaInfo = await Celda.findById(historialActivo.celda_id);
                if (celdaInfo) {
                    historialActivo.celda_numero = celdaInfo.numero;

                    const { data: zonaData, error: zonaError } = await supabase
                        .from('zona')
                        .select('nombre')
                        .eq('id', celdaInfo.zona_id)
                        .single();
                    if (zonaError && zonaError.code !== 'PGRST116') throw zonaError;
                    historialActivo.zona_nombre = zonaData ? zonaData.nombre : 'N/A';

                    const { data: parqueaderoData, error: parqueaderoError } = await supabase
                        .from('parqueadero')
                        .select('nombre')
                        .eq('id', celdaInfo.parqueadero_id)
                        .single();
                    if (parqueaderoError && parqueaderoError.code !== 'PGRST116') throw parqueaderoError;
                    historialActivo.parqueadero_nombre = parqueaderoData ? parqueaderoData.nombre : 'N/A';
                } else {
                    historialActivo.celda_numero = 'N/A';
                    historialActivo.zona_nombre = 'N/A';
                    historialActivo.parqueadero_nombre = 'N/A';
                }
            }
        }

        res.json({
            existe: !!vehiculo,
            vehiculo: vehiculo ? vehiculo.toJSON() : null,
            historialActivo: historialActivo
        });
    } catch (err) {
        res.status(500).json({ error: 'Error inesperado =(' });
    }
});

router.post('/vehiculo/liberar/:placa', async (req, res) => {
    const placa = req.params.placa;
    const placa_normalizada = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!placa_normalizada) {
        return res.status(400).json({ error: 'Placa no proporcionada o inválida' });
    }

    try {
        const vehiculo = await Vehiculo.findByPlaca(placa_normalizada);

        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no registrado' });
        }

        const historial = await HistorialParqueo.findByVehicleId(vehiculo.id);

        if (!historial || historial.estado !== 'activo') {
            return res.status(404).json({ error: 'Vehículo sin historial de ingreso activo' });
        }

        const historial_id = historial.id;
        const celda_id = historial.celda_id;
        const horaSalida = new Date().toISOString();

        const { error: errorCelda } = await supabase
            .from('celda')
            .update({ estado: 'libre' })
            .eq('id', celda_id);

        const { error: errorHistorialUpdate } = await supabase
            .from('historial_parqueo')
            .update({ estado: 'finalizado', salida: horaSalida })
            .eq('id', historial_id);

        if (errorCelda || errorHistorialUpdate) {
            return res.status(500).json({ error: 'No se pudo liberar la celda o cerrar historial' });
        }

        const celdaInfo = await Celda.findById(celda_id);
        let celdaNumero = 'N/A';
        let zonaNombre = 'N/A';
        let parqueaderoNombre = 'N/A';

        if (celdaInfo) {
            celdaNumero = celdaInfo.numero;
            const { data: zonaData } = await supabase.from('zona').select('nombre').eq('id', celdaInfo.zona_id).single();
            zonaNombre = zonaData ? zonaData.nombre : 'N/A';
            const { data: parqueaderoData } = await supabase.from('parqueadero').select('nombre').eq('id', celdaInfo.parqueadero_id).single();
            parqueaderoNombre = parqueaderoData ? parqueaderoData.nombre : 'N/A';
        }

        res.json({
            success: true,
            placa: placa_normalizada,
            celdaNumero,
            zonaNombre,
            parqueaderoNombre,
            horaSalida
        });
    } catch (err) {
        res.status(500).json({ error: 'Error inesperado al procesar la salida' });
    }
});

router.get('/celdas/disponibles', requireLogin, async (req, res) => {
    const { parqueadero_id, zona_id, tipo, all } = req.query;

    let query = supabase.from('celda').select(`
        id,
        numero,
        tipo,
        estado,
        zona (
            id,
            nombre
        ),
        parqueadero (
            id,
            nombre
        )
    `);

    if (parqueadero_id) {
        query = query.eq('parqueadero_id', parqueadero_id);
    }
    if (zona_id) {
        query = query.eq('zona_id', zona_id);
    }
    if (tipo) {
        query = query.eq('tipo', tipo);
    }

    if (all !== '1') {
        query = query.eq('estado', 'libre');
    } else {
        query = query.select(`
            id,
            numero,
            tipo,
            estado,
            zona (
                id,
                nombre
            ),
            parqueadero (
                id,
                nombre
            ),
            historial_parqueo!left (
                vehiculo_id,
                estado,
                vehiculo (
                    placa,
                    usuario (
                        numero_documento
                    )
                )
            )
        `);
    }

    const { data, error } = await query.order('numero', { ascending: true });

    if (error) {
        return res.status(500).json({ error: 'Error al obtener celdas disponibles' });
    }

    const celdasProcesadas = data.map(celda => {
        const processedCelda = { ...celda };
        if (all === '1' && celda.estado === 'ocupada' && processedCelda.historial_parqueo && processedCelda.historial_parqueo.length > 0) {
            const historialActivo = processedCelda.historial_parqueo.find(h => h.estado === 'activo');
            if (historialActivo && historialActivo.vehiculo) {
                processedCelda.placa = historialActivo.vehiculo.placa;
                processedCelda.usuario = historialActivo.vehiculo.usuario;
            }
        }
        delete processedCelda.historial_parqueo;
        return processedCelda;
    });

    res.json({ celdas: celdasProcesadas });
});

router.post('/asignar-celda', async (req, res) => {
    const { vehiculo_id, celda_id } = req.body;

    if (!vehiculo_id || !celda_id) {
        return res.status(400).json({ error: 'Faltan datos de vehículo o celda.' });
    }

    try {
        const { data: celdaData, error: celdaError } = await supabase
            .from('celda')
            .select('estado')
            .eq('id', celda_id)
            .single();

        if (celdaError || !celdaData) {
            return res.status(404).json({ error: 'Celda no encontrada.' });
        }

        if (celdaData.estado !== 'libre') {
            return res.status(409).json({ error: 'La celda seleccionada no está libre.' });
        }

        const { data: historialData, error: historialError } = await supabase
            .from('historial_parqueo')
            .insert({
                celda_id: celda_id,
                vehiculo_id: vehiculo_id,
                entrada: new Date().toISOString(),
                estado: 'activo'
            })
            .select()
            .single();

        if (historialError) {
            return res.status(500).json({ error: 'Error al registrar el ingreso del vehículo.' });
        }

        const { error: updateCeldaError } = await supabase
            .from('celda')
            .update({ estado: 'ocupada' })
            .eq('id', celda_id);

        if (updateCeldaError) {
            return res.status(500).json({ error: 'Error al actualizar el estado de la celda.' });
        }

        res.status(200).json({ success: true, mensaje: 'Celda asignada y vehículo ingresado correctamente.' });

    } catch (err) {
        res.status(500).json({ error: 'Error inesperado al asignar celda.' });
    }
});

router.get('/usuarios/buscar', requireLogin, async (req, res) => {
    const query = req.query.query;
    if (!query) {
        const { data, error } = await supabase
            .from('usuario')
            .select('id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_documento, direccion_correo, numero_celular')
            .order('primer_nombre', { ascending: true });
        if (error) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        return res.json({ usuarios: data });
    }

    try {
        const { data, error } = await supabase
            .from('usuario')
            .select('id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_documento, direccion_correo, numero_celular')
            .or(`numero_documento.ilike.%${query}%,primer_nombre.ilike.%${query}%,primer_apellido.ilike.%${query}%`)
            .limit(10);

        if (error) {
            return res.status(500).json({ error: 'Error al buscar usuarios' });
        }
        res.json({ usuarios: data });
    } catch (err) {
        res.status(500).json({ error: 'Error inesperado al buscar usuarios' });
    }
});


module.exports = router;
