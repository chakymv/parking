const express = require('express');
const router = express.Router();
const { Usuario } = require('../model'); // Asume que el modelo Usuario está exportado correctamente
const Vehiculo = require('../model/Vehiculo'); // Importa el modelo Vehiculo
const HistorialParqueo = require('../model/HistorialParqueo'); // Importa el modelo HistorialParqueo
const Celda = require('../model/Celda'); // Importa el modelo Celda
const catchAsync = require('../utils/catchAsync');

const supabase = require('../supabaseClient');

// Middleware de sesión
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/admin/login');
    next();
};

// --- AUTENTICACIÓN ---
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

// --- VISTAS DEL PANEL ---
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

router.get('/zonas', requireLogin, (req, res) => {
    res.render('admin/zonas', { titulo: 'Gestionar Zonas', userName: req.session.userName });
});


router.post('/', async (req, res) => {
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


router.get('/parqueaderos', requireLogin, async (req, res) => {
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
        console.error('Error al cargar parqueaderos:', err.message);
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
        console.error('Error al cargar vista completa:', err.message);
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
        console.error('Error en /admin/operar:', err.message);
        res.status(500).send('Error interno al cargar operación.');
    }
});

router.get('/vehiculo/existe', requireLogin, async (req, res) => {
    const placa = req.query.placa;
    if (!placa) return res.status(400).json({ error: 'Placa no especificada' });

    try {
        const { data, error } = await supabase
            .from('vehiculo')
            .select('id')
            .ilike('placa', `%${placa.trim().toUpperCase()}%`)
            .limit(1);

        if (error) {
            console.error('Error al consultar vehículo:', error.message);
            return res.status(500).json({ error: 'Error interno en la consulta' });
        }

        res.json({ existe: !!data?.length });
    } catch (err) {
        console.error('Error inesperado en vehiculo/existe:', err.message);
        res.status(500).json({ error: 'Error inesperado =(' });
    }
});


router.post('/salida-vehiculo', async (req, res) => {
    const { placa } = req.body;
    const placa_normalizada = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!placa_normalizada) {
        return res.status(400).json({ error: 'Placa no proporcionada o inválida' });
    }

    try {
        const { data: vehiculos, error: errorVehiculo } = await supabase
            .from('vehiculo')
            .select('id')
            .ilike('placa', `%${placa_normalizada}%`)
            .limit(1);

        if (errorVehiculo) {
            console.error('Error al buscar vehículo:', errorVehiculo.message);
            return res.status(500).json({ error: 'Error al buscar vehículo' });
        }

        if (!vehiculos?.length) {
            return res.status(404).json({ error: 'Vehículo no registrado' });
        }

        const vehiculo_id = vehiculos[0].id;

        const { data: historial, error: errorHistorial } = await supabase
            .from('historial_parqueo')
            .select('id, celda_id, entrada, salida, estado') 
            .eq('vehiculo_id', vehiculo_id)
            .eq('estado', 'activo') 
            .order('entrada', { ascending: false })
            .limit(1);

        if (errorHistorial) {
            console.error('Error al consultar historial:', errorHistorial.message);
            return res.status(500).json({ error: 'Error al consultar historial' });
        }

        if (!historial?.length) {
            return res.status(404).json({ error: 'Vehículo sin historial de ingreso activo' });
        }

        const historial_id = historial[0].id;
        const celda_id = historial[0].celda_id;
        const horaIngreso = historial[0].entrada; 
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
            console.error('Error al liberar celda o cerrar historial:', errorCelda?.message || errorHistorialUpdate?.message);
            return res.status(500).json({ error: 'No se pudo liberar la celda o cerrar historial' });
        }

        res.json({
            success: true,
            placa: placa_normalizada,
            celdaLiberada: celda_id,
            horaIngreso,
            horaSalida
        });
    } catch (err) {
        console.error('Error inesperado en salida-vehiculo:', err.message);
        res.status(500).json({ error: 'Error inesperado al procesar la salida' });
    }
});


router.post('/asignar-celda', async (req, res) => {
    const { celda_id, placa, documento, color, modelo, marca, tipo, usuario_id_usuario } = req.body;

    let vehiculo = await Vehiculo.findByPlaca(normalizePlaca(placa));
    let vehiculo_id;

    if (!vehiculo) {
        const nuevoVehiculo = new Vehiculo(
            null,
            normalizePlaca(placa),
            color?.trim(),
            modelo?.trim(),
            marca?.trim(),
            tipo?.trim(),
            Number(usuario_id_usuario)
        );
        await nuevoVehiculo.create();
        vehiculo_id = nuevoVehiculo.id;
    } else {
        vehiculo_id = vehiculo.id;
    }

    const { error: errorHistorial } = await supabase
        .from('historial_parqueo')
        .insert([{
            celda_id: Number(celda_id),
            vehiculo_id: vehiculo_id,
            entrada: new Date().toISOString(), 
            estado: 'activo' 
        }]);

    if (errorHistorial) {
        console.error('Error al registrar historial:', errorHistorial.message);
        return res.status(500).json({ error: 'Error al registrar ingreso' });
    }

    const { error: errorCelda } = await supabase
        .from('celda')
        .update({ estado: 'ocupada' })
        .eq('id', Number(celda_id));

    if (errorCelda) {
        console.error('Error al actualizar celda:', errorCelda.message);
        return res.status(500).json({ error: 'No se pudo actualizar estado de celda' });
    }

    res.status(200).json({ success: true, mensaje: 'Celda asignada y vehículo ingresado correctamente.' });
});


module.exports = router;
