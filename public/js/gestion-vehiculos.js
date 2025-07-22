  let vehiculos = [];
        let vehiculoSeleccionadoId = null;
        let dataTableInstance = null;
        let toastInstance = null;
        let confirmCallback = null;

        let UIElements = {};

        const colNames = {
            id: 'ID',
            placa: 'Placa',
            color: 'Color',
            modelo: 'Modelo',
            marca: 'Marca',
            tipo: 'Tipo',
            usuario_id_usuario: 'Propietario'
        };
        const allColumns = ['id', 'placa', 'color', 'modelo', 'marca', 'tipo', 'usuario_id_usuario'];
        let columns = ['placa', 'color', 'modelo', 'marca', 'tipo', 'usuario_id_usuario']; // Initial visible columns

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
            } else {
                console.error('La instancia de Toast no está inicializada.');
            }
        };

        const showConfirmModal = (message, onConfirm) => {
            if (UIElements.confirmMessage) {
                UIElements.confirmMessage.textContent = message;
            }
            confirmCallback = onConfirm;
            if (UIElements.confirmModal) {
                UIElements.confirmModal.show();
            } else {
                console.error('UIElements.confirmModal no es una instancia válida de Bootstrap Modal!');
            }
        };

        function abrirModalCrear() {
            vehiculoSeleccionadoId = null;
            if(UIElements.modalTitulo) UIElements.modalTitulo.innerText = 'Agregar Nuevo Vehículo';
            if(UIElements.form) UIElements.form.reset();
            if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = '<option value="">Seleccione un propietario</option>';
            if(UIElements.modalMsg) UIElements.modalMsg.innerText = '';

            if(UIElements.btnEliminar) UIElements.btnEliminar.style.display = 'none';
            if(UIElements.btnGuardar) UIElements.btnGuardar.innerText = 'Guardar';
            
            if (UIElements.modal) {
                UIElements.modal.show();
            } else {
                console.error('UIElements.modal no es una instancia válida de Bootstrap Modal en abrirModalCrear!');
            }
        }

        async function abrirModalEditar(vehiculo) {
            if (!vehiculo) {
                mostrarToast('Error: Vehículo no encontrado para editar.', 'danger');
                return;
            }

            vehiculoSeleccionadoId = vehiculo.id;
            if(UIElements.modalTitulo) UIElements.modalTitulo.innerText = 'Editar Vehículo';
            if(UIElements.form) UIElements.form.reset();
            if(UIElements.modalMsg) UIElements.modalMsg.innerText = '';

            if(UIElements.form && UIElements.form.elements['id']) UIElements.form.elements['id'].value = vehiculo.id;
            if(UIElements.form && UIElements.form.elements['placa']) UIElements.form.elements['placa'].value = vehiculo.placa || '';
            if(UIElements.form && UIElements.form.elements['color']) UIElements.form.elements['color'].value = vehiculo.color || '';
            if(UIElements.form && UIElements.form.elements['modelo']) UIElements.form.elements['modelo'].value = vehiculo.modelo || '';
            if(UIElements.form && UIElements.form.elements['marca']) UIElements.form.elements['marca'].value = vehiculo.marca || '';
            if(UIElements.form && UIElements.form.elements['tipo']) UIElements.form.elements['tipo'].value = vehiculo.tipo || '';

            if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = '<option value="">Cargando propietario...</option>';
            try {
                let usuarioId = vehiculo.usuario_id_usuario;
                if (typeof usuarioId === 'object' && usuarioId !== null && usuarioId.id_usuario) {
                    usuarioId = usuarioId.id_usuario;
                }

                if (usuarioId) {
                    const res = await fetch(`${window.location.origin}/api/usuarios/${usuarioId}`);
                    if (res.ok) {
                        const usuario = await res.json();
                        const nombres = [usuario.primer_nombre, usuario.segundo_nombre].filter(Boolean).join(' ');
                        const apellidos = [usuario.primer_apellido, usuario.segundo_apellido].filter(Boolean).join(' ');
                        if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = `<option value="${usuario.id_usuario}" selected>${usuario.numero_documento} - ${nombres} ${apellidos}</option>`;
                    } else {
                        if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = `<option value="">Propietario no encontrado</option>`;
                    }
                } else {
                    if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = `<option value="">Seleccione un propietario</option>`;
                }
            } catch (error) {
                if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = `<option value="">Error al cargar propietario</option>`;
                mostrarToast('Error al cargar propietario.', 'danger');
            }

            if(UIElements.btnEliminar) UIElements.btnEliminar.style.display = 'inline-block';
            if(UIElements.btnGuardar) UIElements.btnGuardar.innerText = 'Guardar Cambios';
            
            if (UIElements.modal) {
                UIElements.modal.show();
            } else {
                console.error('UIElements.modal no es una instancia válida de Bootstrap Modal en abrirModalEditar!');
            }
        }

        function cerrarModal() {
            if (UIElements.modal) {
                UIElements.modal.hide();
            } else {
                console.error('UIElements.modal no es una instancia válida de Bootstrap Modal en cerrarModal!');
            }
        }

        function inicializarTabla() {
            // Destruir instancia existente de DataTable si existe
            if (dataTableInstance) {
                dataTableInstance.destroy();
                $('#vehiculos-table tbody').off('click', 'tr'); 
            }

            const tableHeaderRow = $(UIElements.table).find('thead tr');
            tableHeaderRow.empty(); // Limpiar encabezados existentes

            // Siempre generar un <th> para cada columna en allColumns
            allColumns.forEach(col => {
                tableHeaderRow.append(`<th>${colNames[col] || col}</th>`);
            });

            const dataTableColumnsConfig = [];
            allColumns.forEach(col => {
                const columnDefinition = {
                    data: col,
                    title: colNames[col] || col,
                    visible: columns.includes(col) // Controlar la visibilidad inicial aquí
                };

                if (col === 'usuario_id_usuario') {
                    columnDefinition.render = function(data, type, row) {
                        if (type === 'display' && typeof data === 'object' && data !== null) {
                            const nombres = [data.primer_nombre, data.segundo_nombre].filter(Boolean).join(' ');
                            const apellidos = [data.primer_apellido, data.segundo_apellido].filter(Boolean).join(' ');
                            return `${nombres} ${apellidos} (${data.numero_documento})`;
                        }
                        return data || 'N/A';
                    };
                }
                dataTableColumnsConfig.push(columnDefinition);
            });

            dataTableInstance = $(UIElements.table).DataTable({
                data: [],
                columns: dataTableColumnsConfig, // Usar la configuración completa de columnas
                responsive: true,
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json"
                },
                createdRow: function(row) {
                    $(row).addClass('clickable-row');
                }
            });

            $('#vehiculos-table tbody').on('click', 'tr', function () {
                const rowData = dataTableInstance.row(this).data();
                if (!rowData) {
                    return;
                }
                const vehiculoCompleto = vehiculos.find(v => v.id == rowData.id);
                if (vehiculoCompleto) {
                    abrirModalEditar(vehiculoCompleto);
                } else {
                    mostrarToast('Error: Datos completos del vehículo no encontrados.', 'danger');
                }
            });
        }

        async function cargarVehiculos() {
            try {
                const res = await fetch(`${window.location.origin}/api/vehiculos`);
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Error al cargar los vehículos: ${res.status} - ${errorText}`);
                }
                
                vehiculos = await res.json();
                if (dataTableInstance) {
                    dataTableInstance.clear().rows.add(vehiculos).draw();
                }
            } catch (error) {
                console.error('Error en cargarVehiculos:', error);
                mostrarToast(`Error al cargar vehículos: ${error.message}`, 'danger');
            }
        }

        async function guardarVehiculo(e) {
            e.preventDefault();
            if(UIElements.modalMsg) UIElements.modalMsg.innerText = '';

            const data = Object.fromEntries(new FormData(UIElements.form));
            
            data.placa = normalizePlaca(data.placa);
            data.color = normalizeTexto(data.color);
            data.modelo = normalizeTexto(data.modelo);
            data.marca = normalizeTexto(data.marca);
            data.tipo = normalizeTexto(data.tipo);
            if (data.usuario_id_usuario === '') {
                data.usuario_id_usuario = null;
            }

            let url = `${window.location.origin}/api/vehiculos`;
            let method = 'POST';

            if (vehiculoSeleccionadoId) {
                url += `/${vehiculoSeleccionadoId}`;
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
                mostrarToast('Vehículo guardado exitosamente.', 'success');
                await cargarVehiculos();
            } catch (error) {
                console.error('Error en guardarVehiculo:', error);
                if(UIElements.modalMsg) UIElements.modalMsg.innerText = error.message;
                mostrarToast(`Error al guardar vehículo: ${error.message}`, 'danger');
            }
        }

        async function eliminarVehiculo() {
            if (!vehiculoSeleccionadoId) {
                mostrarToast('No hay vehículo seleccionado para eliminar.', 'warning');
                return;
            }

            showConfirmModal(`¿Estás seguro de que quieres eliminar el vehículo con ID ${vehiculoSeleccionadoId}?`, async (confirmed) => {
                if (confirmed) {
                    try {
                        const res = await fetch(`${window.location.origin}/api/vehiculos/${vehiculoSeleccionadoId}`, { method: 'DELETE' });
                        if (!res.ok) {
                            const errorData = await res.json();
                            throw new Error(errorData.error || 'Error al eliminar el vehículo.');
                        }
                        cerrarModal();
                        mostrarToast('Vehículo eliminado exitosamente.', 'success');
                        await cargarVehiculos();
                    } catch (error) {
                        console.error('Error en eliminarVehiculo:', error);
                        if(UIElements.modalMsg) UIElements.modalMsg.innerText = error.message;
                        mostrarToast(`Error al eliminar vehículo: ${error.message}`, 'danger');
                    }
                } else {
                }
            });
        }

        function renderColumnSelector() {
            const selector = document.getElementById('column-selector');
            const order = allColumns;
            if (selector) {
                selector.innerHTML = `<button type='button' class='btn btn-secondary dropdown-toggle' data-bs-toggle="dropdown" aria-expanded="false">Seleccionar </button>` +
                    `<div class='dropdown-menu custom-dropdown'>` +
                    order.map(col => {
                        const checked = columns.includes(col) ? 'checked' : '';
                        return `<label class='dropdown-item'><input type='checkbox' value='${col}' ${checked}><span> ${colNames[col] || col}</span></label>`;
                    }).join('') +
                    `</div>`;
                selector.querySelectorAll('.dropdown-item input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', () => toggleCol(checkbox));
                });
            } else {
                console.error('Elemento selector de columnas #column-selector no encontrado!');
            }
        }

        function toggleCol(checkbox) {
            const colName = checkbox.value;
            // Encontrar el índice de la columna por su nombre en allColumns
            const colIndex = allColumns.indexOf(colName);

            if (colIndex === -1) {
                console.error(`Columna "${colName}" no encontrada en allColumns.`);
                return;
            }

            if (checkbox.checked) {
                // Añadir la columna a la lista de visibles si no está
                if (!columns.includes(colName)) {
                    columns.push(colName);
                    // Opcional: mantener 'columns' ordenado si importa para algo más
                    columns.sort((a, b) => allColumns.indexOf(a) - allColumns.indexOf(b));
                }
            } else {
                // Eliminar la columna de la lista de visibles
                columns = columns.filter(c => c !== colName);
            }

            // Usar la API de DataTables para cambiar la visibilidad
            if (dataTableInstance) {
                dataTableInstance.column(colIndex).visible(checkbox.checked);
            } else {
                // Si la tabla no está inicializada (ej. al cargar por primera vez),
                // la inicializarTabla se encargará de la visibilidad inicial.
                console.warn('DataTables no está inicializado. La visibilidad se aplicará en la inicialización.');
            }
        }

        function filterTable() {
            const filtro = document.getElementById('filtro');
            if (filtro && dataTableInstance) {
                dataTableInstance.search(filtro.value.toLowerCase()).draw();
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            UIElements = {
                modalTitulo: document.getElementById('modalTitulo'),
                form: document.getElementById('form-vehiculo'),
                table: document.getElementById('vehiculos-table'),
                modalMsg: document.getElementById('modal-msg'),
                inputBuscarDoc: document.getElementById('usuario-buscar-doc'),
                selectUsuario: document.getElementById('usuario_id_usuario'),
                btnAbrirModalCrear: document.getElementById('btn-abrir-modal-crear'),
                btnGuardar: document.getElementById('btn-guardar-vehiculo'),
                btnEliminar: document.getElementById('btn-eliminar-vehiculo'),
                toastMsg: document.getElementById('toast-msg'),
                toastBody: document.getElementById('toast-body'),
                confirmMessage: document.getElementById('confirm-message'),
                confirmOkBtn: document.getElementById('confirm-ok-btn'),
                confirmCancelBtn: document.getElementById('confirm-cancel-btn')
            };

            const modalElement = document.getElementById('modal-vehiculo');
            if (modalElement) {
                UIElements.modal = new bootstrap.Modal(modalElement);
            } else {
                console.error('Elemento del modal #modal-vehiculo no encontrado! El modal no funcionará.');
            }

            const confirmModalElement = document.getElementById('confirm-modal');
            if (confirmModalElement) {
                UIElements.confirmModal = new bootstrap.Modal(confirmModalElement);
            } else {
                console.error('Elemento del modal de confirmación #confirm-modal no encontrado! Las confirmaciones no funcionarán.');
            }

            if (UIElements.toastMsg) {
                toastInstance = new bootstrap.Toast(UIElements.toastMsg, {
                    autohide: true,
                    delay: 3500
                });
            } else {
                console.error('Elemento del toast #toast-msg no encontrado! Los mensajes de notificación no funcionarán.');
            }

            if(UIElements.btnAbrirModalCrear) {
                UIElements.btnAbrirModalCrear.addEventListener('click', () => {
                    abrirModalCrear();
                });
            } else {
                console.error('Botón #btn-abrir-modal-crear no encontrado!');
            }

            let searchTimeout;
            if(UIElements.inputBuscarDoc) UIElements.inputBuscarDoc.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const q = this.value.trim();
                if (q.length >= 2) {
                    searchTimeout = setTimeout(async () => {
                        if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = '<option value="">Buscando...</option>';
                        try {
                            const res = await fetch(`${window.location.origin}/api/usuarios/documento/${encodeURIComponent(q)}`);
                            if (!res.ok) {
                                if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = '<option value="">Sin resultados</option>';
                                return;
                            }
                            const usuario = await res.json();
                            if (!usuario || !usuario.id_usuario) {
                                if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = '<option value="">Sin resultados</option>';
                                return;
                            }
                            const nombres = [usuario.primer_nombre, usuario.segundo_nombre].filter(Boolean).join(' ');
                            const apellidos = [usuario.primer_apellido, usuario.segundo_apellido].filter(Boolean).join(' ');
                            if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = `<option value="${usuario.id_usuario}" selected>${usuario.numero_documento} - ${nombres} ${apellidos}</option>`;
                        } catch (error) {
                            if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = `<option value="">Error de búsqueda</option>`;
                            mostrarToast('Error al buscar usuarios.', 'danger');
                        }
                    }, 300);
                } else if (q.length === 0) {
                    if(UIElements.selectUsuario) UIElements.selectUsuario.innerHTML = '<option value="">Seleccione un propietario</option>';
                }
            });

            if(UIElements.form) UIElements.form.addEventListener('submit', guardarVehiculo);
            if(UIElements.btnEliminar) UIElements.btnEliminar.addEventListener('click', eliminarVehiculo);

            if (UIElements.confirmOkBtn) {
                UIElements.confirmOkBtn.addEventListener('click', () => {
                    if (confirmCallback) {
                        confirmCallback(true);
                    }
                    if (UIElements.confirmModal) UIElements.confirmModal.hide();
                    confirmCallback = null;
                });
            }

            if (UIElements.confirmCancelBtn) {
                UIElements.confirmCancelBtn.addEventListener('click', () => {
                    if (confirmCallback) {
                        confirmCallback(false);
                    }
                    if (UIElements.confirmModal) UIElements.confirmModal.hide();
                    confirmCallback = null;
                });
            }

            inicializarTabla();
            cargarVehiculos();
            renderColumnSelector();
            if(document.getElementById('filtro')) document.getElementById('filtro').addEventListener('input', filterTable);
        });