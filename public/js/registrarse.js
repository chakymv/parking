document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.onsubmit = async function (e) {
    e.preventDefault();

    const payload = {
      tipo_documento: document.getElementById('tipo_documento').value,
      numero_documento: document.getElementById('numero_documento').value.trim(),
      primer_nombre: document.getElementById('primer_nombre').value.trim(),
      segundo_nombre: document.getElementById('segundo_nombre').value.trim(),
      primer_apellido: document.getElementById('primer_apellido').value.trim(),
      segundo_apellido: document.getElementById('segundo_apellido').value.trim(),
      direccion_correo: document.getElementById('direccion_correo').value.trim(),
      numero_celular: document.getElementById('numero_celular').value.trim(),
      clave: document.getElementById('clave').value,
      perfil_usuario_id: document.getElementById('perfil_usuario_id').value
    };

    // Validación básica
    if (!payload.tipo_documento || !payload.numero_documento || !payload.primer_nombre ||
        !payload.primer_apellido || !payload.direccion_correo || !payload.numero_celular ||
        !payload.clave || !payload.perfil_usuario_id) {
      alert('Completa todos los campos obligatorios.');
      return;
    }

    try {
      const res = await fetch('/api/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Usuario registrado correctamente.');
        window.location.href = '/iniciar-sesion';
      } else {
        alert(data.error || 'No se pudo registrar el usuario.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
    }
  };
});
