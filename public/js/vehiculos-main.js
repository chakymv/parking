document.addEventListener('DOMContentLoaded', async () => {
    const UIElements = {
        vehiculosTableBody: document.getElementById('vehiculos-table-body'),
        editModal: document.getElementById('editVehiculoModal'),
        editForm: document.getElementById('editVehiculoForm'),
        editId: document.getElementById('edit-vehiculo-id'),
        editPlaca: document.getElementById('edit-placa'),
        editColor: document.getElementById('edit-color'),
        editModelo: document.getElementById('edit-modelo'),
        editMarca: document.getElementById('edit-marca'),
        editTipo: document.getElementById('edit-tipo'),
        editUsuarioId: document.getElementById('edit-usuario-id'),
        editUsuarioSearch: document.getElementById('edit-usuario-search'),
        editUsuarioDropdown: document.getElementById('edit-usuario-dropdown'),
        saveEditBtn: document.getElementById('saveEditVehiculoBtn'),
        toastMsg: document.getElementById('toast-msg'),
        toastBody: document.getElementById('toast-body'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmMessage: document.getElementById('confirm-message'),
        confirmOkBtn: document.getElementById('confirm-ok-btn'),
        confirmCancelBtn: document.getElementById('confirm-cancel-btn')
    };

    let editModalInstance = null;
    if (UIElements.editModal) {
        editModalInstance = new bootstrap.Modal(UIElements.editModal);
    }

    let toastInstance = null;
    if (UIElements.toastMsg) {
        toastInstance = new bootstrap.Toast(UIElements.toastMsg, {
            autohide: true,
            delay: 3500
        });
    }

    let confirmModalInstance = null;
    if (UIElements.confirmModal) {
        confirmModalInstance = new bootstrap.Modal(UIElements.confirmModal);
    }
    let confirmCallback = null;

    const normalizePlaca = (placa) => placa ? placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    const normalizeTexto = (text) => text ? text.trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '';
    const normalizeDocumento = (text) => text ? text.trim().replace(/[^0-9]/g, '') : '';

    const mostrarToast = (mensaje, tipo = 'success') => {
        if (UIElements.toastBody) {
            UIElements.toastBody.textContent = mensaje;
        }
        if (UIElements.toastMsg) {
            UIElements.toastMsg.classList.remove('bg-success', 'bg-warning', 'bg-danger', 'bg-info', 'border-0');
            UIElements.toastMsg.classList.add(`bg-${tipo}`, 'border-0');
        }
        if (toastInstance) {
            toastInstance.show();
        }
    };

    const showConfirmModal = (message, onConfirm) => {
        if (UIElements.confirmMessage) {
            UIElements.confirmMessage.textContent = message;
        }
        confirmCallback = onConfirm;
        if (confirmModalInstance) {
            confirmModalInstance.show();
        }
    };

    if (UIElements.confirmOkBtn) {
        UIElements.confirmOkBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback(true);
            }
            if (confirmModalInstance) {
                confirmModalInstance.hide();
            }
            confirmCallback = null;
        });
    }

    if (UIElements.confirmCancelBtn) {
        UIElements.confirmCancelBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback(false);
            }
            if (confirmModalInstance) {
                confirmModalInstance.hide();
            }
            confirmCallback = null;
        });
    }

    async function fetchVehiculos() {
        if (!UIElements.vehiculosTableBody) return;
        UIElements.vehiculosTableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
        try {
            const response = await fetch('/api/vehiculo');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al cargar vehículos: ${response.status} - ${errorText}`);
            }
            const vehiculos = await response.json();
            renderVehiculos(vehiculos);
        } catch (error) {
            mostrarToast(`Error al cargar vehículos: ${error.message}`, 'danger');
            if (UIElements.vehiculosTableBody) UIElements.vehiculosTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar vehículos: ${error.message}</td></tr>`;
        }
    }

    function renderVehiculos(vehiculos) {
        if (!UIElements.vehiculosTableBody) return;
        UIElements.vehiculosTableBody.innerHTML = '';
        if (vehiculos.length === 0) {
            UIElements.vehiculosTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay vehículos registrados.</td></tr>';
            return;
        }

        vehiculos.forEach(vehiculo => {
            const row = UIElements.vehiculosTableBody.insertRow();
            row.dataset.id = vehiculo.id;
            row.innerHTML = `
                <td>${vehiculo.placa}</td>
                <td>${vehiculo.color || 'N/A'}</td>
                <td>${vehiculo.modelo || 'N/A'}</td>
                <td>${vehiculo.marca || 'N/A'}</td>
                <td>${vehiculo.tipo || 'N/A'}</td>
                <td>${vehiculo.usuario_id_usuario ? `${vehiculo.usuario_id_usuario.primer_nombre} ${vehiculo.usuario_id_usuario.primer_apellido} (${vehiculo.usuario_id_usuario.numero_documento})` : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-info edit-btn" data-id="${vehiculo.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${vehiculo.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    }

    async function handleEditClick(event) {
        const vehiculoId = event.currentTarget.dataset.id;
        try {
            const response = await fetch(`/api/vehiculo/${vehiculoId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al cargar vehículo para editar: ${response.status} - ${errorText}`);
            }
            const vehiculo = await response.json();

            if (UIElements.editId) UIElements.editId.value = vehiculo.id;
            if (UIElements.editPlaca) UIElements.editPlaca.value = vehiculo.placa;
            if (UIElements.editColor) UIElements.editColor.value = vehiculo.color || '';
            if (UIElements.editModelo) UIElements.editModelo.value = vehiculo.modelo || '';
            if (UIElements.editMarca) UIElements.editMarca.value = vehiculo.marca || '';
            if (UIElements.editTipo) UIElements.editTipo.value = vehiculo.tipo || '';

            await loadUsersForSelect(vehiculo.usuario_id_usuario?.id_usuario);

            if (editModalInstance) editModalInstance.show();
        } catch (error) {
            mostrarToast(`Error al cargar datos del vehículo: ${error.message}`, 'danger');
        }
    }

    async function loadUsersForSelect(selectedUserId = null) {
        if (!UIElements.editUsuarioId) return;
        UIElements.editUsuarioId.innerHTML = '<option value="">Cargando usuarios...</option>';
        try {
            const response = await fetch('/admin/usuarios/buscar');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al cargar usuarios: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            const users = data.usuarios || [];

            UIElements.editUsuarioId.innerHTML = '<option value="">Seleccione un propietario</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id_usuario;
                option.textContent = `${user.primer_nombre} ${user.primer_apellido} (${user.numero_documento})`;
                if (selectedUserId !== null && String(user.id_usuario) === String(selectedUserId)) {
                    option.selected = true;
                }
                UIElements.editUsuarioId.appendChild(option);
            });
        } catch (error) {
            mostrarToast(`Error al cargar la lista de usuarios: ${error.message}`, 'danger');
            UIElements.editUsuarioId.innerHTML = '<option value="">Error al cargar usuarios</option>';
        }
    }

    if (UIElements.editUsuarioSearch) {
        UIElements.editUsuarioSearch.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            if (query.length < 3) {
                if (UIElements.editUsuarioDropdown) UIElements.editUsuarioDropdown.innerHTML = '';
                return;
            }

            try {
                const response = await fetch(`/admin/usuarios/buscar?query=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error al buscar usuarios: ${response.status} - ${errorText}`);
                }
                const data = await response.json();
                const users = data.usuarios || [];

                if (UIElements.editUsuarioDropdown) {
                    UIElements.editUsuarioDropdown.innerHTML = '';
                    users.forEach(user => {
                        const item = document.createElement('a');
                        item.className = 'dropdown-item';
                        item.href = '#';
                        item.textContent = `${user.primer_nombre} ${user.primer_apellido} (${user.numero_documento})`;
                        item.dataset.id = user.id_usuario;
                        item.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (UIElements.editUsuarioId) {
                                UIElements.editUsuarioId.innerHTML = `<option value="${user.id_usuario}" selected>${item.textContent}</option>`;
                            }
                            if (UIElements.editUsuarioSearch) UIElements.editUsuarioSearch.value = '';
                            if (UIElements.editUsuarioDropdown) UIElements.editUsuarioDropdown.innerHTML = '';
                        });
                        UIElements.editUsuarioDropdown.appendChild(item);
                    });
                }
            } catch (error) {
                mostrarToast(`Error al buscar usuarios: ${error.message}`, 'danger');
            }
        }, 300));
    }

    if (UIElements.saveEditBtn) {
        UIElements.saveEditBtn.addEventListener('click', async () => {
            const vehiculoId = UIElements.editId?.value;
            const placa = normalizePlaca(UIElements.editPlaca?.value);
            const color = normalizeTexto(UIElements.editColor?.value);
            const modelo = normalizeTexto(UIElements.editModelo?.value);
            const marca = normalizeTexto(UIElements.editMarca?.value);
            const tipo = normalizeTexto(UIElements.editTipo?.value);
            const usuarioId = UIElements.editUsuarioId?.value;

            if (!placa) {
                mostrarToast('La placa es obligatoria.', 'warning');
                return;
            }

            try {
                const response = await fetch(`/api/vehiculo/${vehiculoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        placa,
                        color,
                        modelo,
                        marca,
                        tipo,
                        usuario_id_usuario: usuarioId || null
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error al actualizar vehículo: ${response.status}`);
                }

                mostrarToast('Vehículo actualizado exitosamente.', 'success');
                if (editModalInstance) editModalInstance.hide();
                fetchVehiculos();
            } catch (error) {
                mostrarToast(`Error al actualizar vehículo: ${error.message}`, 'danger');
            }
        });
    }

    async function handleDeleteClick(event) {
        const vehiculoId = event.currentTarget.dataset.id;
        showConfirmModal('¿Está seguro de que desea eliminar este vehículo? Esta acción no se puede deshacer.', async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch(`/api/vehiculo/${vehiculoId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Error al eliminar vehículo: ${response.status}`);
                    }

                    mostrarToast('Vehículo eliminado exitosamente.', 'success');
                    fetchVehiculos();
                } catch (error) {
                    mostrarToast(`Error al eliminar vehículo: ${error.message}`, 'danger');
                }
            }
        });
    }

    let debounceTimer;
    function debounce(func, delay) {
        return function(...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    fetchVehiculos();
});
