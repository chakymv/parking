const express = require('express');
const router = express.Router();
const Usuarios = require('../../model/usuario/Usuarios');
const catchAsync = require('../../utils/catchAsync');


router.get('/registro', (req, res) => { 
    res.render('usuario/registrarse'); 
});


router.post('/registro', catchAsync(async (req, res) => { 
    try {
        await Usuarios.crear(req.body);
        res.redirect('/usuario/iniciar-sesion?registroExitoso=true'); 
    } catch (error) {
        res.render('usuario/registrarse', { error: error.message });
    }
}));

module.exports = router;