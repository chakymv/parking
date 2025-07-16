document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const correoInput = document.getElementById('correo');
  const claveInput = document.getElementById('clave');

  form.onsubmit = async function (e) {
    e.preventDefault();

    const direccion_correo = correoInput.value.trim();
    const clave = claveInput.value;

    if (!direccion_correo || !clave) {
      alert('Por favor completa ambos campos.');
      return;
    }

    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direccion_correo, clave })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Bienvenido ${data.primer_nombre || ''}`);
        window.location.href = '/usuario/dashboard'; // Ajusta la ruta si usas otra
      } else {
        alert(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };
});
