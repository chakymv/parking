const express = require('express');
const router = express.Router();
const Usuarios = require('../../model/usuario/Usuarios');
const catchAsync = require('../../utils/catchAsync');

router.get('/iniciar-sesion', (req, res) => {
    const registroExitoso = req.query.registroExitoso === 'true';
    res.render('usuario/iniciar_sesion', { error: null, registroExitoso });
});

router.post('/login', catchAsync(async (req, res) => {
    console.log('Contenido de req.body en /usuario/login POST:', req.body);

    const { correo, contrasena } = req.body;

    try {
        const usuario = await Usuarios.login(correo, contrasena); 
        
        req.session.userId = usuario.id; 
        req.session.username = usuario.primer_nombre;
        req.session.perfil = usuario.perfil; 

        res.redirect('/');
    } catch (error) {
        res.render('usuario/iniciar_sesion', { error: error.message, registroExitoso: false });
    }
}));

module.exports = router;
