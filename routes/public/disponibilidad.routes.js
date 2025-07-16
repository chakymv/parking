const express = require('express');
const router = express.Router();
const supabase = require('../../supabaseClient');

// Ruta pública para consultar disponibilidad de parqueaderos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('celda')
      .select('id, estado, tipo') // Puedes ajustar campos según lo que necesites mostrar

    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'No se pudo obtener la disponibilidad.' });
  }
});

module.exports = router;
