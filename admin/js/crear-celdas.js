document.addEventListener('DOMContentLoaded', () => {
  let celdas = [];
  let dataTableInstance = null;
  let celdaSeleccionadaId = null;

  // 📌 Elementos del DOM
  const modal = document.getElementById('modal-celda');
  const modalTitulo = document.getElementById('modal-titulo');
  const form = document.getElementById('form-celda');
  const table = document.getElementById('celdas-table');
  const modalMsg = document.getElementById('modal-msg');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const btnAbrirModalCrear = document.getElementById('btn-abrir-modal-crear');
  const btnGuardar = document.getElementById('btn-guardar-celda');
  const btnEliminar = document.getElementById('btn-eliminar-celda');

  // 🆕 Abrir modal para crear celda
  function abrirModalCrear() {
    celdaSeleccionadaId = null;
    modalTitulo.innerText = 'Crear Nueva Celda';
    form.reset();
    modalMsg.innerText = '';
    form.elements['id'].value = '';
    btnEliminar.style.display = 'none';
    btnGuardar.innerText = 'Guardar';
    modal.classList.add('active');
  }

  // ✏️ Abrir modal para editar celda existente
  function abrirModalEditar(celda) {
    if (!celda) return;
    celdaSeleccionadaId = celda.id;
    modalTitulo.innerText = 'Editar Celda';
    form.reset();
    modalMsg.innerText = '';
    for (const key in celda) {
      if (form.elements[key]) form.elements[key].value = celda[key] || '';
    }
    btnEliminar.style.display = 'inline-block';
    btnGuardar.innerText = 'Guardar Cambios';
    modal.classList.add('active');
  }

  // ❌ Cerrar modal
  function cerrarModal() {
    modal.classList.remove('active');
  }

  // 🔄 Cargar celdas desde API
  async function cargarCeldas() {
    try {
      const res = await fetch('/api/celdas');
      if (!res.ok) throw new Error('Error al cargar las celdas');
      const raw = await res.json();
      celdas = raw.map(c => ({
        id: c.id,
        tipo: c.tipo,
        estado: c.estado
      }));
      if (dataTableInstance) {
        dataTableInstance.clear().rows.add(celdas).draw();
      }
    } catch (error) {
      console.error(error);
      $('#celdas-table tbody').html('<tr><td colspan="3" style="color:red;text-align:center;">Error al cargar celdas.</td></tr>');
    }
  }

  // 📊 Inicializar DataTable
  function inicializarTabla() {
    dataTableInstance = $(table).DataTable({
      data: [],
      columns: [
        { data: 'tipo', title: 'Tipo' },
  { data: 'estado', title: 'Estado' }
      ],
      responsive: true,
      language: {
        info: "Mostrando _START_ a _END_ de _TOTAL_ celdas",
        lengthMenu: "Mostrar _MENU_ celdas",
        search: "Buscar:",
        paginate: {
          first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior"
        }
      },
      createdRow: (row) => $(row).addClass('clickable-row')
    });

    // 🖱️ Hacer fila editable
    $('#celdas-table tbody').on('click', 'tr', function () {
      const rowData = dataTableInstance.row(this).data();
      const celda = celdas.find(c => c.id == rowData.id);
      abrirModalEditar(celda);
    });
  }

  // ✅ Guardar celda (crear o actualizar)
  async function guardarCelda(e) {
    e.preventDefault();
    modalMsg.innerText = '';
    const data = Object.fromEntries(new FormData(form));
    const url = celdaSeleccionadaId ? `/api/celdas/${data.id}` : '/api/celdas';
    const method = celdaSeleccionadaId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        let msg = 'Error al guardar.';
        try { msg = (await res.clone().json()).error || msg; }
        catch { msg = await res.text(); }
        throw new Error(msg);
      }

      cerrarModal();
      await cargarCeldas();
    } catch (error) {
      modalMsg.innerText = error.message;
    }
  }

  // 🗑️ Eliminar celda seleccionada
  async function eliminarCelda() {
    const id = form.elements['id'].value;
    if (!id || !confirm(`¿Eliminar celda ID ${id}?`)) return;
    try {
      const res = await fetch(`/api/celdas/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        let msg = 'Error al eliminar.';
        try { msg = (await res.clone().json()).error || msg; }
        catch { msg = await res.text(); }
        throw new Error(msg);
      }

      cerrarModal();
      await cargarCeldas();
    } catch (error) {
      modalMsg.innerText = error.message;
    }
  }

  // 🎬 Eventos
  btnAbrirModalCrear.addEventListener('click', abrirModalCrear);
  btnCerrarModal.addEventListener('click', cerrarModal);
  form.addEventListener('submit', guardarCelda);
  btnEliminar.addEventListener('click', eliminarCelda);

  // 🚀 Inicializar app
  inicializarTabla();
  cargarCeldas();
});
