document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');
    const messageBox = document.createElement('div'); 
    messageBox.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        display: none; /* Oculto por defecto */
    `;
    document.body.appendChild(messageBox);

    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.style.backgroundColor = isError ? '#dc3545' : '#28a745'; // Rojo para error, verde para éxito
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 3000); // Ocultar después de 3 segundos
    }

    if (form) { // Asegurarse de que el formulario exista
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
                showMessage('Completa todos los campos obligatorios.', true);
                return;
            }

            try {
                const res = await fetch('/usuario', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok) {
                    showMessage('Usuario registrado correctamente.', false);
                    setTimeout(() => {
                        window.location.href = '/usuario/iniciar-sesion?registroExitoso=true';
                    }, 1500);
                } else {
                    showMessage(data.error || 'No se pudo registrar el usuario.', true);
                }
            } catch (err) {
                console.error(err);
                showMessage('Error de conexión con el servidor.', true);
            }
        };
    } else {
        console.error("El formulario con ID 'registroForm' no fue encontrado.");
    }
});
