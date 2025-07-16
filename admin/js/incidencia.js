$(document).ready(function () {
  // Inicializar DataTables en español
  $('#tabla-reportes').DataTable({ language: { url: '/admin/js/es-ES.json' } });
  $('#tabla-tipos').DataTable({ language: { url: '/admin/js/es-ES.json' } });

  // Referencias a modales
  const modalTipo = document.getElementById('modalTipo');
  const modalReporte = document.getElementById('modalReporte');

  // Abrir modal de tipo
  $('#abrirModalTipo').on('click', () => {
    $('#formTipo')[0].reset();
    $('#tipoId').val('');
    $('#modalTipoTitulo').text('Crear Tipo de Incidencia');
    modalTipo.style.display = 'flex';
  });

  // Abrir modal de reporte
  $('#abrirModalReporte').on('click', () => {
    $('#formReporte')[0].reset();
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    $('#reporteFechaHora').val(now.toISOString().slice(0, 16));
    modalReporte.style.display = 'flex';
  });

  // Cerrar modales
  $('#cerrarModalTipo, #cerrarModalReporte').on('click', function () {
    $(this).closest('.modal').hide();
  });

  // Cerrar si se hace clic fuera
  window.onclick = function (event) {
    if (event.target === modalTipo) modalTipo.style.display = 'none';
    if (event.target === modalReporte) modalReporte.style.display = 'none';
  };

  // Crear o editar tipo (usa /api/tipos)
  $('#formTipo').on('submit', async function (e) {
    e.preventDefault();
    const id = $('#tipoId').val();
    const nombre = $('#tipoNombre').val().trim();

    if (!nombre) {
      alert('Debes ingresar un tipo de incidencia.');
      return;
    }

    const url = id ? `/api/tipos/${id}` : '/api/tipos';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo guardar el tipo.');
      }

      alert('Tipo guardado.');
      location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });

  // Crear reporte (usa /api/reporte_incidencias)
  $('#formReporte').on('submit', async function (e) {
    e.preventDefault();

    const vehiculo_id = $('#reporteVehiculo').val();
    const incidencia_id = $('#reporteIncidencia').val();
    const fecha_raw = $('#reporteFechaHora').val();

    if (!vehiculo_id || !incidencia_id || !fecha_raw) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const fecha_hora = fecha_raw + ':00'; // ajustar segundos

    try {
      const response = await fetch('/api/reporte_incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehiculo_id, incidencia_id, fecha_hora })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudo crear el reporte.');
      }

      alert('Reporte creado.');
      location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });
});

// Editar tipo
function editarTipo(id, nombre) {
  $('#formTipo')[0].reset();
  $('#tipoId').val(id);
  $('#tipoNombre').val(nombre);
  $('#modalTipoTitulo').text('Editar Tipo de Incidencia');
  document.getElementById('modalTipo').style.display = 'flex';
}

// Eliminar tipo
async function eliminarTipo(id) {
  if (!confirm('¿Eliminar este tipo de incidencia?')) return;
  try {
    const response = await fetch(`/api/tipos/${id}`, { method: 'DELETE' });
    if (response.status !== 204) throw new Error('No se pudo eliminar el tipo.');
    alert('Tipo eliminado.');
    location.reload();
  } catch (error) {
    alert(error.message);
  }
}

// Editar reporte
function editarReporte(vehiculo_id, incidencia_id, fecha_hora) {
  $('#formReporte')[0].reset();
  $('#reporteVehiculo').val(vehiculo_id);
  $('#reporteIncidencia').val(incidencia_id);
  $('#reporteFechaHora').val(fecha_hora.slice(0, 16));
  document.getElementById('modalReporte').style.display = 'flex';
}

// Eliminar reporte
async function eliminarReporte(vehiculo_id, incidencia_id, fecha_hora) {
  if (!confirm('¿Eliminar este reporte?')) return;
  const fechaParam = encodeURIComponent(fecha_hora);
  try {
    const response = await fetch(`/api/reporte_incidencias/${vehiculo_id}/${incidencia_id}/${fechaParam}`, {
      method: 'DELETE'
    });
    if (response.status !== 204) throw new Error('No se pudo eliminar el reporte.');
    alert('Reporte eliminado.');
    location.reload();
  } catch (error) {
    alert(error.message);
  }
}
