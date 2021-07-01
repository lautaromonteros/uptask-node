const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Referencia al modelo en donde vamos a autentincar
const Usuarios = require('../models/Usuarios');

// Local strategy - Login con credenciales propias
passport.use(
    new LocalStrategy(
        // por default passport espera un usuario y password
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: {
                        email,
                        activo: 1
                    }
                });
                // Usuario existente, pass incorrecto
                if(!usuario.verificarPassword(password)) {
                    return done(null, false, {
                        message: 'El password es incorrecto'
                    })
                }
                // Email y pass correcto
                return done(null, usuario);
            } catch (error) {
                // Usuario no existe
                return done(null, false, {
                    message: 'Esa cuenta no existe'
                })
            }
        }
    )
);

// Serializar el user
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
})

// deserealizar user
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
})

module.exports = passport;