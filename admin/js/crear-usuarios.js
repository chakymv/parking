document.addEventListener('DOMContentLoaded', () => {
  let usuarios = [];
  let editando = false;

  const btnAgregar = document.getElementById('btn-agregar-usuario');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const modal = document.getElementById('modal-usuario');
  const form = document.getElementById('form-usuario');
  const tabla = document.getElementById('usuarios-table');
  const modalMsg = document.getElementById('modal-msg');
  const modalTitulo = document.getElementById('modal-titulo');

  btnAgregar?.addEventListener('click', abrirModalCrear);
  btnCerrar?.addEventListener('click', cerrarModal);

  function abrirModalCrear() {
    editando = false;
    modalTitulo.innerText = 'Crear Usuario';
    form.reset();
    modalMsg.innerText = '';
    form.elements['id_usuario'].value = '';
    modal.classList.add('active');
  }

  function abrirModalEditar(usuario) {
    editando = true;
    modalTitulo.innerText = 'Editar Usuario';
    form.reset();
    modalMsg.innerText = '';
    for (const key in usuario) {
      if (form.elements[key]) {
        form.elements[key].value = usuario[key] || '';
      }
    }
    modal.classList.add('active');
  }

  function cerrarModal() {
    modal.classList.remove('active');
  }

    async function cargarUsuarios() {
    try {
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error('Error al cargar usuarios');
      usuarios = await res.json();
      aplicarFiltros(); // muestra la tabla filtrada inicialmente
    } catch (error) {
      console.error(error);
      tabla.innerHTML = '<tr><td colspan="9" style="color:red;text-align:center;">No se pudieron cargar los usuarios.</td></tr>';
    }
  }

  function renderTabla(lista = usuarios) {
    let html = `<thead><tr>
      <th>Tipo Doc</th><th>Num Doc</th><th>Nombre</th><th>Apellido</th>
      <th>Correo</th><th>Celular</th><th>Estado</th><th>Perfil</th><th>Acciones</th>
    </tr></thead><tbody>`;

    lista.filter(u => u.perfil_usuario_id !== 3).forEach(u => {
      html += `<tr>
        <td>${u.tipo_documento}</td>
        <td>${u.numero_documento}</td>
        <td>${u.primer_nombre} ${u.segundo_nombre || ''}</td>
        <td>${u.primer_apellido} ${u.segundo_apellido || ''}</td>
        <td>${u.direccion_correo}</td>
        <td>${u.numero_celular || ''}</td>
        <td>${u.estado}</td>
        <td>${perfilTexto(u.perfil_usuario_id)}</td>
        <td>
          <button class="btn-editar" onclick='abrirModalEditar(${JSON.stringify(u)})'>Editar</button>
          <button class="btn-eliminar" onclick='eliminarUsuario(${u.id_usuario})'>Eliminar</button>
        </td>
      </tr>`;
    });

    html += '</tbody>';
    tabla.innerHTML = html;
    $(tabla).DataTable({ destroy: true });
  }

  function perfilTexto(id) {
    return id === 1 ? 'Administrador' : id === 2 ? 'Operador' : 'Desconocido';
  }

  function aplicarFiltros() {
    const estadoFiltro = document.getElementById('filtro-estado').value;
    const perfilFiltro = document.getElementById('filtro-perfil').value;

    let filtrados = usuarios.slice();
    if (estadoFiltro) filtrados = filtrados.filter(u => u.estado === estadoFiltro);
    if (perfilFiltro) filtrados = filtrados.filter(u => String(u.perfil_usuario_id) === perfilFiltro);

    renderTabla(filtrados);
  }

  document.getElementById('filtro-estado')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-perfil')?.addEventListener('change', aplicarFiltros);

  async function validarExistenciaUsuario(data) {
  const query = new URLSearchParams({
    numero_documento: data.numero_documento,
    direccion_correo: data.direccion_correo
  });

  const res = await fetch(`/api/usuarios/validar?${query.toString()}`);
  if (!res.ok) return null;

  return await res.json(); // { documentoExiste: bool, correoExiste: bool }
}

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    modalMsg.innerText = '';
    const data = Object.fromEntries(new FormData(form));
    let url = '/api/usuarios';
    let method = 'POST';

    if (editando && data.id_usuario) {
      url += `/${data.id_usuario}`;
      method = 'PUT';
    }

    // Validar duplicados solo en creación
    if (!editando) {
      const existe = await validarExistenciaUsuario(data);
      if (existe?.documentoExiste) {
        modalMsg.innerText = 'Ya existe un usuario con ese número de documento.';
        return;
      }
      if (existe?.correoExiste) {
        modalMsg.innerText = 'Ya existe un usuario con ese correo.';
        return;
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        let msg = 'Error al guardar usuario';
        try { msg = (await res.clone().json()).error || msg; }
        catch { msg = await res.text(); }
        throw new Error(msg);
      }

      cerrarModal();
      await cargarUsuarios();
    } catch (error) {
      modalMsg.innerText = error.message;
    }
  });

    async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar usuario?')) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      await cargarUsuarios();
    } catch (error) {
      alert(error.message);
    }
  }

  cargarUsuarios(); // Inicialización
});
