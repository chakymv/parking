document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-parqueadero');
  const msg = document.getElementById('form-msg');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.innerText = '';

    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/parqueaderos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        let texto = 'Error al registrar parqueadero.';
        try {
          const json = await res.clone().json();
          texto = json.error || texto;
        } catch {
          texto = await res.text();
        }
        throw new Error(texto);
      }

      form.reset();
      msg.style.color = 'green';
      msg.innerText = 'Parqueadero registrado correctamente ✅';
    } catch (error) {
      msg.style.color = 'red';
      msg.innerText = error.message;
    }
  });
});
