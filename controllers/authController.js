const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const enviarEmail = require('../handler/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//fn para revisar que se logueo el user
exports.usuarioAutenticado = (req, res, next) => {

    // si esta autenticado
    if(req.isAuthenticated()){
        return next();
    }

    // sino redirigir al login
    return res.redirect('/iniciar-sesion');

}

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); // al cerrar sesion nos lleva al login
    })
}

exports.formReset = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer tu contraseña'
    })
}

exports.enviarToken = async (req, res) => {
    const {email} = req.body;

    const usuario = await Usuarios.findOne({where: {email}});

    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        res.redirect('reestablecer');
    }

    // Generando token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;

    // guardarlos en bd
    await usuario.save();

    // url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reestablecer-pass'
    })

    req.flash('correcto', 'Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');

}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    })

    if(!usuario){
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    // form para generar pass
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer contraseña'
    })
}

exports.actualizarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    })

    if(!usuario){
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    // guardar nuevo pass
    await usuario.save();
    req.flash('correcto', 'Tu password se modificó correctamente');
    res.redirect('/iniciar-sesion');

}