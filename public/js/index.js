let intervalo;

function obtenerContenedor() {
    const contenedor = document.getElementById('contenedor-parqueaderos');
    if (!contenedor) {
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
        }
    }
    return contenedor;
}

async function cargarCeldas() {
    const contenedor = obtenerContenedor();
    if (!contenedor) return;

    try {
        const res = await fetch('/api/celdas/disponibilidad');

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({
                message: 'Error desconocido al procesar la respuesta del servidor.'
            }));
            throw new Error(`Error en la respuesta del servidor: ${res.status} ${res.statusText} - ${errorData.message || 'Error al obtener datos.'}`);
        }

        const parqueaderos = await res.json();
        contenedor.innerHTML = '';

        if (!parqueaderos || typeof parqueaderos !== 'object' || Object.keys(parqueaderos).length === 0) {
            contenedor.innerHTML = '<p style="color: grey; text-align: center;">No hay datos de disponibilidad para mostrar o los datos recibidos son inválidos.</p>';
            return;
        }

        Object.entries(parqueaderos).forEach(([nombreParqueadero, zonas]) => {
            const bloqueParqueadero = document.createElement('div');
            bloqueParqueadero.className = 'bloque-parqueadero';

            const tituloParqueadero = document.createElement('h3');
            tituloParqueadero.textContent = nombreParqueadero;
            bloqueParqueadero.appendChild(tituloParqueadero);

            Object.entries(zonas).forEach(([nombreZona, celdas]) => {
                const bloqueZona = document.createElement('div');
                bloqueZona.className = 'bloque-zona';

                const tituloZona = document.createElement('h4');
                tituloZona.textContent = nombreZona;
                bloqueZona.appendChild(tituloZona);

                const grid = document.createElement('div');
                grid.className = 'grid-celdas';

                celdas.forEach(celda => {
                    const estadoValido = ['libre', 'ocupada', 'mantenimiento', 'reservada'].includes(celda.estado);
                    const estadoClase = estadoValido ? celda.estado : 'estado-desconocido';

                    const celdaDiv = document.createElement('div');
                    celdaDiv.classList.add('celda', estadoClase);

                    const numero = celda.numero || celda.id_celda;
                    celdaDiv.textContent = `Celda ${numero} — ${celda.estado}`;

                    grid.appendChild(celdaDiv);
                });

                bloqueZona.appendChild(grid);
                bloqueParqueadero.appendChild(bloqueZona);
            });

            contenedor.appendChild(bloqueParqueadero);
        });
    } catch (error) {
        const contenedorDeError = obtenerContenedor();
        if (contenedorDeError) {
             contenedorDeError.innerHTML = '<p style="color:red; text-align: center;">No se pudo obtener la disponibilidad de parqueo. Inténtelo de nuevo más tarde.</p>';
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    cargarCeldas();
    intervalo = setInterval(cargarCeldas, 10000);
});