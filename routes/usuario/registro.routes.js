const express = require('express');
const router = express.Router();
const Usuarios = require('../../model/usuario/Usuarios');
const catchAsync = require('../../utils/catchAsync');

router.get('/', (req, res) => {
    res.render('usuario/registro'); 
});

router.post('/', catchAsync(async (req, res) => {
    try {
        await Usuarios.crear(req.body);
        res.redirect('/usuario/iniciar-sesion?registroExitoso=true'); 
    } catch (error) {
        res.render('usuario/registro', { error: error.message });
    }
}));

module.exports = router;