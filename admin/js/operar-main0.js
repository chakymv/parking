let allUsers = [];
let selectedCellId = null;
let dropdownSugerencias = null;

document.addEventListener('DOMContentLoaded', () => {
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
        tipoRegistrar: document.getElementById('tipo_registrar'),
        btnGuardarVehiculoRegistrar: document.getElementById('btn-guardar-vehiculo-registrar'),

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

        // Nuevo modal para confirmación de salida
        modalSalidaConfirmacion: document.getElementById('modal-salida-confirmacion'),
        placaSalidaConfirmacion: document.getElementById('placa-salida-confirmacion'),
        celdaSalidaConfirmacion: document.getElementById('celda-salida-confirmacion'),
        zonaSalidaConfirmacion: document.getElementById('zona-salida-confirmacion'),
        parqueaderoSalidaConfirmacion: document.getElementById('parqueadero-salida-confirmacion'),
        btnCerrarModalSalidaConfirmacion: document.getElementById('btn-cerrar-modal-salida-confirmacion')
    };

    let parqueaderosCache = [];
    let confirmCallback = null;

    const mostrarToast = (mensaje, tipo = 'success') => {
        UIElements.toastBody.textContent = mensaje;
        UIElements.toastMsg.className = `toast align-items-center text-bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3`;
        UIElements.toastMsg.style.display = 'block';
        setTimeout(() => {
            UIElements.toastMsg.style.display = 'none';
        }, 3500);
    };

    const cerrarToast = () => {
        UIElements.toastMsg.style.display = 'none';
    };

    const showConfirmModal = (message, onConfirm) => {
        UIElements.confirmMessage.textContent = message;
        confirmCallback = onConfirm;
        UIElements.confirmModal.classList.add('mostrar');
    };

    const initAcordeon = () => {
        const toggle = (btn, panel, otherPanel, otherBtn) => {
            const isShowing = panel.classList.contains('show');
            if (isShowing) {
                panel.style.height = '0px';
                panel.classList.remove('show');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                panel.classList.add('show');
                panel.style.height = panel.scrollHeight + 'px';
                btn.setAttribute('aria-expanded', 'true');

                if (otherPanel.classList.contains('show')) {
                    otherPanel.style.height = '0px';
                    otherPanel.classList.remove('show');
                    otherBtn.setAttribute('aria-expanded', 'false');
                }
            }
        };

        if (UIElements.btnAcordeonUsuario && UIElements.collapseUsuario && UIElements.btnAcordeonVehiculo && UIElements.collapseVehiculo) {
            UIElements.btnAcordeonUsuario.onclick = () => {
                toggle(UIElements.btnAcordeonUsuario, UIElements.collapseUsuario, UIElements.collapseVehiculo, UIElements.btnAcordeonVehiculo);
            };
            UIElements.btnAcordeonVehiculo.onclick = () => {
                toggle(UIElements.btnAcordeonVehiculo, UIElements.collapseVehiculo, UIElements.collapseUsuario, UIElements.btnAcordeonUsuario);
            };

            if (UIElements.collapseVehiculo.classList.contains('show')) {
                UIElements.collapseVehiculo.style.height = UIElements.collapseVehiculo.scrollHeight + 'px';
            }
        }
    };

    function updateUserSummary(user) {
        UIElements.resNombre.textContent = `${user.primer_nombre} ${user.segundo_nombre || ''} ${user.primer_apellido} ${user.segundo_apellido || ''}`.trim();
        UIElements.resDocumento.textContent = user.numero_documento;
        UIElements.resCorreo.textContent = user.direccion_correo;
        UIElements.resCelular.textContent = user.numero_celular;
        UIElements.resumenPropietario.style.display = 'block';
    }

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
            console.error('Error al cargar parqueaderos:', err);
            mostrarToast(`❌ Error al cargar parqueaderos: ${err.message}`, 'danger');
            return [];
        }
    }

    async function mostrarCeldasEnGrid(grid, parqId, parqueaderos) {
        const parqSel = parqueaderos.find(p => String(p.id) === String(parqId));
        if (!parqId || !parqSel) {
            grid.innerHTML = '<p class="text-center text-muted">Seleccione un parqueadero.</p>';
            UIElements.parqInfoModal.textContent = '';
            return;
        }
        grid.innerHTML = '<div class="text-center"><span class="spinner-border spinner-border-sm"></span> Cargando...</div>';
        UIElements.parqInfoModal.textContent = '';
        let resCeldas;
        try {
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

            const libres = celdas.filter(c => c.estado === 'libre').length;
            UIElements.parqInfoModal.innerHTML = `<i class='fa-solid fa-warehouse me-1'></i> <b>${parqSel.nombre}</b> &mdash; Capacidad: <span class='text-primary'>${parqSel.capacidad}</span> &mdash; <span class='text-success fw-bold'>${libres} libres</span>`;

            grid.innerHTML = '';
            if (!celdas.length) {
                grid.innerHTML = '<p class="text-center text-danger">No hay celdas en este parqueadero.</p>';
                return;
            }

            const celdasPorZona = celdas.reduce((acc, celda) => {
                const zona = celda.zona_nombre || `Zona ID ${celda.zona_id}`;
                if (!acc[zona]) acc[zona] = [];
                acc[zona].push(celda);
                return acc;
            }, {});

            for (const zona in celdasPorZona) {
                const zonaHeader = document.createElement('div');
                zonaHeader.className = 'w-100 fw-bold my-2';
                zonaHeader.innerHTML = `<i class='fa-solid fa-layer-group me-1'></i>Zona: ${zona}`;
                grid.appendChild(zonaHeader);
                celdasPorZona[zona].forEach(celda => {
                    const card = document.createElement('div');
                    card.className = 'celda-card-modal';
                    if (celda.estado === 'libre' || celda.estado === 'disponible') {
                        card.style.background = '#28a745';
                        card.style.color = '#fff';
                    } else if (celda.estado === 'ocupada') {
                        card.style.background = '#dc3545';
                        card.style.color = '#fff';
                    } else {
                        card.style.background = '#f5f5f5';
                        card.style.color = '#444';
                    }

                    let icono = '<i class="fa-solid fa-car-side"></i>';
                    if (celda.tipo && /moto/i.test(celda.tipo)) icono = '<i class="fa-solid fa-motorcycle"></i>';
                    if (celda.tipo && /bici/i.test(celda.tipo)) icono = '<i class="fa-solid fa-bicycle"></i>';

                    let placa = celda.placa || '';
                    let usuarioDoc = (celda.usuario && celda.usuario.numero_documento) ? `Doc: ${celda.usuario.numero_documento}` : '';

                    card.innerHTML = `${icono} <b>Celda ${celda.numero || celda.id}</b><br>
                        Estado: <span style='color:inherit;font-weight:600;'>${celda.estado}</span><br>
                        Placa: <span style='color:inherit;font-weight:600;'>${placa || '-'}</span><br>
                        ${celda.estado === 'ocupada' && usuarioDoc ? `<span style='font-size:0.95em;'>${usuarioDoc}</span><br>` : ''}`;

                    if (celda.estado === 'ocupada') {
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
                            e.stopPropagation();
                            const placaToLiberate = e.target.dataset.placa;
                            const celdaIdToRefresh = e.target.dataset.celdaId;
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
                                            mostrarModalSalidaExitosa(result.placa, result.celdaNumero, result.zonaNombre, result.parqueaderoNombre);
                                            await mostrarCeldasEnGrid(grid, parqId, parqueaderos);
                                        } else {
                                            mostrarToast(`⚠️ ${result.mensaje || 'Error al liberar celda'}`, 'danger');
                                        }
                                    } catch (err) {
                                        console.error('Error al liberar celda:', err);
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
                        card.style.cursor = 'pointer';
                        card.onclick = () => {
                            document.querySelectorAll('#grid-celdas-modal .celda-card-modal.selected').forEach(btn => {
                                btn.classList.remove('selected');
                                btn.style.border = '1px solid #ddd';
                            });
                            card.classList.add('selected');
                            card.style.border = '3px solid #0056b3';
                            selectedCellId = celda.id;
                            UIElements.btnGuardarVehiculoRegistrar.disabled = false;
                        };
                    }
                    grid.appendChild(card);
                });
            }
        } catch (err) {
            console.error('Error al cargar celdas:', err);
            grid.innerHTML = '<p class="text-center text-danger">Error al cargar celdas.</p>';
            if (err instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para celdas. Se esperaba JSON. (${err.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar celdas: ${err.message}`, 'danger');
            }
        }
    }

    async function cargarParqueaderosZonasYCeldasDisponibles(placa, vehiculoId) {
        const selectParq = UIElements.selectParqueaderoAsignar;
        const selectZona = UIElements.selectZonaAsignar;
        const celdasGrid = UIElements.gridCeldasDisponibles;
        const modalCeldaMsg = UIElements.modalCeldaMsg;
        const btnConfirmarAsignacion = UIElements.btnConfirmarAsignacion;

        selectParq.innerHTML = '<option value="">Cargando parqueaderos...</option>';
        selectZona.innerHTML = '<option value="">Seleccione parqueadero primero</option>';
        celdasGrid.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;"><span class="spinner-border spinner-border-sm"></span> Buscando celdas...</div>';
        modalCeldaMsg.textContent = '';
        btnConfirmarAsignacion.disabled = true;
        selectedCellId = null;

        let allParqueaderos = [];
        let allZonas = [];

        let resParq;
        let resZonas;
        try {
            resParq = await fetch(`${window.location.origin}/admin/parqueaderos?json=1`);
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

            selectParq.innerHTML = '<option value="">Seleccione Parqueadero</option>';
            if (allParqueaderos.length === 0) {
                selectParq.innerHTML = '<option value="">No hay parqueaderos</option>';
                celdasGrid.innerHTML = '<div style="text-align:center;color:#b94a48;grid-column:1/-1;">No hay parqueaderos registrados.</div>';
                return;
            }
            allParqueaderos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nombre;
                selectParq.appendChild(opt);
            });

            resZonas = await fetch(`${window.location.origin}/admin/zonas?json=1`);
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
            allZonas = Array.isArray(dataZonas) ? dataZonas : (dataZonas.zonas || []);

            selectZona.innerHTML = '<option value="">Seleccione Zona</option>';
            if (allZonas.length === 0) {
                selectZona.innerHTML = '<option value="">No hay zonas</option>';
            } else {
                allZonas.forEach(z => {
                    const opt = document.createElement('option');
                    opt.value = z.id;
                    opt.textContent = z.nombre;
                    selectZona.appendChild(opt);
                });
            }

            selectParq.onchange = () => cargarCeldasDisponibles(placa, vehiculoId);
            selectZona.onchange = () => cargarCeldasDisponibles(placa, vehiculoId);

            if (selectParq.options.length > 1) {
                selectParq.selectedIndex = 1;
                await cargarCeldasDisponibles(placa, vehiculoId);
            }

        } catch (error) {
            console.error('Error loading parking lots or zones:', error);
            selectParq.innerHTML = '<option value="">Error al cargar</option>';
            selectZona.innerHTML = '<option value="">Error al cargar</option>';
            celdasGrid.innerHTML = '<div style="text-align:center;color:#b94a48;grid-column:1/-1;">Error al cargar datos iniciales.</div>';
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para parqueaderos/zonas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar datos iniciales: ${error.message}`, 'danger');
            }
        }
    }

    async function cargarCeldasDisponibles(placa, vehiculoId) {
        const parqueaderoId = UIElements.selectParqueaderoAsignar.value;
        const zonaId = UIElements.selectZonaAsignar.value;
        const celdasGrid = UIElements.gridCeldasDisponibles;
        const modalCeldaMsg = UIElements.modalCeldaMsg;
        const btnConfirmarAsignacion = UIElements.btnConfirmarAsignacion;

        celdasGrid.innerHTML = '';
        modalCeldaMsg.textContent = '';
        btnConfirmarAsignacion.disabled = true;
        selectedCellId = null;

        if (!parqueaderoId || !zonaId) {
            celdasGrid.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;">Seleccione parqueadero y zona.</div>';
            return;
        }

        celdasGrid.innerHTML = '<div style="text-align:center;color:#888;grid-column:1/-1;"><span class="spinner-border spinner-border-sm"></span> Buscando celdas...</div>';

        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/celdas/disponibles?parqueadero_id=${parqueaderoId}&zona_id=${zonaId}&tipo=${UIElements.tipoRegistrar.value || 'Carro'}`);
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

            celdasGrid.innerHTML = '';
            if (celdas.length === 0) {
                celdasGrid.innerHTML = '<div style="text-align:center;color:#b94a48;grid-column:1/-1;">No hay celdas disponibles para este tipo en la zona/parqueadero seleccionado.</div>';
                return;
            }

            celdas.forEach((celda, index) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'celda-card-modal';
                card.style.background = '#28a745';
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
                    btnConfirmarAsignacion.disabled = false;
                    modalCeldaMsg.textContent = '';
                };
                celdasGrid.appendChild(card);

                if (index === 0) {
                    setTimeout(() => {
                        card.focus();
                    }, 100);
                }
            });
        }
        catch (error) {
            console.error('Error al cargar celdas disponibles:', error);
            celdasGrid.innerHTML = '<div style="text-align:center;color:#b94a48;grid-column:1/-1;">Error al cargar celdas.</div>';
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para celdas disponibles. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar celdas: ${error.message}`, 'danger');
            }
        }
    }

    async function cargarUsuariosParaSeleccion() {
        let res;
        try {
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
            allUsers = data.usuarios || [];

            UIElements.selectPropietario.innerHTML = '<option value="">Seleccione propietario</option>';
            allUsers.forEach(usuario => {
                const opt = document.createElement('option');
                opt.value = usuario.id_usuario;
                opt.textContent = `${usuario.primer_nombre} ${usuario.primer_apellido || ''} — ${usuario.numero_documento}`;
                UIElements.selectPropietario.appendChild(opt);
            });
        } catch (error) {
            console.error('Error loading users for selection:', error);
            UIElements.selectPropietario.innerHTML = '<option value="">Error al cargar propietarios</option>';
            if (dropdownSugerencias) dropdownSugerencias.style.display = 'none';
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al cargar propietarios. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar propietarios: ${error.message}`, 'danger');
            }
        }
    }

    async function cargarResumenCeldas() {
        const cont = document.getElementById('resumen-celdas');
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
            console.error('Error al cargar resumen de celdas:', error);
            cont.innerHTML = '<div class="text-center text-danger">Error al cargar resumen de celdas</div>';
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para resumen de celdas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar resumen de celdas: ${error.message}`, 'danger');
            }
        }
    }

    async function cargarResumenZonas() {
        const cont = document.getElementById('resumen-zonas');
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

            const zonas = Array.isArray(data) ? data : (data.zonas || []);

            if (!zonas.length) {
                cont.innerHTML = '<div class="text-center text-muted">Sin datos de zonas</div>';
                return;
            }
            cont.innerHTML = zonas.map(zona => `<div><b>${zona.nombre}:</b> ${zona.descripcion || 'N/A'}</div>`).join('');
        } catch (error) {
            console.error('Error al cargar resumen de zonas:', error);
            cont.innerHTML = '<div class="text-center text-danger">Error al cargar resumen de zonas</div>';
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor para resumen de zonas. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al cargar resumen de zonas: ${error.message}`, 'danger');
            }
        }
    }

    // Nueva función para mostrar el modal de confirmación de salida
    const mostrarModalSalidaExitosa = (placa, celdaNumero, zonaNombre, parqueaderoNombre) => {
        UIElements.placaSalidaConfirmacion.textContent = placa;
        UIElements.celdaSalidaConfirmacion.textContent = celdaNumero;
        UIElements.zonaSalidaConfirmacion.textContent = zonaNombre;
        UIElements.parqueaderoSalidaConfirmacion.textContent = parqueaderoNombre;
        UIElements.modalSalidaConfirmacion.classList.add('mostrar');
    };

    async function handleIngreso() {
        const placa = UIElements.placaInput.value.trim().toUpperCase();
        console.log(`DEBUG: Placa ingresada por el usuario: ${placa}`);
        if (!placa) {
            mostrarToast('Por favor, ingrese una placa.', 'warning');
            return;
        }

        let vehData;
        try {
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
                let isParked = false;
                try {
                    const resHist = await fetch(`${window.location.origin}/admin/vehiculo/historial-activo/${encodeURIComponent(placa)}`);
                    if (resHist.ok) {
                        isParked = true;
                        console.log(`DEBUG: Vehículo ${placa} encontrado con historial activo (200 OK).`);
                    } else if (resHist.status === 404) {
                        isParked = false;
                        console.log(`DEBUG: Vehículo ${placa} no tiene historial activo (404 Not Found, esperado).`);
                    } else {
                        const errorText = await resHist.text();
                        throw new Error(`Server responded with status ${resHist.status} for historial-activo: ${errorText}`);
                    }
                } catch (histError) {
                    console.error('Error de red o inesperado al verificar historial activo:', histError);
                    mostrarToast(`❌ Error de red al verificar historial: ${histError.message}`, 'danger');
                    return;
                }

                if (isParked) {
                    mostrarToast('⚠️ Este vehículo ya se encuentra parqueado. Por favor, déle salida primero.', 'warning');
                    return;
                } else {
                    UIElements.placaModalSpan.textContent = placa;
                    UIElements.modalAsignar.classList.add('mostrar');
                    await cargarParqueaderosZonasYCeldasDisponibles(placa, vehData.vehiculo.id);
                }
            } else {
                mostrarToast(`⚠️ El vehículo con placa ${placa} no está registrado. Por favor, regístrelo.`, 'warning');
                UIElements.placaRegistrarInput.value = placa;
                UIElements.placaRegistrarSpan.textContent = placa;
                UIElements.modalRegistro.classList.add('mostrar');
                UIElements.btnGuardarVehiculoRegistrar.disabled = true;
                selectedCellId = null;

                const parqueaderos = await cargarParqueaderosCache();
                UIElements.selectParqueaderoRegistro.innerHTML = '<option value="">Seleccione parqueadero</option>' + parqueaderos.map(p => `<option value="${p.id}">${p.nombre} (Capacidad: ${p.capacidad})</option>`).join('');
                if (UIElements.selectParqueaderoRegistro.options.length > 1) {
                    UIElements.selectParqueaderoRegistro.selectedIndex = 1;
                    await mostrarCeldasEnGrid(UIElements.gridCeldasModal, UIElements.selectParqueaderoRegistro.value, parqueaderos);
                }
                UIElements.selectParqueaderoRegistro.addEventListener('change', async () => {
                    await mostrarCeldasEnGrid(UIElements.gridCeldasModal, UIElements.selectParqueaderoRegistro.value, parqueaderos);
                });

                UIElements.collapseUsuario.classList.add('show');
                UIElements.btnAcordeonUsuario.setAttribute('aria-expanded', 'true');
                UIElements.collapseVehiculo.classList.remove('show');
                UIElements.btnAcordeonVehiculo.setAttribute('aria-expanded', 'false');
            }
        } catch (error) {
            console.error('Error al verificar vehículo o en la lógica de ingreso:', error);
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al verificar vehículo. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al verificar la placa: ${error.message}. Intente de nuevo.`, 'danger');
            }
        }
    }

    async function handleSalida() {
        const placa = UIElements.placaInput.value.trim().toUpperCase();
        if (!placa) {
            mostrarToast('Por favor, ingrese una placa.', 'warning');
            return;
        }

        showConfirmModal(`¿Dar salida al vehículo con placa ${placa}?`, async (confirmed) => {
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
                        mostrarModalSalidaExitosa(result.placa, result.celdaNumero, result.zonaNombre, result.parqueaderoNombre);
                        UIElements.placaInput.value = '';
                        UIElements.btnSalida.disabled = true;
                        // Refresh the cells grid in the registration modal if it's open
                        if (UIElements.modalRegistro.classList.contains('mostrar')) {
                            const parqueaderos = await cargarParqueaderosCache();
                            await mostrarCeldasEnGrid(UIElements.gridCeldasModal, UIElements.selectParqueaderoRegistro.value, parqueaderos);
                        }
                    } else {
                        mostrarToast(`⚠️ ${result.mensaje || 'Error al liberar celda'}`, 'danger');
                    }
                } catch (err) {
                    console.error('Error al liberar celda:', err);
                    if (err instanceof SyntaxError) {
                        mostrarToast(`❌ Error de formato de datos del servidor al liberar celda. Se esperaba JSON. (${err.message.substring(0, 100)}...)`, 'danger');
                    } else {
                        mostrarToast(`❌ Error inesperado al liberar celda: ${err.message}`, 'danger');
                    }
                }
            }
        });
    }

    async function handleConfirmarAsignacion() {
        if (!selectedCellId) {
            mostrarToast('Por favor, seleccione una celda.', 'warning');
            return;
        }

        const placa = UIElements.placaModalSpan.textContent;
        let vehiculoId = null;
        let resVeh;
        try {
            resVeh = await fetch(`${window.location.origin}/admin/vehiculo/existe?placa=${encodeURIComponent(placa)}`);
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
            } else {
                mostrarToast('Error: Vehículo no encontrado para la asignación.', 'danger');
                return;
            }
        } catch (error) {
            console.error('Error fetching vehicle ID:', error);
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al verificar vehículo. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al obtener ID de vehículo para asignación: ${error.message}`, 'danger');
            }
            return;
        }

        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/parquear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehiculo_id: vehiculoId,
                    celda_id: selectedCellId,
                    placa: placa
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
                mostrarToast(`✅ Vehículo con placa ${placa} ingresado correctamente en celda ${selectedCellId}.`);
                UIElements.modalAsignar.classList.remove('mostrar');
                UIElements.placaInput.value = '';
                UIElements.btnSalida.disabled = false;
                if (UIElements.modalRegistro.classList.contains('mostrar')) {
                    const parqueaderos = await cargarParqueaderosCache();
                    await mostrarCeldasEnGrid(UIElements.gridCeldasModal, UIElements.selectParqueaderoRegistro.value, parqueaderos);
                }
            } else {
                mostrarToast(`⚠️ ${parkResult.mensaje || 'Error al parquear vehículo'}`, 'danger');
            }
        } catch (error) {
            console.error('Error al parquear vehículo:', error);
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al parquear. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error inesperado al parquear vehículo: ${error.message}`, 'danger');
            }
        }
    }

    async function handleRegistroUsuario(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        userData.numero_documento = normalizeDocumento(userData.documento);
        userData.primer_nombre = normalizeTexto(userData.primer_nombre);
        userData.segundo_nombre = normalizeTexto(userData.segundo_nombre);
        userData.primer_apellido = normalizeTexto(userData.primer_apellido);
        userData.segundo_apellido = normalizeTexto(userData.segundo_apellido);
        userData.direccion_correo = normalizeCorreo(userData.correo);
        userData.numero_celular = normalizeDocumento(userData.celular);

        userData.tipo_documento = 'CC';
        userData.segundo_nombre = userData.segundo_nombre || null;
        userData.segundo_apellido = userData.segundo_apellido || null;
        userData.foto_perfil = userData.foto_perfil || null;
        userData.estado = 'activo';
        userData.clave = userData.clave || 'default_clave';
        userData.perfil_usuario_id = 3;

        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/usuario/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
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
                throw new SyntaxError(`Failed to parse JSON for user registration. Response may not be JSON: ${jsonError.message}`);
            }

            if (res.ok) {
                mostrarToast('✅ Propietario registrado exitosamente.');
                UIElements.selectPropietario.innerHTML = `<option value="${result.usuario.id_usuario}">${result.usuario.primer_nombre} ${result.usuario.primer_apellido} — ${result.usuario.numero_documento}</option>`;
                UIElements.selectPropietario.value = result.usuario.id_usuario;
                updateUserSummary(result.usuario);
                UIElements.collapseUsuario.classList.remove('show');
                UIElements.btnAcordeonUsuario.setAttribute('aria-expanded', 'false');
                UIElements.collapseVehiculo.classList.add('show');
                UIElements.btnAcordeonVehiculo.setAttribute('aria-expanded', 'true');
                UIElements.btnGuardarVehiculoRegistrar.disabled = selectedCellId === null;
            } else {
                mostrarToast(`⚠️ Error al registrar propietario: ${result.mensaje || 'Error desconocido'}`, 'danger');
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al registrar usuario. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error inesperado al registrar propietario: ${error.message}`, 'danger');
            }
        }
    }

    async function handleRegistroVehiculo(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const vehiculoData = Object.fromEntries(formData.entries());

        vehiculoData.placa = normalizePlaca(vehiculoData.placa);
        vehiculoData.usuario_id_usuario = UIElements.selectPropietario.value;

        if (!vehiculoData.usuario_id_usuario) {
            mostrarToast('Por favor, seleccione o registre un propietario para el vehículo.', 'warning');
            return;
        }

        let res;
        try {
            res = await fetch(`${window.location.origin}/admin/vehiculo/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehiculoData)
            });
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
                throw new SyntaxError(`Failed to parse JSON for vehicle registration. Response may not be JSON: ${jsonError.message}`);
            }

            if (res.ok) {
                mostrarToast('✅ Vehículo registrado exitosamente.');
                UIElements.modalRegistro.classList.remove('mostrar');
                UIElements.placaInput.value = result.vehiculo.placa;
                UIElements.btnSalida.disabled = false;
                if (selectedCellId) {
                    await handleConfirmarAsignacion();
                } else {
                    mostrarToast('Vehículo registrado, pero no se seleccionó una celda para asignar. Puede asignarla manualmente.', 'info');
                }
                UIElements.formRegistroUsuario.reset();
                UIElements.formRegistroVehiculo.reset();
                UIElements.resumenPropietario.style.display = 'none';
                UIElements.selectPropietario.innerHTML = '<option value="">Seleccione propietario</option>';
            } else {
                mostrarToast(`⚠️ Error al registrar vehículo: ${result.mensaje || 'Error desconocido'}`, 'danger');
            }
        } catch (error) {
            console.error('Error al registrar vehículo:', error);
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al registrar vehículo. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error inesperado al registrar vehículo: ${error.message}`, 'danger');
            }
        }
    }

    UIElements.btnIngreso.addEventListener('click', handleIngreso);
    UIElements.btnSalida.addEventListener('click', handleSalida);

    UIElements.btnCerrarModalRegistro.addEventListener('click', () => {
        UIElements.modalRegistro.classList.remove('mostrar');
        UIElements.formRegistroUsuario.reset();
        UIElements.formRegistroVehiculo.reset();
        UIElements.resumenPropietario.style.display = 'none';
        UIElements.selectPropietario.innerHTML = '<option value="">Seleccione propietario</option>';
        UIElements.placaInput.value = '';
        UIElements.btnSalida.disabled = true;
    });

    UIElements.btnCerrarModalAsignar.addEventListener('click', () => {
        UIElements.modalAsignar.classList.remove('mostrar');
        UIElements.placaInput.value = '';
        UIElements.btnSalida.disabled = true;
    });

    UIElements.btnConfirmarAsignacion.addEventListener('click', handleConfirmarAsignacion);

    UIElements.formRegistroUsuario.addEventListener('submit', handleRegistroUsuario);
    UIElements.formRegistroVehiculo.addEventListener('submit', handleRegistroVehiculo);

    UIElements.inputBuscarPropietario.addEventListener('input', async (e) => {
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

            if (!dropdownSugerencias) {
                dropdownSugerencias = document.createElement('div');
                dropdownSugerencias.className = 'dropdown-menu show';
                dropdownSugerencias.style.position = 'absolute';
                dropdownSugerencias.style.width = UIElements.inputBuscarPropietario.offsetWidth + 'px';
                UIElements.inputBuscarPropietario.parentNode.insertBefore(dropdownSugerencias, UIElements.inputBuscarPropietario.nextSibling);
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
                        UIElements.selectPropietario.innerHTML = `<option value="${usuario.id_usuario}">${usuario.primer_nombre} ${usuario.primer_apellido} — ${usuario.numero_documento}</option>`;
                        UIElements.selectPropietario.value = usuario.id_usuario;
                        updateUserSummary(usuario);
                        dropdownSugerencias.style.display = 'none';
                        UIElements.inputBuscarPropietario.value = '';
                        UIElements.btnGuardarVehiculoRegistrar.disabled = selectedCellId === null;
                    };
                    dropdownSugerencias.appendChild(item);
                });
                dropdownSugerencias.style.display = 'block';
            } else {
                dropdownSugerencias.style.display = 'none';
            }
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            if (dropdownSugerencias) dropdownSugerencias.style.display = 'none';
            if (error instanceof SyntaxError) {
                mostrarToast(`❌ Error de formato de datos del servidor al buscar usuarios. Se esperaba JSON. (${error.message.substring(0, 100)}...)`, 'danger');
            } else {
                mostrarToast(`❌ Error al buscar usuarios: ${error.message}`, 'danger');
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (dropdownSugerencias && !UIElements.inputBuscarPropietario.contains(e.target) && !dropdownSugerencias.contains(e.target)) {
            dropdownSugerencias.style.display = 'none';
        }
    });

    UIElements.confirmOkBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback(true);
        }
        UIElements.confirmModal.classList.remove('mostrar');
        confirmCallback = null;
    });

    UIElements.confirmCancelBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback(false);
        }
        UIElements.confirmModal.classList.remove('mostrar');
        confirmCallback = null;
    });

    UIElements.btnCerrarModalSalidaConfirmacion.addEventListener('click', () => {
        UIElements.modalSalidaConfirmacion.classList.remove('mostrar');
    });

    cargarResumenCeldas();
    cargarResumenZonas();
    cargarUsuariosParaSeleccion();
    initAcordeon();
});
