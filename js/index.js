let intervalo;

function obtenerContenedor() {
    const contenedor = document.getElementById('contenedor-parqueaderos');
    if (!contenedor) {
        console.warn('⚠️ El elemento con ID "contenedor-parqueaderos" no se encontró en el DOM. Las actualizaciones se detendrán.');
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
        }
    }
    return contenedor;
}

async function cargarCeldas() {
    const contenedor = obtenerContenedor();
    if (!contenedor) {
        return;
    }

    try {
        const res = await fetch('/api/celdas/disponibilidad');

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Error desconocido al procesar la respuesta del servidor.' }));
            throw new Error(`Error en la respuesta del servidor: ${res.status} ${res.statusText} - ${errorData.message || 'Error al obtener datos.'}`);
        }

        const parqueaderos = await res.json();

        contenedor.innerHTML = '';

        if (!parqueaderos || typeof parqueaderos !== 'object' || Object.keys(parqueaderos).length === 0) {
            contenedor.innerHTML = '<p style="color: grey; text-align: center;">No hay datos de disponibilidad para mostrar o los datos recibidos son inválidos.</p>';
            return;
        }

        Object.entries(parqueaderos).forEach(([parqueaderoId, zonas]) => {
            const bloqueParqueadero = document.createElement('div');
            bloqueParqueadero.className = 'bloque-parqueadero';

            const tituloParqueadero = document.createElement('h3');
            tituloParqueadero.textContent = `Parqueadero ${parqueaderoId}`;
            bloqueParqueadero.appendChild(tituloParqueadero);

            Object.entries(zonas).forEach(([zonaId, celdas]) => {
                const bloqueZona = document.createElement('div');
                bloqueZona.className = 'bloque-zona';

                const tituloZona = document.createElement('h4');
                tituloZona.textContent = `Zona ${zonaId}`;
                bloqueZona.appendChild(tituloZona);

                const grid = document.createElement('div');
                grid.className = 'grid-celdas';

                celdas.forEach(celda => {
                    const celdaDiv = document.createElement('div');
                    celdaDiv.classList.add('celda', celda.estado);
                    celdaDiv.textContent = `#${celda.id_celda}`;
                    grid.appendChild(celdaDiv);
                });

                bloqueZona.appendChild(grid);
                bloqueParqueadero.appendChild(bloqueZona);
            });

            contenedor.appendChild(bloqueParqueadero);
        });
    } catch (error) {
        console.error('💥 Error al cargar la disponibilidad de celdas:', error);
        contenedor.innerHTML = '<p style="color:red; text-align: center;">No se pudo obtener la disponibilidad de parqueo. Inténtelo de nuevo más tarde.</p>';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    cargarCeldas();
    intervalo = setInterval(cargarCeldas, 10000);
});