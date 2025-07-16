async function cargarCeldas() {
  const res = await fetch('/api/celdas/disponibilidad');
  const celdas = await res.json();

  const contenedor = document.getElementById('listaCeldas');
  contenedor.innerHTML = '';

  celdas.forEach(celda => {
    const estado = celda.estado;
    const div = document.createElement('div');
    div.className = `celda ${estado}`;
    div.textContent = `Celda ${celda.id} - ${estado}`;
    contenedor.appendChild(div);
  });
}

setInterval(cargarCeldas, 5000); 
