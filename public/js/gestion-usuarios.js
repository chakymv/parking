document.addEventListener('DOMContentLoaded', () => {
  // --- State Management ---
  let usuarios = [];
  let dataTableInstance = null;
  let usuarioSeleccionadoId = null;

  // --- DOM Elements ---
  const modal = document.getElementById('modal-usuario');
  const modalTitulo = document.getElementById('modal-titulo');
  const form = document.getElementById('form-usuario');
  const table = document.getElementById('usuarios-table');
  const modalMsg = document.getElementById('modal-msg');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const btnAbrirModalCrear = document.getElementById('btn-abrir-modal-crear');
  const btnGuardar = document.getElementById('btn-guardar-usuario');
  const btnEliminar = document.getElementById('btn-eliminar-usuario');

  // --- Modal Functions ---
  function abrirModalCrear() {
    usuarioSeleccionadoId = null;
    modalTitulo.innerText = 'Crear Usuario';
    form.reset();
    if(modalMsg) modalMsg.innerText = '';

    // Configurar para modo CREAR
    form.elements.clave.required = true;
    form.elements.clave.placeholder = 'Ingrese la contraseña';
    btnEliminar.style.display = 'none';
    btnGuardar.innerText = 'Guardar';
    modal.classList.add('active');
  }

  function abrirModalEditar(usuario) {
    if (!usuario) return;

    usuarioSeleccionadoId = usuario.id_usuario;
    modalTitulo.innerText = 'Editar Usuario';
    form.reset();
    if(modalMsg) modalMsg.innerText = '';

    // Rellenar el formulario
    for (const key in usuario) {
      if (form.elements[key]) {
        form.elements[key].value = usuario[key] || '';
      }
    }

    // Configurar para modo EDITAR
    form.elements.clave.required = false;
    form.elements.clave.placeholder = 'Dejar en blanco para no cambiar';

    btnEliminar.style.display = 'inline-block';
    btnGuardar.innerText = 'Guardar Cambios';
    modal.classList.add('active');
  }

  function cerrarModal() {
    modal.classList.remove('active');
  }

  // --- Helper Functions ---
  function perfilTexto(id) {
    switch (parseInt(id, 10)) {
      case 1: return 'Administrador';
      case 2: return 'Operador';
      default: return 'Desconocido';
    }
  }

  // --- API & Table Functions ---
  async function cargarUsuarios() {
    try {
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error('Error al cargar los usuarios.');
      
      const allUsers = await res.json();
      usuarios = allUsers.filter(u => u.perfil_usuario_id !== 3);

      if (dataTableInstance) {
        dataTableInstance.clear().rows.add(usuarios).draw();
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  function inicializarTabla() {
    dataTableInstance = $(table).DataTable({
      data: [],
      columns: [
        { data: 'id_usuario', title: 'ID' },
        { 
          data: null, 
          title: 'Nombre',
          render: data => `${data.primer_nombre} ${data.segundo_nombre || ''}`.trim()
        },
        { 
          data: null, 
          title: 'Apellido',
          render: data => `${data.primer_apellido} ${data.segundo_apellido || ''}`.trim()
        },
        { data: 'numero_documento', title: 'Documento' },
        { data: 'direccion_correo', title: 'Correo' },
        { data: 'estado', title: 'Estado' },
        { 
          data: 'perfil_usuario_id', 
          title: 'Perfil',
          render: data => perfilTexto(data)
        }
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
    $('#usuarios-table tbody').on('click', 'tr', function () {
      const rowData = dataTableInstance.row(this).data();
      if (!rowData) return; // Evitar error si se hace clic en una fila vacía
      const usuarioCompleto = usuarios.find(u => u.id_usuario == rowData.id_usuario);
      abrirModalEditar(usuarioCompleto);
    });
  }

  async function guardarUsuario(e) {
    e.preventDefault();
    if(modalMsg) modalMsg.innerText = '';
    const data = Object.fromEntries(new FormData(form));
    let url = '/api/usuarios';
    let method = 'POST';

    if (usuarioSeleccionadoId) {
      url += `/${data.id_usuario}`;
      method = 'PUT';
      if (!data.clave) delete data.clave; // No sobreescribir clave si está vacía
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
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      if(modalMsg) modalMsg.innerText = error.message;
    }
  }

  async function eliminarUsuario() {
    if (!usuarioSeleccionadoId) return;
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${usuarioSeleccionadoId}?`)) return;

    try {
      const res = await fetch(`/api/usuarios/${usuarioSeleccionadoId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar el usuario.');
      }
      cerrarModal();
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      if(modalMsg) modalMsg.innerText = error.message;
    }
  }

  // --- Event Listeners ---
  if(btnAbrirModalCrear) btnAbrirModalCrear.addEventListener('click', abrirModalCrear);
  if(btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
  if(form) form.addEventListener('submit', guardarUsuario);
  if(btnEliminar) btnEliminar.addEventListener('click', eliminarUsuario);

  // --- Initialization ---
  inicializarTabla();
  cargarUsuarios();
});