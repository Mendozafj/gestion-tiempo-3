// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.c');
const usersController = require('../controllers/users.c');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Ruta para mostrar el formulario de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', { message: null, messageType: null });
});

// Ruta para mostrar el formulario de registro
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('auth/register', { message: null, messageType: null });
});

// Ruta para procesar el formulario de login
router.post('/login', async (req, res) => {
  try {
    const result = await authController.login(req, res);

    // Si el login es exitoso, redirigir al dashboard
    res.redirect('/dashboard');
  } catch (error) {
    let messageType = 'error';
    let message = 'Error interno del servidor';

    // Personalizar mensajes de error según el tipo de error
    if (error && error.message) {
      message = error.message;
    }

    // Renderizar la vista de login con el mensaje de error
    res.render('auth/login', {
      message,
      messageType,
      username: req.body.username // Mantener el nombre de usuario ingresado
    });
  }
});

// Ruta para procesar el formulario de registro
router.post('/register', async (req, res) => {
  try {
    const result = await usersController.register(req.body);

    if (result.error) {
      // Si hay un error, mostrar el mensaje en la vista
      return res.render('auth/register', {
        message: result.error,
        messageType: 'error',
      });
    }

    // Si el registro es exitoso, redirigir al login
    res.redirect('/auth/login');
  } catch (error) {
    // Manejar errores inesperados
    res.render('auth/register', {
      message: 'Error interno del servidor.',
      messageType: 'error',
    });
  }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  // Eliminar la cookie 'token'
  res.clearCookie('token');

  // Redirigir al usuario a la página de inicio de sesión
  res.redirect('/auth/login');
});

module.exports = router;