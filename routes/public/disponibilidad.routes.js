const express = require('express');
const Celda = require('../../model/Celda');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const celdas = await Celda.findAll({});

        const agrupado = {};

        for (const celda of celdas) {
            const nombreParqueadero = celda.parqueadero_nombre || 'Parqueadero sin nombre';
            const nombreZona = celda.zona_nombre || 'Zona sin nombre';

            if (!agrupado[nombreParqueadero]) {
                agrupado[nombreParqueadero] = {};
            }

            if (!agrupado[nombreParqueadero][nombreZona]) {
                agrupado[nombreParqueadero][nombreZona] = [];
            }

            agrupado[nombreParqueadero][nombreZona].push(celda.toJSON());
        }

        res.render('index', { disponibilidad: agrupado });

    } catch (error) {
        console.error('💥 Error al cargar la página principal con disponibilidad:', error.message);
        res.render('index', { 
            disponibilidad: {}, 
            error: 'No se pudo cargar la disponibilidad en este momento.' 
        });
    }
});

router.get('/disponibilidad', async (req, res) => {
    try {
        const celdas = await Celda.findAll({});

        const agrupado = {};

        for (const celda of celdas) {
            const nombreParqueadero = celda.parqueadero_nombre || 'Parqueadero sin nombre';
            const nombreZona = celda.zona_nombre || 'Zona sin nombre';

            if (!agrupado[nombreParqueadero]) {
                agrupado[nombreParqueadero] = {};
            }

            if (!agrupado[nombreParqueadero][nombreZona]) {
                agrupado[nombreParqueadero][nombreZona] = [];
            }

            agrupado[nombreParqueadero][nombreZona].push(celda.toJSON());
        }

        res.json(agrupado);
    } catch (error) {
        console.error('💥 Error al obtener disponibilidad agrupada:', error.message);
        res.status(500).json({
            message: 'No se pudo cargar la disponibilidad',
            error: error.message
        });
    }
});

module.exports = router;