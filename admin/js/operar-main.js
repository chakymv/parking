document.addEventListener('DOMContentLoaded', () => {
    // Objeto para almacenar todos los elementos de la UI para un acceso más fácil
    const UIElements = {
        placaInput: document.getElementById('placa-input'),
        btnIngreso: document.getElementById('btn-ingreso'),
        btnSalida: document.getElementById('btn-salida'),

        modalRegistro: document.getElementById('modal-registrar-vehiculo'),
        btnCerrarModalRegistro: document.getElementById('btn-cerrar-modal-registrar'),
        placaRegistrarSpan: document.getElementById('placa-registrar-span'),
        placaRegistrarInput: document.getElementById('placa_registrar'),
        formRegistroUsuario: document.getElementById('form-registrar-usuario'),
        formRegistroVehiculo: document.getElementById('form-registrar-vehiculo'),
        selectParqueaderoRegistro: document.getElementById('parqueadero_registrar'),
        gridCeldasModal: document.getElementById('grid-celdas-modal'),
        parqInfoModal: document.getElementById('parq-info-modal'),
        inputBuscarPropietario: document.getElementById('usuario-buscar-doc-operar'),
        selectPropietario: document.getElementById('usuario_id_operar'),
        resumenPropietario: document.getElementById('usuario-resumen-operar'),
        resNombre: document.getElementById('res-nombre'),
        resDocumento: document.getElementById('res-documento'),
        resCorreo: document.getElementById('res-correo'),
        resCelular: document.getElementById('res-celular'),
        colorRegistrar: document.getElementById('color_registrar'),
        modeloRegistrar: document.getElementById('modelo_registrar'),
        marcaRegistrar: document.getElementById('marca_registrar'),
        tipoRegistrar: document.getElementById('tipo_registrar'),
        btnGuardarVehiculoRegistrar: document.getElementById('btn-guardar-vehiculo-registrar'),
        placaRegistrarSpanVehiculo: document.getElementById('placa-registrar-span-vehiculo'),

        modalAsignar: document.getElementById('modal-asignar-celda'),
        btnCerrarModalAsignar: document.getElementById('btn-cerrar-modal-celda'),
        placaModalSpan: document.getElementById('placa-modal-span'),
        btnConfirmarAsignacion: document.getElementById('btn-confirmar-asignacion'),
        selectParqueaderoAsignar: document.getElementById('select-parqueadero'),
        selectZonaAsignar: document.getElementById('select-zona'),
        gridCeldasDisponibles: document.getElementById('celdas-disponibles-grid'),
        modalCeldaId: document.getElementById('modal-celda-id'),
        modalCeldaMsg: document.getElementById('modal-celda-msg'),

        btnAcordeonUsuario: document.getElementById('btn-acordeon-usuario'),
        btnAcordeonVehiculo: document.getElementById('btn-acordeon-vehiculo'),
        collapseUsuario: document.getElementById('collapseUsuario'),
        collapseVehiculo: document.getElementById('collapseVehiculo'),

        toastMsg: document.getElementById('toast-msg'),
        toastBody: document.getElementById('toast-body'),

        confirmModal: document.getElementById('confirm-modal'),
        confirmMessage: document.getElementById('confirm-message'),
        confirmOkBtn: document.getElementById('confirm-ok-btn'),
        confirmCancelBtn: document.getElementById('confirm-cancel-btn'),

        modalSalidaConfirmacion: document.getElementById('modal-salida-confirmacion'),
        placaSalidaConfirmacion: document.getElementById('placa-salida-confirmacion'),
        celdaSalidaConfirmacion: document.getElementById('celda-salida-confirmacion'),
        zonaSalidaConfirmacion: document.getElementById('zona-salida-confirmacion'),
        parqueaderoSalidaConfirmacion: document.getElementById('parqueadero-salida-confirmacion'),
        btnCerrarModalSalidaConfirmacion: document.getElementById('btn-cerrar-modal-salida-confirmacion'),

        resumenCeldas: document.getElementById('resumen-celdas'),
        resumenZonas: document.getElementById('resumen-zonas'),

        // Elemento para las sugerencias de propietario (puede que no exista en el HTML original, lo crearemos si es necesario)
        sugerenciasPropietario: document.getElementById('sugerencias-propietario')
    };

    // Instancias de modales de Bootstrap
    let modalRegistroInstance = null;
    let modalAsignarInstance = null;
    let confirmModalInstance = null;
    let modalSalidaConfirmacionInstance = null;
    let toastInstance = null;

    if (UIElements.modalRegistro) modalRegistroInstance = new bootstrap.Modal(UIElements.modalRegistro);
    if (UIElements.modalAsignar) modalAsignarInstance = new bootstrap.Modal(UIElements.modalAsignar);
    if (UIElements.confirmModal) confirmModalInstance = new bootstrap.Modal(UIElements.confirmModal);
    if (UIElements.modalSalidaConfirmacion) modalSalidaConfirmacionInstance = new bootstrap.Modal(UIElements.modalSalidaConfirmacion);
    if (UIElements.toastMsg) {
        toastInstance = new bootstrap.Toast(UIElements.toastMsg, {
            autohide: true,
            delay: 3500
        });
    }

    // Variables de estado globales
    let parqueaderosCache = [];
    let confirmCallback = null;
    let currentVehicle = null;
    let currentParkingHistory = null;
    let selectedCellId = null;
    let allUsers = []; // Cache para usuarios

    // Elemento para las sugerencias del input de búsqueda de propietario
    let dropdownSugerencias = UIElements.sugerenciasPropietario;
    if (!dropdownSugerencias && UIElements.inputBuscarPropietario) {
        dropdownSugerencias = document.createElement('div');
        dropdownSugerencias.className = 'dropdown-menu'; // No 'show' inicialmente
        dropdownSugerencias.style.position = 'absolute';
        dropdownSugerencias.style.width = UIElements.inputBuscarPropietario.offsetWidth + 'px';
        dropdownSugerencias.style.zIndex = '1050'; // Asegurar que esté por encima de otros elementos
        UIElements.inputBuscarPropietario.parentNode.insertBefore(dropdownSugerencias, UIElements.inputBuscarPropietario.nextSibling);
        UIElements.sugerenciasPropietario = dropdownSugerencias; // Actualizar la referencia en UIElements
    }


    // --- Funciones de Utilidad ---

    // Normalización de datos de entrada
    const normalizePlaca = (placa) => placa ? placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    const normalizeDocumento = (text) => text ? text.trim().replace(/[^0-9]/g, '') : '';
    const normalizeTexto = (text) => text ? text.trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '';
    const normalizeCorreo = (email) => email ? email.trim().toLowerCase() : '';

    // Función para mostrar mensajes Toast
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

    // Función para mostrar el modal de confirmación genérico
    const showConfirmModal = (message, onConfirm) => {
        if (UIElements.confirmMessage) {
            UIElements.confirmMessage.textContent = message;
        }
        confirmCallback = onConfirm;
        if (confirmModalInstance) {
            confirmModalInstance.show();
        }
    };

    // Función para actualizar el resumen del propietario en el modal de registro
    function updateUserSummary(user) {
        if (UIElements.resNombre) UIElements.resNombre.textContent = `${user.primer_nombre} ${user.segundo_nombre || ''} ${user.primer_apellido} ${user.segundo_apellido || ''}`.trim();
        if (UIElements.resDocumento) UIElements.resDocumento.textContent = user.numero_documento;
        if (UIElements.resCorreo) UIElements.resCorreo.textContent = user.direccion_correo;
        if (UIElements.resCelular) UIElements.resCelular.textContent = user.numero_celular;
        if (UIElements.resumenPropietario) UIElements.resumenPropietario.style.display = 'block';
    }

    // Función para restablecer la UI a su estado inicial
    const resetUI = async () => {
        if (UIElements.placaInput) UIElements.placaInput.value = '';
        if (UIElements.btnIngreso) UIElements.btnIngreso.disabled = false;
        if (UIElements.btnSalida) UIElements.btnSalida.disabled = true;
        currentVehicle = null;
        currentParkingHistory = null;
        selectedCellId = null;

        if (modalRegistroInstance) modalRegistroInstance.hide();
        if (UIElements.placaRegistrarSpan) UIElements.placaRegistrarSpan.textContent = '';
        if (UIElements.placaRegistrarInput) UIElements.placaRegistrarInput.value = '';
        if (UIElements.placaRegistrarSpanVehiculo) UIElements.placaRegistrarSpanVehiculo.textContent = '';
        if (UIElements.formRegistroUsuario) UIElements.formRegistroUsuario.reset();
        if (UIElements.formRegistroVehiculo) UIElements.formRegistroVehiculo.reset();
        if (UIElements.selectParqueaderoRegistro) UIElements.selectParqueaderoRegistro.innerHTML = '<option value="">Seleccione parqueadero</option>';
        if (UIElements.gridCeldasModal) UIElements.gridCeldasModal.innerHTML = '<p class="text-center text-muted">Seleccione un parqueadero.</p>';
        if (UIElements.parqInfoModal) UIElements.parqInfoModal.textContent = '';
        if (UIElements.inputBuscarPropietario) UIElements.inputBuscarPropietario.value = '';
        if (UIElements.selectPropietario) UIElements.selectPropietario.innerHTML = '<option value="">Seleccione propietario</option>';
        if (UIElements.resumenPropietario) UIElements.resumenPropietario.style.display = 'none';
        if (UIElements.colorRegistrar) UIElements.colorRegistrar.value = '';
        if (UIElements.modeloRegistrar) UIElements.modeloRegistrar.value = '';
        if (UIElements.marcaRegistrar) UIElements.marcaRegistrar.value = '';
        if (UIElements.tipoRegistrar) UIElements.tipoRegistrar.value = '';
        if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = true;

        if (modalAsignarInstance) modalAsignarInstance.hide();
        if (UIElements.placaModalSpan) UIElements.placaModalSpan.textContent = '';
        if (UIElements.selectParqueaderoAsignar) UIElements.selectParqueaderoAsignar.innerHTML = '<option value="">Seleccione Parqueadero</option>';
        if (UIElements.selectZonaAsignar) UIElements.selectZonaAsignar.innerHTML = '<option value="">Seleccione Zona</option>';
        if (UIElements.gridCeldasDisponibles) UIElements.gridCeldasDisponibles.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;">Seleccione parqueadero y zona.</div>';
        if (UIElements.modalCeldaId) UIElements.modalCeldaId.value = '';
        if (UIElements.modalCeldaMsg) UIElements.modalCeldaMsg.textContent = '';
        if (UIElements.btnConfirmarAsignacion) UIElements.btnConfirmarAsignacion.disabled = true;

        if (modalSalidaConfirmacionInstance) modalSalidaConfirmacionInstance.hide();
        if (UIElements.placaSalidaConfirmacion) UIElements.placaSalidaConfirmacion.textContent = '';
        if (UIElements.celdaSalidaConfirmacion) UIElements.celdaSalidaConfirmacion.textContent = '';
        if (UIElements.zonaSalidaConfirmacion) UIElements.zonaSalidaConfirmacion.textContent = '';
        if (UIElements.parqueaderoSalidaConfirmacion) UIElements.parqueaderoSalidaConfirmacion.textContent = '';

        if (dropdownSugerencias) {
            dropdownSugerencias.innerHTML = '';
            dropdownSugerencias.style.display = 'none';
        }

        // Colapsar acordeones si existen
        if (UIElements.collapseUsuario) {
            const collapseUsuarioInstance = bootstrap.Collapse.getInstance(UIElements.collapseUsuario) || new bootstrap.Collapse(UIElements.collapseUsuario, { toggle: false });
            collapseUsuarioInstance.hide();
        }
        if (UIElements.collapseVehiculo) {
            const collapseVehiculoInstance = bootstrap.Collapse.getInstance(UIElements.collapseVehiculo) || new bootstrap.Collapse(UIElements.collapseVehiculo, { toggle: false });
            collapseVehiculoInstance.hide();
        }

        // Recargar datos iniciales de la UI
        await cargarResumenCeldas();
        await cargarResumenZonas();
        await cargarUsuariosParaSeleccion(); // Recargar usuarios para el select
    };

    // Función para cargar parqueaderos y almacenarlos en caché
    async function cargarParqueaderosCache() {
        if (parqueaderosCache.length > 0) return parqueaderosCache;
        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/parqueaderos?json=1`);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with status ${res.status}: ${errorText}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                const data = await res.json();
                parqueaderosCache = Array.isArray(data) ? data : (data.parqueaderos || []);
                return parqueaderosCache;
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for parking lots. Response may not be JSON: ${jsonError.message}`);
            }
        } catch (err) {
            mostrarToast(`❌ Error al cargar parqueaderos: ${err.message}`, 'danger');
            return [];
        }
    }

    // Función para mostrar celdas en una cuadrícula (usado en modal de registro)
    async function mostrarCeldasEnGrid(grid, parqId, parqueaderos) {
        const parqSel = parqueaderos.find(p => String(p.id) === String(parqId));
        if (!parqId || !parqSel) {
            if (grid) grid.innerHTML = '<p class="text-center text-muted">Seleccione un parqueadero.</p>';
            if (UIElements.parqInfoModal) UIElements.parqInfoModal.textContent = '';
            return;
        }
        if (grid) grid.innerHTML = '<div class="text-center"><span class="spinner-border spinner-border-sm"></span> Cargando...</div>';
        if (UIElements.parqInfoModal) UIElements.parqInfoModal.textContent = '';
        let resCeldas;
        try {
            // Se asume que /admin/celdas/disponibles puede filtrar por parqueadero y mostrar todas las celdas (ocupadas y libres)
            resCeldas = await fetch(`${window.location.origin}/admin/celdas/disponibles?parqueadero_id=${parqId}&all=1`);
            if (!resCeldas.ok) {
                const errorText = await resCeldas.text();
                throw new Error(`Server responded with status ${resCeldas.status}: ${errorText}`);
            }
            const contentTypeCeldas = resCeldas.headers.get('content-type');
            if (!contentTypeCeldas || !contentTypeCeldas.includes('application/json')) {
                const errorText = await resCeldas.text();
                throw new SyntaxError(`Expected JSON response for cells, but received ${contentTypeCeldas || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            let celdasData;
            try {
                celdasData = await resCeldas.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for cells. Response may not be JSON: ${jsonError.message}`);
            }
            const celdas = celdasData.celdas || [];

            if (grid) grid.innerHTML = '';
            if (!celdas.length) {
                if (grid) grid.innerHTML = '<p class="text-center text-danger">No hay celdas en este parqueadero.</p>';
                return;
            }

            const celdasPorZona = celdas.reduce((acc, celda) => {
                const zona = celda.zona && celda.zona.nombre ? celda.zona.nombre : `Zona ID ${celda.zona_id}`;
                if (!acc[zona]) acc[zona] = [];
                acc[zona].push(celda);
                return acc;
            }, {});

            for (const zona in celdasPorZona) {
                const zonaHeader = document.createElement('div');
                zonaHeader.className = 'w-100 fw-bold my-2';
                zonaHeader.innerHTML = `<i class='fa-solid fa-layer-group me-1'></i>Zona: ${zona}`;
                if (grid) grid.appendChild(zonaHeader);
                celdasPorZona[zona].forEach(celda => {
                    const card = document.createElement('div');
                    card.className = 'celda-card-modal';
                    if (celda.estado === 'libre' || celda.estado === 'disponible') {
                        card.style.background = '#28a745'; // Verde para disponible
                        card.style.color = '#fff';
                    } else if (celda.estado === 'ocupada') {
                        card.style.background = '#dc3545'; // Rojo para ocupada
                        card.style.color = '#fff';
                    } else {
                        card.style.background = '#f5f5f5'; // Gris claro para otros estados
                        card.style.color = '#444';
                    }

                    let icono = '<i class="fa-solid fa-car-side"></i>'; // Icono por defecto
                    if (celda.tipo && /moto/i.test(celda.tipo)) icono = '<i class="fa-solid fa-motorcycle"></i>';
                    if (celda.tipo && /bici/i.test(celda.tipo)) icono = '<i class="fa-solid fa-bicycle"></i>';

                    let placa = celda.placa || '';
                    let usuarioDoc = (celda.usuario && celda.usuario.numero_documento) ? `Doc: ${celda.usuario.numero_documento}` : '';

                    card.innerHTML = `${icono} <b>Celda ${celda.numero || celda.id}</b><br>
                        Estado: <span style='color:inherit;font-weight:600;'>${celda.estado}</span><br>
                        Placa: <span style='color:inherit;font-weight:600;'>${placa || '-'}</span><br>
                        ${celda.estado === 'ocupada' && usuarioDoc ? `<span style='font-size:0.95em;'>${usuarioDoc}</span><br>` : ''}`;

                    if (celda.estado === 'ocupada') {
                        // Si la celda está ocupada, añadir un menú de opciones para "Dar Salida"
                        const dropdownHtml = `
                            <div class="dropdown" style="position: absolute; top: 5px; right: 5px;">
                                <button class="btn btn-sm btn-light dropdown-toggle" type="button" id="dropdownMenuButton-${celda.id}" data-bs-toggle="dropdown" aria-expanded="false" style="background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 30px; height: 30px; padding: 0; display: flex; align-items: center; justify-content: center; color: white;">
                                    <i class="fa-solid fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton-${celda.id}" style="min-width: unset; width: 120px; font-size: 0.9em; background-color: #495057;">
                                    <li><a class="dropdown-item text-white" href="#" data-action="liberar" data-placa="${placa}" data-celda-id="${celda.id}">Dar Salida</a></li>
                                </ul>
                            </div>
                        `;
                        card.insertAdjacentHTML('beforeend', dropdownHtml);

                        card.querySelector(`[data-action="liberar"][data-placa="${placa}"]`).addEventListener('click', async (e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Evitar que el click en el dropdown afecte la tarjeta
                            const placaToLiberate = e.target.dataset.placa;
                            showConfirmModal(`¿Dar salida al vehículo con placa ${placaToLiberate}?`, async (confirmed) => {
                                if (confirmed) {
                                    let res;
                                    try {
                                        res = await fetch(`${window.location.origin}/admin/vehiculo/liberar/${encodeURIComponent(placaToLiberate)}`, { method: 'POST' });
                                        let result;
                                        if (!res.ok) {
                                            const errorText = await res.text();
                                            throw new Error(`Server responded with status ${res.status}: ${errorText}`);
                                        }
                                        const contentTypeLib = res.headers.get('content-type');
                                        if (!contentTypeLib || !contentTypeLib.includes('application/json')) {
                                            const errorText = await res.text();
                                            throw new SyntaxError(`Expected JSON response, but received ${contentTypeLib || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
                                        }
                                        try {
                                            result = await res.json();
                                        } catch (jsonError) {
                                            throw new SyntaxError(`Failed to parse JSON for vehicle liberation. Response may not be JSON: ${jsonError.message}`);
                                        }

                                        if (res.ok) {
                                            mostrarToast(`✅ Salida de ${placaToLiberate} registrada con éxito.`, 'success');
                                            mostrarModalSalidaExitosa(result.placa, result.celdaNumero, result.zonaNombre, result.parqueaderoNombre);
                                            await mostrarCeldasEnGrid(grid, parqId, parqueaderos); // Recargar las celdas para actualizar el estado
                                        } else {
                                            mostrarToast(`⚠️ ${result.mensaje || 'Error al liberar celda'}`, 'danger');
                                        }
                                    } catch (err) {
                                        if (err instanceof SyntaxError) {
                                            mostrarToast(`❌ Error de formato de datos del servidor al liberar celda. Se esperaba JSON. (${err.message.substring(0, 100)}...)`, 'danger');
                                        } else {
                                            mostrarToast(`❌ Error inesperado al liberar celda: ${err.message}`, 'danger');
                                        }
                                    }
                                }
                            });
                        });
                    } else {
                        // Si la celda está libre/disponible, permitir seleccionarla
                        card.style.cursor = 'pointer';
                        card.onclick = () => {
                            document.querySelectorAll('#grid-celdas-modal .celda-card-modal.selected').forEach(btn => {
                                btn.classList.remove('selected');
                                btn.style.border = '1px solid #ddd'; // Restablecer borde
                            });
                            card.classList.add('selected');
                            card.style.border = '3px solid #0056b3'; // Borde azul para selección
                            selectedCellId = celda.id;
                            if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = false;
                        };
                    }
                    if (grid) grid.appendChild(card);
                });
            }
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para celdas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar celdas: ${error.message}`, 'danger');
            }
        }
    }

    // Función para cargar parqueaderos, zonas y celdas disponibles en el modal de asignación
    async function cargarParqueaderosZonasYCeldasDisponibles(placa, vehiculoId) {
        const selectParq = UIElements.selectParqueaderoAsignar;
        const selectZona = UIElements.selectZonaAsignar;
        const celdasGrid = UIElements.gridCeldasDisponibles;
        const modalCeldaMsg = UIElements.modalCeldaMsg;
        const btnConfirmarAsignacion = UIElements.btnConfirmarAsignacion;

        if (selectParq) selectParq.innerHTML = '<option value="">Cargando parqueaderos...</option>';
        if (selectZona) selectZona.innerHTML = '<option value="">Seleccione parqueadero primero</option>';
        if (celdasGrid) celdasGrid.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;"><span class="spinner-border spinner-border-sm"></span> Buscando celdas...</div>';
        if (modalCeldaMsg) modalCeldaMsg.textContent = '';
        if (btnConfirmarAsignacion) btnConfirmarAsignacion.disabled = true;
        selectedCellId = null;

        let allParqueaderos = [];
        let allZonas = [];

        try {
            // Cargar parqueaderos
            const resParq = await fetch(`${window.location.origin}/admin/parqueaderos?json=1`);
            let dataParq;
            if (!resParq.ok) {
                const errorText = await resParq.text();
                throw new Error(`Server responded with status ${resParq.status}: ${errorText}`);
            }
            const contentTypeParq = resParq.headers.get('content-type');
            if (!contentTypeParq || !contentTypeParq.includes('application/json')) {
                const errorText = await resParq.text();
                throw new SyntaxError(`Expected JSON response for parking lots, but received ${contentTypeParq || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                dataParq = await resParq.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for parking lots. Response may not be JSON: ${jsonError.message}`);
            }
            allParqueaderos = Array.isArray(dataParq) ? dataParq : (dataParq.parqueaderos || []);

            if (selectParq) selectParq.innerHTML = '<option value="">Seleccione Parqueadero</option>';
            if (allParqueaderos.length === 0) {
                if (selectParq) selectParq.innerHTML = '<option value="">No hay parqueaderos</option>';
                if (celdasGrid) celdasGrid.innerHTML = '<div style="text-align:center;color:#b94a48;grid-column:1/-1;">No hay parqueaderos registrados.</div>';
                return;
            }
            allParqueaderos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nombre;
                if (selectParq) selectParq.appendChild(opt);
            });

            // Cargar zonas
            const resZonas = await fetch(`${window.location.origin}/admin/zonas?json=1`);
            let dataZonas;
            if (!resZonas.ok) {
                const errorText = await resZonas.text();
                throw new Error(`Server responded with status ${resZonas.status}: ${errorText}`);
            }
            const contentTypeZonas = resZonas.headers.get('content-type');
            if (!contentTypeZonas || !contentTypeZonas.includes('application/json')) {
                const errorText = await resZonas.text();
                throw new SyntaxError(`Expected JSON response for zones, but received ${contentTypeZonas || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                dataZonas = await resZonas.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for zones. Response may not be JSON: ${jsonError.message}`);
            }
            allZonas = Array.isArray(dataZonas) ? dataZonas.zonas : (dataZonas.zonas || []);

            if (selectZona) selectZona.innerHTML = '<option value="">Seleccione Zona</option>';
            if (allZonas.length === 0) {
                if (selectZona) selectZona.innerHTML = '<option value="">No hay zonas</option>';
            } else {
                allZonas.forEach(z => {
                    const opt = document.createElement('option');
                    opt.value = z.id;
                    opt.textContent = z.nombre;
                    if (selectZona) selectZona.appendChild(opt);
                });
            }

            // Asignar event listeners para cambios en los selects
            if (selectParq) selectParq.onchange = () => cargarCeldasDisponibles(placa, vehiculoId);
            if (selectZona) selectZona.onchange = () => cargarCeldasDisponibles(placa, vehiculoId);

            // Cargar celdas inicialmente si ya hay un parqueadero seleccionado (ej. si se precarga)
            if (selectParq && selectParq.options.length > 1) {
                // selectParq.selectedIndex = 1; // Podría precargar el primero, pero lo dejamos a elección del usuario
                // await cargarCeldasDisponibles(placa, vehiculoId);
            }

        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para parqueaderos/zonas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar datos iniciales: ${error.message}`, 'danger');
            }
        }
    }

    // Función para cargar celdas disponibles para asignación (en modal de asignación)
    async function cargarCeldasDisponibles(placa, vehiculoId) {
        const parqueaderoId = UIElements.selectParqueaderoAsignar?.value;
        const zonaId = UIElements.selectZonaAsignar?.value;
        const celdasGrid = UIElements.gridCeldasDisponibles;
        const modalCeldaMsg = UIElements.modalCeldaMsg;
        const btnConfirmarAsignacion = UIElements.btnConfirmarAsignacion;

        if (celdasGrid) celdasGrid.innerHTML = '';
        if (modalCeldaMsg) modalCeldaMsg.textContent = '';
        if (btnConfirmarAsignacion) btnConfirmarAsignacion.disabled = true;
        selectedCellId = null;

        if (!parqueaderoId || !zonaId) {
            if (celdasGrid) celdasGrid.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;">Seleccione parqueadero y zona.</div>';
            return;
        }

        if (celdasGrid) celdasGrid.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;"><span class="spinner-border spinner-border-sm"></span> Buscando celdas...</div>';

        let res;
        try {
            // Se asume que el endpoint filtra por parqueadero, zona y tipo de vehículo
            res = await fetch(`${window.location.origin}/admin/celdas/disponibles?parqueadero_id=${parqueaderoId}&zona_id=${zonaId}&tipo=${UIElements.tipoRegistrar?.value || 'Carro'}`);
            let celdas;
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with status ${res.status}: ${errorText}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response for available cells, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                celdas = await res.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for available cells. Response may not be JSON: ${jsonError.message}`);
            }
            celdas = Array.isArray(celdas) ? celdas : (celdas.celdas || []);

            if (celdasGrid) celdasGrid.innerHTML = '';
            if (celdas.length === 0) {
                if (celdasGrid) celdasGrid.innerHTML = '<div style="text-align:center;color:#b94a48;grid-column:1/-1;">No hay celdas disponibles para este tipo en la zona/parqueadero seleccionado.</div>';
                return;
            }
            celdas.forEach((celda, index) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'celda-card-modal';
                card.style.background = '#28a745'; // Verde para disponible
                card.style.color = '#fff';
                card.style.minHeight = '80px';
                card.style.fontSize = '1em';
                card.style.fontWeight = '600';
                card.innerHTML = `Celda ${celda.numero || celda.id}<br>${celda.tipo}`;
                card.onclick = () => {
                    document.querySelectorAll('#celdas-disponibles-grid .celda-card-modal.selected').forEach(btn => {
                        btn.classList.remove('selected');
                        btn.style.border = '1px solid #ddd';
                    });
                    card.classList.add('selected');
                    card.style.border = '3px solid #0056b3';
                    selectedCellId = celda.id;
                    if (btnConfirmarAsignacion) btnConfirmarAsignacion.disabled = false;
                    if (modalCeldaMsg) modalCeldaMsg.textContent = '';
                };
                if (celdasGrid) celdasGrid.appendChild(card);

                // Enfocar la primera celda disponible para accesibilidad
                if (index === 0) {
                    setTimeout(() => {
                        card.focus();
                    }, 100);
                }
            });
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para celdas disponibles. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar celdas: ${error.message}`, 'danger');
            }
        }
    }

    // Función para cargar usuarios para el select de propietario en el modal de registro
    async function cargarUsuariosParaSeleccion() {
        let res;
        try {
            // Se asume que este endpoint devuelve todos los usuarios o una lista grande
            res = await fetch(`${window.location.origin}/admin/usuarios/buscar?query=`);
            let data;
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with status ${res.status}: ${errorText}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                data = await res.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for user selection. Response may not be JSON: ${jsonError.message}`);
            }
            allUsers = data.usuarios || []; // Almacenar en caché

            if (UIElements.selectPropietario) UIElements.selectPropietario.innerHTML = '<option value="">Seleccione propietario</option>';
            allUsers.forEach(usuario => {
                const opt = document.createElement('option');
                opt.value = usuario.id_usuario;
                opt.textContent = `${usuario.primer_nombre} ${usuario.primer_apellido || ''} — ${usuario.numero_documento}`;
                if (UIElements.selectPropietario) UIElements.selectPropietario.appendChild(opt);
            });
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al cargar propietarios. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar propietarios: ${error.message}`, 'danger');
            }
        }
    }

    // Función para cargar el resumen de celdas por estado
    async function cargarResumenCeldas() {
        const cont = UIElements.resumenCeldas;
        if (!cont) return;
        let res;
        try {
            res = await fetch(`${window.location.origin}/api/stats/dashboard`);
            let data;
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with status ${res.status}: ${errorText}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response for cell summary, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                const stats = await res.json();
                data = stats.celdasPorEstado;
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for cell summary. Response may not be JSON: ${jsonError.message}`);
            }

            if (!Array.isArray(data) || !data.length) {
                cont.innerHTML = '<div class="text-center text-muted">Sin datos de celdas</div>';
                return;
            }
            cont.innerHTML = data.map(row => `<div><b>${row.estado}:</b> ${row.cantidad}</div>`).join('');
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para resumen de celdas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar resumen de celdas: ${error.message}`, 'danger');
            }
        }
    }

    // Función para cargar el resumen de zonas
    async function cargarResumenZonas() {
        const cont = UIElements.resumenZonas;
        if (!cont) return;
        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/zonas?json=1`);
            let data;
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with status ${res.status}: ${errorText}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response for zone summary, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                data = await res.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for zone summary. Response may not be JSON: ${jsonError.message}`);
            }

            const zonas = Array.isArray(data) ? data.zonas : (data.zonas || []);

            if (!zonas.length) {
                cont.innerHTML = '<div class="text-center text-muted">Sin datos de zonas</div>';
                return;
            }
            cont.innerHTML = zonas.map(zona => `<div><b>${zona.nombre}:</b> ${zona.descripcion || 'N/A'}</div>`).join('');
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para resumen de zonas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar resumen de zonas: ${error.message}`, 'danger');
            }
        }
    }

    // Función para mostrar el modal de confirmación de salida exitosa
    const mostrarModalSalidaExitosa = (placa, celdaNumero, zonaNombre, parqueaderoNombre) => {
        if (UIElements.placaSalidaConfirmacion) UIElements.placaSalidaConfirmacion.textContent = placa;
        if (UIElements.celdaSalidaConfirmacion) UIElements.celdaSalidaConfirmacion.textContent = celdaNumero;
        if (UIElements.zonaSalidaConfirmacion) UIElements.zonaSalidaConfirmacion.textContent = zonaNombre;
        if (UIElements.parqueaderoSalidaConfirmacion) UIElements.parqueaderoSalidaConfirmacion.textContent = parqueaderoNombre;
        if (modalSalidaConfirmacionInstance) {
            modalSalidaConfirmacionInstance.show();
        }
    };

    // Función para manejar el proceso de ingreso de un vehículo
    async function handleIngreso() {
        const placa = normalizePlaca(UIElements.placaInput?.value);
        if (!placa) {
            mostrarToast('Por favor, ingrese una placa.', 'warning');
            return;
        }

        let vehData;
        try {
            // Verificar si el vehículo ya existe
            const resVeh = await fetch(`${window.location.origin}/admin/vehiculo/existe?placa=${encodeURIComponent(placa)}`);
            if (!resVeh.ok) {
                const errorText = await resVeh.text();
                throw new Error(`Server responded with status ${resVeh.status}: ${errorText}`);
            }
            const contentTypeVeh = resVeh.headers.get('content-type');
            if (!contentTypeVeh || !contentTypeVeh.includes('application/json')) {
                const errorText = await resVeh.text();
                throw new SyntaxError(`Expected JSON response for vehicle existence, but received ${contentTypeVeh || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                vehData = await resVeh.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for vehicle existence. Response may not be JSON: ${jsonError.message}`);
            }

            if (vehData.existe) {
                currentVehicle = vehData.vehiculo;
                currentParkingHistory = vehData.historialActivo;

                if (currentParkingHistory) {
                    // Si el vehículo ya está parqueado
                    mostrarToast(`⚠️ Este vehículo ya se encuentra parqueado en la celda ${currentParkingHistory.celda_numero}. Por favor, déle salida primero.`, 'warning');
                    if (UIElements.btnSalida) UIElements.btnSalida.disabled = false;
                    return;
                } else {
                    // Vehículo existe pero no está parqueado, mostrar modal de asignar celda
                    mostrarToast(`✅ Vehículo ${placa} encontrado. Asigne una celda.`, 'success');
                    if (UIElements.placaModalSpan) UIElements.placaModalSpan.textContent = placa;
                    if (modalAsignarInstance) modalAsignarInstance.show();
                    await cargarParqueaderosZonasYCeldasDisponibles(placa, currentVehicle.id);
                }
            } else {
                // Vehículo no encontrado, mostrar modal de registro
                mostrarToast(`⚠️ El vehículo con placa ${placa} no está registrado. Por favor, regístrelo.`, 'warning');
                if (UIElements.placaRegistrarInput) UIElements.placaRegistrarInput.value = placa;
                if (UIElements.placaRegistrarSpan) UIElements.placaRegistrarSpan.textContent = placa;
                if (UIElements.placaRegistrarSpanVehiculo) UIElements.placaRegistrarSpanVehiculo.textContent = placa;
                if (modalRegistroInstance) modalRegistroInstance.show();

                if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = true;
                selectedCellId = null;

                const parqueaderos = await cargarParqueaderosCache();
                if (UIElements.selectParqueaderoRegistro) {
                    UIElements.selectParqueaderoRegistro.innerHTML = '<option value="">Seleccione parqueadero</option>' + parqueaderos.map(p => `<option value="${p.id}">${p.nombre} (Capacidad: ${p.capacidad})</option>`).join('');
                    if (UIElements.selectParqueaderoRegistro.options.length > 1) {
                        // Opcional: seleccionar el primer parqueadero por defecto y cargar sus celdas
                        // UIElements.selectParqueaderoRegistro.selectedIndex = 1;
                        // await mostrarCeldasEnGrid(UIElements.gridCeldasModal, UIElements.selectParqueaderoRegistro.value, parqueaderos);
                    }
                    UIElements.selectParqueaderoRegistro.addEventListener('change', async () => {
                        await mostrarCeldasEnGrid(UIElements.gridCeldasModal, UIElements.selectParqueaderoRegistro.value, parqueaderos);
                    });
                }

                // Expandir acordeón de usuario y colapsar el de vehículo
                if (UIElements.collapseUsuario) {
                    const collapseUsuarioInstance = bootstrap.Collapse.getInstance(UIElements.collapseUsuario) || new bootstrap.Collapse(UIElements.collapseUsuario, { toggle: false });
                    collapseUsuarioInstance.show();
                }
                if (UIElements.collapseVehiculo) {
                    const collapseVehiculoInstance = bootstrap.Collapse.getInstance(UIElements.collapseVehiculo) || new bootstrap.Collapse(UIElements.collapseVehiculo, { toggle: false });
                    collapseVehiculoInstance.hide();
                }
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al verificar vehículo. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al verificar la placa: ${error.message}. Intente de nuevo.`, 'danger');
            }
        }
    }

    // Función para manejar el proceso de salida de un vehículo
    async function handleSalida() {
        const placa = normalizePlaca(UIElements.placaInput?.value);
        if (!placa) {
            mostrarToast('Por favor, ingrese una placa.', 'warning');
            return;
        }

        try {
            // Verificar si el vehículo existe y está parqueado
            const resVeh = await fetch(`${window.location.origin}/admin/vehiculo/existe?placa=${encodeURIComponent(placa)}`);
            if (!resVeh.ok) {
                const errorText = await resVeh.text();
                throw new Error(`Server responded with status ${resVeh.status}: ${errorText}`);
            }
            const contentTypeVeh = resVeh.headers.get('content-type');
            if (!contentTypeVeh || !contentTypeVeh.includes('application/json')) {
                const errorText = await resVeh.text();
                throw new SyntaxError(`Expected JSON response for vehicle existence, but received ${contentTypeVeh || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            const vehData = await resVeh.json();

            if (!vehData.existe) {
                mostrarToast(`⚠️ El vehículo con placa ${placa} no está registrado.`, 'warning');
                return;
            }

            if (!vehData.historialActivo) {
                mostrarToast(`⚠️ El vehículo con placa ${placa} no se encuentra parqueado actualmente.`, 'warning');
                return;
            }

            // Mostrar confirmación antes de la salida
            showConfirmModal(`¿Dar salida al vehículo con placa ${placa} de la celda ${vehData.historialActivo.celda_numero}?`, async (confirmed) => {
                if (confirmed) {
                    let res;
                    try {
                        res = await fetch(`${window.location.origin}/admin/vehiculo/liberar/${encodeURIComponent(placa)}`, { method: 'POST' });
                        let result;
                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Server responded with status ${res.status}: ${errorText}`);
                        }
                        const contentType = res.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            const errorText = await res.text();
                            throw new SyntaxError(`Expected JSON response, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
                        }
                        try {
                            result = await res.json();
                        } catch (jsonError) {
                            throw new SyntaxError(`Failed to parse JSON for vehicle liberation. Response may not be JSON: ${jsonError.message}`);
                        }

                        if (res.ok) {
                            mostrarToast(`✅ Salida de ${placa} registrada con éxito.`, 'success');
                            mostrarModalSalidaExitosa(result.placa, result.celdaNumero, result.zonaNombre, result.parqueaderoNombre);
                            // Limpiar UI y recargar resúmenes
                            resetUI();
                        } else {
                            mostrarToast(`⚠️ ${result.mensaje || 'Error al liberar celda'}`, 'danger');
                        }
                    } catch (err) {
                        if (err instanceof SyntaxError) {
                            mostrarToast(`❌ Error de formato de datos del servidor al liberar celda. Se esperaba JSON. (${err.message.substring(0, 100)}...)`, 'danger');
                        } else {
                            mostrarToast(`❌ Error inesperado al liberar celda: ${err.message}`, 'danger');
                        }
                    }
                }
            });
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al verificar vehículo para salida. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al verificar la placa para salida: ${error.message}. Intente de nuevo.`, 'danger');
            }
        }
    }

    // Función para manejar la confirmación de asignación de celda
    async function handleConfirmarAsignacion() {
        if (!selectedCellId) {
            mostrarToast('Por favor, seleccione una celda.', 'warning');
            return;
        }

        const placa = UIElements.placaModalSpan?.textContent;
        let vehiculoId = null;
        try {
            // Obtener el ID del vehículo (ya sea del estado actual o buscándolo)
            if (currentVehicle && currentVehicle.id) {
                vehiculoId = currentVehicle.id;
            } else {
                const resVeh = await fetch(`${window.location.origin}/admin/vehiculo/existe?placa=${encodeURIComponent(placa)}`);
                let vehData;
                if (!resVeh.ok) {
                    const errorText = await resVeh.text();
                    throw new Error(`Server responded with status ${resVeh.status}: ${errorText}`);
                }
                const contentTypeVeh = resVeh.headers.get('content-type');
                if (!contentTypeVeh || !contentTypeVeh.includes('application/json')) {
                    const errorText = await resVeh.text();
                    throw new SyntaxError(`Expected JSON response for vehicle existence, but received ${contentTypeVeh || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
                }
                try {
                    vehData = await resVeh.json();
                } catch (jsonError) {
                    throw new SyntaxError(`Failed to parse JSON for vehicle existence. Response may not be JSON: ${jsonError.message}`);
                }

                if (vehData.existe && vehData.vehiculo) {
                    vehiculoId = vehData.vehiculo.id;
                    currentVehicle = vehData.vehiculo; // Actualizar currentVehicle
                } else {
                    mostrarToast('Error: Vehículo no encontrado para la asignación.', 'danger');
                    return;
                }
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al verificar vehículo. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al obtener ID de vehículo para asignación: ${error.message}`, 'danger');
            }
            return;
        }

        // Realizar la asignación de la celda
        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/asignar-celda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehiculo_id: vehiculoId,
                    celda_id: selectedCellId,
                    placa: placa,
                    // Estos campos pueden ser necesarios si el backend los usa para actualizar el vehículo al asignar
                    color: UIElements.colorRegistrar?.value,
                    modelo: UIElements.modeloRegistrar?.value,
                    marca: UIElements.marcaRegistrar?.value,
                    tipo: UIElements.tipoRegistrar?.value,
                    usuario_id_usuario: UIElements.selectPropietario?.value || (currentVehicle ? currentVehicle.usuario_id_usuario : null)
                })
            });
            let parkResult;
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server responded with status ${res.status}: ${errorText}`);
            }
            const contentTypeParquear = res.headers.get('content-type');
            if (!contentTypeParquear || !contentTypeParquear.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response for parking, but received ${contentTypeParquear || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                parkResult = await res.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for parking. Response may not be JSON: ${jsonError.message}`);
            }

            if (res.ok) {
                mostrarToast(`✅ Vehículo con placa ${placa} ingresado correctamente en celda ${selectedCellId}.`, 'success');
                if (modalAsignarInstance) modalAsignarInstance.hide();
                resetUI(); // Limpiar UI y recargar resúmenes
            } else {
                mostrarToast(`⚠️ ${parkResult.mensaje || 'Error al parquear vehículo'}`, 'danger');
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al parquear. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error inesperado al parquear vehículo: ${error.message}`, 'danger');
            }
        }
    }

    // Función para manejar el registro de un nuevo usuario (propietario)
    async function handleRegistroUsuario(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        // Normalizar y limpiar datos
        userData.numero_documento = normalizeDocumento(userData.numero_documento); // Usar el nombre del campo del formulario
        userData.primer_nombre = normalizeTexto(userData.primer_nombre);
        userData.segundo_nombre = normalizeTexto(userData.segundo_nombre);
        userData.primer_apellido = normalizeTexto(userData.primer_apellido);
        userData.segundo_apellido = normalizeTexto(userData.segundo_apellido);
        userData.direccion_correo = normalizeCorreo(userData.direccion_correo); // Usar el nombre del campo del formulario
        userData.numero_celular = normalizeDocumento(userData.numero_celular); // Usar el nombre del campo del formulario

        // Añadir campos obligatorios que podrían no estar en el formulario
        userData.tipo_documento = 'CC'; // Asumir CC por defecto
        userData.segundo_nombre = userData.segundo_nombre || null;
        userData.segundo_apellido = userData.segundo_apellido || null;
        userData.foto_perfil = userData.foto_perfil || null; // Si no hay campo de foto
        userData.estado = 'activo';
        userData.clave = userData.clave || 'default_clave'; // Clave por defecto si no se pide
        userData.perfil_usuario_id = 3; // Asumir perfil de cliente/propietario

        let res;
        try {
            res = await fetch(`${window.location.origin}/api/usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            let result;
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Server responded with status ${res.status}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                result = await res.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for user registration. Response may not be JSON: ${jsonError.message}`);
            }

            if (res.ok) {
                mostrarToast('✅ Propietario registrado exitosamente.', 'success');
                if (UIElements.selectPropietario) {
                    // Actualizar el select con el nuevo usuario
                    UIElements.selectPropietario.innerHTML = `<option value="${result.id_usuario}">${result.primer_nombre} ${result.primer_apellido} — ${result.numero_documento}</option>`;
                    UIElements.selectPropietario.value = result.id_usuario;
                }
                updateUserSummary(result); // Mostrar resumen del nuevo usuario

                // Colapsar acordeón de usuario y expandir el de vehículo
                if (UIElements.collapseUsuario) {
                    const collapseUsuarioInstance = bootstrap.Collapse.getInstance(UIElements.collapseUsuario) || new bootstrap.Collapse(UIElements.collapseUsuario, { toggle: false });
                    collapseUsuarioInstance.hide();
                }
                if (UIElements.collapseVehiculo) {
                    const collapseVehiculoInstance = bootstrap.Collapse.getInstance(UIElements.collapseVehiculo) || new bootstrap.Collapse(UIElements.collapseVehiculo, { toggle: false });
                    collapseVehiculoInstance.show();
                }
                // Habilitar el botón de guardar vehículo si ya hay una celda seleccionada
                if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = selectedCellId === null;
            } else {
                mostrarToast(`⚠️ Error al registrar propietario: ${result.mensaje || 'Error desconocido'}`, 'danger');
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al registrar usuario. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error inesperado al registrar propietario: ${error.message}`, 'danger');
            }
        }
    }

    // Función para manejar el registro de un nuevo vehículo
    async function handleRegistroVehiculo(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const vehiculoData = Object.fromEntries(formData.entries());

        vehiculoData.placa = normalizePlaca(vehiculoData.placa);
        vehiculoData.usuario_id_usuario = UIElements.selectPropietario?.value; // Obtener el ID del propietario seleccionado

        // Asegurarse de que los campos de color, modelo, marca, tipo existan o sean null
        vehiculoData.color = UIElements.colorRegistrar?.value || null;
        vehiculoData.modelo = UIElements.modeloRegistrar?.value || null;
        vehiculoData.marca = UIElements.marcaRegistrar?.value || null;
        vehiculoData.tipo = UIElements.tipoRegistrar?.value || 'Carro'; // Tipo por defecto

        if (!vehiculoData.usuario_id_usuario) {
            mostrarToast('Por favor, seleccione o registre un propietario para el vehículo.', 'warning');
            return;
        }
        if (!selectedCellId) {
             mostrarToast('Por favor, seleccione una celda disponible para el vehículo.', 'warning');
             return;
        }

        let res;
        try {
            res = await fetch(`${window.location.origin}/api/vehiculo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehiculoData)
            });
            let result;
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Server responded with status ${res.status}`);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await res.text();
                throw new SyntaxError(`Expected JSON response, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
            }
            try {
                result = await res.json();
            } catch (jsonError) {
                throw new SyntaxError(`Failed to parse JSON for vehicle registration. Response may not be JSON: ${jsonError.message}`);
            }

            if (res.ok) {
                mostrarToast('✅ Vehículo registrado exitosamente.', 'success');
                currentVehicle = result; // Guardar el vehículo recién registrado
                if (modalRegistroInstance) modalRegistroInstance.hide();
                if (UIElements.placaInput) UIElements.placaInput.value = result.placa;
                // Si hay una celda seleccionada, proceder a la asignación
                if (selectedCellId) {
                    await handleConfirmarAsignacion(); // Esto también llamará a resetUI()
                } else {
                    mostrarToast('Vehículo registrado, pero no se seleccionó una celda para asignar. Puede asignarla manualmente.', 'info');
                    if (UIElements.placaModalSpan) UIElements.placaModalSpan.textContent = result.placa;
                    if (modalAsignarInstance) modalAsignarInstance.show();
                    await cargarParqueaderosZonasYCeldasDisponibles(result.placa, result.id);
                }
                // Limpiar formularios y restablecer UI
                if (UIElements.formRegistroUsuario) UIElements.formRegistroUsuario.reset();
                if (UIElements.formRegistroVehiculo) UIElements.formRegistroVehiculo.reset();
                if (UIElements.resumenPropietario) UIElements.resumenPropietario.style.display = 'none';
                if (UIElements.selectPropietario) UIElements.selectPropietario.innerHTML = '<option value="">Seleccione propietario</option>';
                await cargarUsuariosParaSeleccion(); // Recargar la lista de usuarios
                resetUI(); // Asegurarse de que todo esté limpio y actualizado
            } else {
                mostrarToast(`⚠️ Error al registrar vehículo: ${result.mensaje || 'Error desconocido'}`, 'danger');
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al registrar vehículo. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error inesperado al registrar vehículo: ${error.message}`, 'danger');
            }
        }
    }

    // Función debounce para limitar la frecuencia de ejecución de funciones
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }


   
    if (UIElements.placaInput) {
        UIElements.placaInput.addEventListener('input', () => {
            const placa = normalizePlaca(UIElements.placaInput.value);
            UIElements.placaInput.value = placa; 

           
            if (UIElements.btnSalida) UIElements.btnSalida.disabled = placa.length === 0;
            if (UIElements.btnIngreso) UIElements.btnIngreso.disabled = placa.length === 0;
        });
    }

    
    if (UIElements.btnIngreso) UIElements.btnIngreso.addEventListener('click', handleIngreso);
    if (UIElements.btnSalida) UIElements.btnSalida.addEventListener('click', handleSalida);

    // Event listeners para los botones de cerrar modales
    if (UIElements.btnCerrarModalRegistro) {
        UIElements.btnCerrarModalRegistro.addEventListener('click', () => {
            resetUI();
        });
    }

    if (UIElements.btnCerrarModalAsignar) {
        UIElements.btnCerrarModalAsignar.addEventListener('click', () => {
            resetUI();
        });
    }

    if (UIElements.btnConfirmarAsignacion) UIElements.btnConfirmarAsignacion.addEventListener('click', handleConfirmarAsignacion);

    // Event listeners para los formularios de registro
    if (UIElements.formRegistroUsuario) UIElements.formRegistroUsuario.addEventListener('submit', handleRegistroUsuario);
    if (UIElements.formRegistroVehiculo) UIElements.formRegistroVehiculo.addEventListener('submit', handleRegistroVehiculo);

    // Event listener para la búsqueda de propietario con debounce
    if (UIElements.inputBuscarPropietario) {
        UIElements.inputBuscarPropietario.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            if (query.length < 3) {
                if (dropdownSugerencias) dropdownSugerencias.style.display = 'none';
                return;
            }

            let res;
            try {
                res = await fetch(`${window.location.origin}/admin/usuarios/buscar?query=${encodeURIComponent(query)}`);
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server responded with status ${res.status}: ${errorText}`);
                }
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const errorText = await res.text();
                    throw new SyntaxError(`Expected JSON response, but received ${contentType || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
                }
                const data = await res.json();
                const usuarios = data.usuarios || [];

                if (!dropdownSugerencias) { // En caso de que no se haya creado al inicio
                    dropdownSugerencias = document.createElement('div');
                    dropdownSugerencias.className = 'dropdown-menu show';
                    dropdownSugerencias.style.position = 'absolute';
                    dropdownSugerencias.style.width = UIElements.inputBuscarPropietario.offsetWidth + 'px';
                    UIElements.inputBuscarPropietario.parentNode.insertBefore(dropdownSugerencias, UIElements.inputBuscarPropietario.nextSibling);
                    UIElements.sugerenciasPropietario = dropdownSugerencias;
                }
                dropdownSugerencias.innerHTML = '';
                if (usuarios.length > 0) {
                    usuarios.forEach(usuario => {
                        const item = document.createElement('a');
                        item.className = 'dropdown-item';
                        item.href = '#';
                        item.textContent = `${usuario.primer_nombre} ${usuario.primer_apellido} (${usuario.numero_documento})`;
                        item.onclick = (e) => {
                            e.preventDefault();
                            if (UIElements.selectPropietario) {
                                UIElements.selectPropietario.innerHTML = `<option value="${usuario.id_usuario}">${usuario.primer_nombre} ${usuario.primer_apellido} — ${usuario.numero_documento}</option>`;
                                UIElements.selectPropietario.value = usuario.id_usuario;
                            }
                            updateUserSummary(usuario);
                            if (dropdownSugerencias) dropdownSugerencias.style.display = 'none';
                            if (UIElements.inputBuscarPropietario) UIElements.inputBuscarPropietario.value = ''; // Limpiar input de búsqueda
                            // Habilitar botón de guardar vehículo si ya hay una celda seleccionada
                            if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = selectedCellId === null;

                            // Colapsar acordeón de usuario y expandir el de vehículo
                            if (UIElements.collapseUsuario) {
                                const collapseUsuarioInstance = bootstrap.Collapse.getInstance(UIElements.collapseUsuario) || new bootstrap.Collapse(UIElements.collapseUsuario, { toggle: false });
                                collapseUsuarioInstance.hide();
                            }
                            if (UIElements.collapseVehiculo) {
                                const collapseVehiculoInstance = bootstrap.Collapse.getInstance(UIElements.collapseVehiculo) || new bootstrap.Collapse(UIElements.collapseVehiculo, { toggle: false });
                                collapseVehiculoInstance.show();
                            }
                        };
                        dropdownSugerencias.appendChild(item);
                    });
                    dropdownSugerencias.classList.add('show'); // Mostrar el dropdown
                } else {
                    dropdownSugerencias.classList.remove('show'); // Ocultar el dropdown
                }
            } catch (error) {
                if (error instanceof SyntaxError) {
                    mostrarToast(`❌ Error de formato de datos del servidor al buscar usuarios. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
                } else {
                    mostrarToast(`❌ Error al buscar usuarios: ${error.message}`, 'danger');
                }
            }
        }, 300));
    }

    // Event listener para ocultar sugerencias de propietario al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (dropdownSugerencias && UIElements.inputBuscarPropietario && !UIElements.inputBuscarPropietario.contains(e.target) && !dropdownSugerencias.contains(e.target)) {
            dropdownSugerencias.classList.remove('show');
        }
    });

    // Event listener para el select de propietario (cuando se elige uno de la lista)
    if (UIElements.selectPropietario) {
        UIElements.selectPropietario.addEventListener('change', async (e) => {
            const userId = e.target.value;
            if (userId) {
                try {
                    const usuario = allUsers.find(u => String(u.id_usuario) === String(userId));
                    if (usuario) {
                        updateUserSummary(usuario);
                        // Colapsar acordeón de usuario y expandir el de vehículo
                        if (UIElements.collapseUsuario) {
                            const collapseUsuarioInstance = bootstrap.Collapse.getInstance(UIElements.collapseUsuario) || new bootstrap.Collapse(UIElements.collapseUsuario, { toggle: false });
                            collapseUsuarioInstance.hide();
                        }
                        if (UIElements.collapseVehiculo) {
                            const collapseVehiculoInstance = bootstrap.Collapse.getInstance(UIElements.collapseVehiculo) || new bootstrap.Collapse(UIElements.collapseVehiculo, { toggle: false });
                            collapseVehiculoInstance.show();
                        }
                        if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = selectedCellId === null;
                    } else {
                        mostrarToast('Propietario no encontrado en la lista.', 'warning');
                        if (UIElements.resumenPropietario) UIElements.resumenPropietario.style.display = 'none';
                        if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = true;
                    }
                } catch (error) {
                    console.error('Error al cargar datos del propietario:', error);
                    mostrarToast(`❌ Error al cargar datos del propietario: ${error.message}`, 'danger');
                    if (UIElements.resumenPropietario) UIElements.resumenPropietario.style.display = 'none';
                    if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = true;
                }
            } else {
                if (UIElements.resumenPropietario) UIElements.resumenPropietario.style.display = 'none';
                if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = true;
            }
        });
    }

    // Event listener para el botón de cerrar el modal de confirmación de salida
    if (UIElements.btnCerrarModalSalidaConfirmacion) {
        UIElements.btnCerrarModalSalidaConfirmacion.addEventListener('click', () => {
            resetUI();
        });
    }

    // Event listeners para los botones de confirmación genéricos del modal
    if (UIElements.confirmOkBtn) {
        UIElements.confirmOkBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback(true);
            }
            if (confirmModalInstance) {
                confirmModalInstance.hide();
            }
            confirmCallback = null; // Limpiar el callback
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
            confirmCallback = null; // Limpiar el callback
        });
    }

    // Event listener para la paleta de colores
    document.querySelectorAll('.color-palette .color-circle').forEach(circle => {
        circle.addEventListener('click', function() {
            const colorName = this.dataset.color;
            if (UIElements.colorRegistrar) {
                UIElements.colorRegistrar.value = colorName;
            }
        });
    });

    // Event listeners para los selects de parqueadero y zona en el modal de registro y asignación
    if (UIElements.selectParqueaderoRegistro) {
        UIElements.selectParqueaderoRegistro.addEventListener('change', async (e) => {
            const parqueaderoId = e.target.value;
            const parqueaderos = await cargarParqueaderosCache(); // Asegurarse de tener los parqueaderos
            if (parqueaderoId) {
                // Obtener info del parqueadero para mostrar en parq-info-modal
                const selectedParqueadero = parqueaderos.find(p => String(p.id) === String(parqueaderoId));
                if (selectedParqueadero && UIElements.parqInfoModal) {
                    UIElements.parqInfoModal.textContent = `Capacidad: ${selectedParqueadero.capacidad}, Ocupadas: ${selectedParqueadero.ocupadas || 'N/A'}, Disponibles: ${selectedParqueadero.disponibles || 'N/A'}`;
                } else if (UIElements.parqInfoModal) {
                    UIElements.parqInfoModal.textContent = '';
                }
                await mostrarCeldasEnGrid(UIElements.gridCeldasModal, parqueaderoId, parqueaderos);
            } else {
                if (UIElements.parqInfoModal) UIElements.parqInfoModal.textContent = '';
                if (UIElements.gridCeldasModal) UIElements.gridCeldasModal.innerHTML = '<p class="text-center text-muted" style="grid-column:1/-1;">Seleccione un parqueadero para ver las celdas disponibles.</p>';
                if (UIElements.btnGuardarVehiculoRegistrar) UIElements.btnGuardarVehiculoRegistrar.disabled = true;
            }
        });
    }

    if (UIElements.selectParqueaderoAsignar) {
        UIElements.selectParqueaderoAsignar.addEventListener('change', async (e) => {
            const parqueaderoId = e.target.value;
            // Limpiar zonas y celdas al cambiar de parqueadero
            if (UIElements.selectZonaAsignar) UIElements.selectZonaAsignar.innerHTML = '<option value="">Seleccione Zona</option>';
            if (UIElements.gridCeldasDisponibles) UIElements.gridCeldasDisponibles.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;">Seleccione parqueadero y zona.</div>';
            if (UIElements.btnConfirmarAsignacion) UIElements.btnConfirmarAsignacion.disabled = true;
            selectedCellId = null;

            if (parqueaderoId) {
                // Cargar zonas para el parqueadero seleccionado
                let resZonas;
                try {
                    resZonas = await fetch(`${window.location.origin}/admin/zonas?parqueadero_id=${parqueaderoId}&json=1`);
                    if (!resZonas.ok) {
                        const errorText = await resZonas.text();
                        throw new Error(`Server responded with status ${resZonas.status}: ${errorText}`);
                    }
                    const contentTypeZonas = resZonas.headers.get('content-type');
                    if (!contentTypeZonas || !contentTypeZonas.includes('application/json')) {
                        const errorText = await resZonas.text();
                        throw new SyntaxError(`Expected JSON response for zones, but received ${contentTypeZonas || 'no content type'}. Response: ${errorText.substring(0, 200)}...`);
                    }
                    const dataZonas = await resZonas.json();
                    const zonas = Array.isArray(dataZonas) ? dataZonas.zonas : (dataZonas.zonas || []);

                    if (UIElements.selectZonaAsignar) {
                        UIElements.selectZonaAsignar.innerHTML = '<option value="">Seleccione Zona</option>';
                        zonas.forEach(z => {
                            const opt = document.createElement('option');
                            opt.value = z.id;
                            opt.textContent = z.nombre;
                            UIElements.selectZonaAsignar.appendChild(opt);
                        });
                    }
                } catch (error) {
                    mostrarToast(`❌ Error al cargar zonas: ${error.message}`, 'danger');
                }
            }
        });
    }

    if (UIElements.selectZonaAsignar) {
        UIElements.selectZonaAsignar.addEventListener('change', async (e) => {
            const parqueaderoId = UIElements.selectParqueaderoAsignar?.value;
            const zonaId = e.target.value;
            if (parqueaderoId && zonaId) {
                await cargarCeldasDisponibles(UIElements.placaModalSpan?.textContent, currentVehicle?.id);
            } else {
                if (UIElements.gridCeldasDisponibles) UIElements.gridCeldasDisponibles.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;">Seleccione parqueadero y zona.</div>';
                if (UIElements.btnConfirmarAsignacion) UIElements.btnConfirmarAsignacion.disabled = true;
                selectedCellId = null;
            }
        });
    }

   
    resetUI(); 
});
