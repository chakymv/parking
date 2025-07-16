document.addEventListener('DOMContentLoaded', () => {
  // --- State Management ---
  let vehiculos = [];
  let vehiculoSeleccionadoId = null;
  let dataTableInstance = null;

  // --- DOM Elements ---
  const modal = document.getElementById('modal-vehiculo');
  const modalTitulo = document.getElementById('modal-titulo');
  const form = document.getElementById('form-vehiculo');
  const table = document.getElementById('vehiculos-table');
  const modalMsg = document.getElementById('modal-msg');
  const inputBuscarDoc = document.getElementById('usuario-buscar-doc');
  const selectUsuario = document.getElementById('usuario_id_usuario');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const btnAbrirModalCrear = document.getElementById('btn-abrir-modal-crear');
  const btnGuardar = document.getElementById('btn-guardar-vehiculo');
  const btnEliminar = document.getElementById('btn-eliminar-vehiculo');

  // --- Modal Functions ---
  function abrirModalCrear() {
    vehiculoSeleccionadoId = null;
    modalTitulo.innerText = 'Agregar Nuevo Vehículo';
    form.reset();
    selectUsuario.innerHTML = '<option value="">Seleccione un propietario</option>';
    if(modalMsg) modalMsg.innerText = '';
    
    if(btnEliminar) btnEliminar.style.display = 'none';
    if(btnGuardar) btnGuardar.innerText = 'Guardar';
    modal.classList.add('active');
  }

  async function abrirModalEditar(vehiculo) {
    if (!vehiculo) {
      alert('Error: Vehículo no encontrado.');
      return;
    }

    vehiculoSeleccionadoId = vehiculo.id;
    modalTitulo.innerText = 'Editar Vehículo';
    form.reset();
    if(modalMsg) modalMsg.innerText = '';

    // Rellenar el formulario con los datos del vehículo
    for (const key in vehiculo) {
      if (form.elements[key]) {
        form.elements[key].value = vehiculo[key] || '';
      }
    }

    // Cargar y mostrar el propietario actual
    selectUsuario.innerHTML = '<option>Cargando propietario...</option>';
    try {
      const res = await fetch(`/api/usuarios/${vehiculo.usuario_id_usuario}`);
      if (res.ok) {
        const usuario = await res.json();
        const nombres = `${usuario.primer_nombre} ${usuario.primer_apellido}`.trim();
        selectUsuario.innerHTML = `<option value="${usuario.id_usuario}" selected>${usuario.numero_documento} - ${nombres}</option>`;
      } else {
        selectUsuario.innerHTML = `<option value="">Propietario no encontrado</option>`;
      }
    } catch (error) {
      selectUsuario.innerHTML = `<option value="">Error al cargar propietario</option>`;
    }

    if(btnEliminar) btnEliminar.style.display = 'inline-block';
    if(btnGuardar) btnGuardar.innerText = 'Guardar Cambios';
    modal.classList.add('active');
  }

  function cerrarModal() {
    modal.classList.remove('active');
  }

  // --- Data and Table Functions ---
  function inicializarTabla() {
    dataTableInstance = $(table).DataTable({
      data: [],
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'placa', title: 'Placa' },
        { data: 'color', title: 'Color' },
        { data: 'modelo', title: 'Modelo' },
        { data: 'marca', title: 'Marca' },
        { data: 'tipo', title: 'Tipo' },
        { data: 'usuario_id_usuario', title: 'ID Usuario' },
      ],
      responsive: true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json"
      },
      createdRow: function(row) {
        $(row).addClass('clickable-row');
      }
    });

    // Event listener para clics en las filas
    $('#vehiculos-table tbody').on('click', 'tr', function () {
      const rowData = dataTableInstance.row(this).data();
      if (!rowData) return;
      const vehiculoCompleto = vehiculos.find(v => v.id == rowData.id);
      abrirModalEditar(vehiculoCompleto);
    });
  }

  async function cargarVehiculos() {
    try {
      const res = await fetch('/api/vehiculos');
      if (!res.ok) throw new Error('Error al cargar los vehículos.');
      
      vehiculos = await res.json();
      if (dataTableInstance) {
        dataTableInstance.clear().rows.add(vehiculos).draw();
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function guardarVehiculo(e) {
    e.preventDefault();
    if(modalMsg) modalMsg.innerText = '';
    const data = Object.fromEntries(new FormData(form));
    // Estandarizar la placa a mayúsculas para consistencia
    if (data.placa) {
      data.placa = data.placa.trim().toUpperCase();
    }

    let url = '/api/vehiculos';
    let method = 'POST';

    if (vehiculoSeleccionadoId) {
      url += `/${data.id}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ocurrió un error al guardar.');
      }
      cerrarModal();
      await cargarVehiculos();
    } catch (error) {
      if(modalMsg) modalMsg.innerText = error.message;
    }
  }

  async function eliminarVehiculo() {
    if (!vehiculoSeleccionadoId) return;
    if (!confirm(`¿Estás seguro de que quieres eliminar el vehículo con ID ${vehiculoSeleccionadoId}?`)) return;

    try {
      const res = await fetch(`/api/vehiculos/${vehiculoSeleccionadoId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar el vehículo.');
      }
      cerrarModal();
      await cargarVehiculos();
    } catch (error) {
      console.error(error);
      if(modalMsg) modalMsg.innerText = error.message;
    }
  }

  // --- Event Listeners ---
  if(btnAbrirModalCrear) btnAbrirModalCrear.addEventListener('click', abrirModalCrear);
  if(btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);

  // Búsqueda de usuario en el modal
  if(inputBuscarDoc) inputBuscarDoc.addEventListener('input', async function() {
    const q = this.value.trim();
    if (q.length < 3) return;

    selectUsuario.innerHTML = '<option>Buscando...</option>';
    try {
      const res = await fetch(`/api/usuarios/documento/${encodeURIComponent(q)}`);
      if (!res.ok) {
        selectUsuario.innerHTML = '<option value="">Sin resultados</option>';
        return;
      }
      const usuario = await res.json();
      const nombres = `${usuario.primer_nombre} ${usuario.primer_apellido}`.trim();
      selectUsuario.innerHTML = `<option value="${usuario.id_usuario}" selected>${usuario.numero_documento} - ${nombres}</option>`;
    } catch {
      selectUsuario.innerHTML = '<option value="">Error de búsqueda</option>';
    }
  });

  // Envío del formulario y eliminación
  if(form) form.addEventListener('submit', guardarVehiculo);
  if(btnEliminar) btnEliminar.addEventListener('click', eliminarVehiculo);

  // --- Initialization ---
  inicializarTabla();
  cargarVehiculos();
});