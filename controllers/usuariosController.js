const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handler/email');

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear Cuenta en Uptask'
    })
}

exports.crearCuenta = async (req, res) => {
    // Leer los datos
    const {email, password} = req.body;

    try {
        // crear el usuario
        await Usuarios.create({
            email,
            password
        });

        // crear url confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        // crear obj de usuario para el handler de email
        const usuario = {
            email
        }

        // enviar email
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta Uptask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        })

        //redirigir al usuario
        req.flash('correcto', 'Enviamos un correo, revisa tu cuenta')
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina: 'Crear Cuenta en Uptask',
            email,
            password
        })
    }
}

exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({where: {email: req.params.email}});

    if(!usuario){
        req.flash('error', 'No Válido');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion')
}

exports.formIniciarSesion = async (req, res) => {
    const { error } = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina: 'Iniciar Sesión en Uptask',
        error
    })
}