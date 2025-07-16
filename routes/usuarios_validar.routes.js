const express = require('express');
const router = express.Router();
const supabase = require('../../supabaseClient'); // Ajustá la ruta si cambia

// 🔎 Validar duplicados de documento y correo
router.get('/validar', async (req, res) => {
  const { numero_documento, direccion_correo, id_usuario } = req.query;

  if (!numero_documento && !direccion_correo) {
    return res.status(400).json({ error: 'Faltan parámetros de validación' });
  }

  const [documentoResult, correoResult] = await Promise.all([
    numero_documento
      ? supabase
          .from('usuario')
          .select('id_usuario')
          .eq('numero_documento', numero_documento)
          .neq('id_usuario', Number(id_usuario)) // excluye al mismo usuario si estamos editando
          .maybeSingle()
      : Promise.resolve({ data: null }),

    direccion_correo
      ? supabase
          .from('usuario')
          .select('id_usuario')
          .eq('direccion_correo', direccion_correo)
          .neq('id_usuario', Number(id_usuario))
          .maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  if (documentoResult.error || correoResult.error) {
    return res.status(500).json({
      error: 'Error consultando existencia',
      detalle: documentoResult.error?.message || correoResult.error?.message
    });
  }

  res.status(200).json({
    documentoExiste: !!documentoResult.data,
    correoExiste: !!correoResult.data
  });
});

module.exports = router;
