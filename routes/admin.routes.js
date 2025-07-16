const express = require('express');
const router = express.Router();
const { Usuario } = require('../model');
const catchAsync = require('../utils/catchAsync');

const supabase = require('../supabaseClient');

//Incidencia
const TipoIncidencia = require('../model/TipoIncidencia');
const ReporteIncidencia = require('../model/ReporteIncidencia');
const Vehiculo = require('../model/Vehiculo');

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
// Vista principal de operación
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


router.get('/salida-vehiculo', requireLogin, async (req, res) => {
  const placa = req.query.placa;

  if (!placa) {
    console.warn('⚠️ Placa no proporcionada en la solicitud de salida');
    return res.status(400).json({ error: 'Placa no proporcionada' });
  }

  const placa_normalizada = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  console.log(`🚗 Procesando salida para placa: ${placa_normalizada}`);

  try {
    // 🔍 Buscar vehículo por placa
    const { data: vehiculos, error: errorVehiculo } = await supabase
      .from('vehiculo')
      .select('id')
      .ilike('placa', `%${placa_normalizada}%`)
      .limit(1);

    if (errorVehiculo) {
      console.error('❌ Error al buscar vehículo:', errorVehiculo.message);
      return res.status(500).json({ error: 'Error al buscar vehículo' });
    }

    if (!vehiculos?.length) {
      console.warn(`⚠️ Vehículo no registrado: ${placa_normalizada}`);
      return res.status(404).json({ error: 'Vehículo no registrado' });
    }

    const vehiculo_id = vehiculos[0].id;
    console.log('✅ Vehículo encontrado. ID:', vehiculo_id);

    // 📘 Buscar historial de ingreso
    const { data: historial, error: errorHistorial } = await supabase
      .from('historial_parqueo')
      .select('id, celda_id, fecha_hora')
      .eq('vehiculo_id', vehiculo_id)
      .order('fecha_hora', { ascending: false })
      .limit(1);

    if (errorHistorial) {
      console.error('❌ Error al consultar historial:', errorHistorial.message);
      return res.status(500).json({ error: 'Error al consultar historial' });
    }

    if (!historial?.length) {
      console.warn(`⚠️ Vehículo sin historial de ingreso: ${placa_normalizada}`);
      return res.status(404).json({ error: 'Vehículo no encontrado en historial' });
    }

    const celda_id = historial[0].celda_id;
    const horaIngreso = historial[0].fecha_hora;

    // 🔁 Actualizar estado de celda a "libre"
    const { error: errorCelda } = await supabase
      .from('celda')
      .update({ estado: 'libre' })
      .eq('id', celda_id);

    if (errorCelda) {
      console.error('❌ Error al liberar celda:', errorCelda.message);
      return res.status(500).json({ error: 'No se pudo liberar la celda' });
    }

    const horaSalida = new Date().toISOString();
    console.log(`✅ Celda liberada (${celda_id}) para placa: ${placa_normalizada}`);

    // 🧾 Respuesta enriquecida
    res.json({
      success: true,
      placa: placa_normalizada,
      celdaLiberada: celda_id,
      horaIngreso,
      horaSalida
    });
  } catch (err) {
    console.error('🔥 Error inesperado en salida-vehiculo:', err.message);
    res.status(500).json({ error: 'Error inesperado al procesar la salida' });
  }
});



// version con logs
// --- API: Asignar celda (con logs) ---
router.post('/asignar-celda', requireLogin, async (req, res) => {
  const { celda_id, placa, documento } = req.body;
  const fecha_hora = new Date().toISOString();

  console.log('➡️ Inicio asignación de celda');
  console.log('Datos recibidos:', { celda_id, placa, documento });

  try {
    // 🔍 Usuario
    const { data: usuarios, error: errorUsuario } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('numero_documento', documento)
      .limit(1);

    if (errorUsuario) {
      console.error('❌ Error al buscar usuario:', errorUsuario.message);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }

    if (!usuarios?.length) {
      console.warn('⚠️ Usuario no encontrado:', documento);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario_id_usuario = usuarios[0].id_usuario;
    console.log('✅ Usuario encontrado. ID:', usuario_id_usuario);

    // 🔍 Vehículo
    const placa_normalizada = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const { data: vehiculos, error: errorVehiculo } = await supabase
      .from('vehiculo')
      .select('id')
      .eq('placa', placa_normalizada)
      .limit(1);

    if (errorVehiculo) {
      console.error('❌ Error al verificar vehículo:', errorVehiculo.message);
      return res.status(500).json({ error: 'Error al verificar vehículo' });
    }

    let vehiculo_id;

    if (!vehiculos?.length) {
      console.log('🆕 Vehículo no registrado. Procediendo a crear:', placa_normalizada);
      const { data: nuevoVehiculo, error: errorNuevoVehiculo } = await supabase
        .from('vehiculo')
        .insert([{ placa: placa_normalizada, tipo: 'Carro', usuario_id_usuario }])
        .select('id');

      if (errorNuevoVehiculo || !nuevoVehiculo?.length) {
        console.error('❌ Error al registrar vehículo:', errorNuevoVehiculo?.message);
        return res.status(500).json({ error: 'No se pudo registrar el vehículo' });
      }

      vehiculo_id = nuevoVehiculo[0].id;
      console.log('✅ Vehículo registrado. ID:', vehiculo_id);
    } else {
      vehiculo_id = vehiculos[0].id;
      console.log('✅ Vehículo existente. ID:', vehiculo_id);
    }


    // 📘 Historial
    console.log('🚧 Confirmando vehiculo_id antes de historial:', vehiculo_id);

   
    const { error: errorHistorial } = await supabase
      .from('historial_parqueo')
      .insert([{ celda_id, vehiculo_id, fecha_hora }]);

    if (errorHistorial) {
      console.error('❌ Error al registrar historial:', errorHistorial.message);
      return res.status(500).json({ error: 'Error al registrar ingreso' });
    }
    console.log('✅ Historial registrado correctamente');

    // 🔁 Actualizar celda
    console.log('🔁 Actualizando estado de celda:', celda_id);
    const { error: errorCelda } = await supabase
      .from('celda')
      .update({ estado: 'ocupado' })
      .eq('id', celda_id);

    if (errorCelda) {
      console.error('❌ Error al actualizar celda:', errorCelda.message);
      return res.status(500).json({ error: 'No se pudo actualizar estado de celda' });
    }
    console.log('✅ Celda actualizada como ocupada');

    console.log('✅ Proceso de asignación finalizado con éxito\n');
    res.json({ success: true });
  } catch (err) {
    console.error('🔥 Error inesperado en asignar-celda:', err.message);
    res.status(500).json({ error: 'Error inesperado al asignar celda' });
  }
});

router.get('/incidencias', async (req, res) => {
  try {
    const tipos = await TipoIncidencia.findAll(); 
    const reportes = await ReporteIncidencia.findAllExtendido();
    const vehiculos = await Vehiculo.findAll();

    res.render('admin/incidencias', {
      titulo: 'Gestión de Incidencias',
      tipos,
      reportes,
      vehiculos
    });
  } catch (err) {
    console.error('ERROR INESPERADO:', err);
    res.status(500).send('Ocurrió un error al cargar la vista');
  }
});


// Exportar módulo de rutas
module.exports = router;
