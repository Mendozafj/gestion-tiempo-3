// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.c');
const usersController = require('../controllers/users.c');
const { authenticate, authorize, redirectIfAuthenticated } = require('../middleware/auth');

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
    res.redirect('/dashboard'); // Redirigir al inicio después del login exitoso
  } catch (error) {
    let messageType = 'error';
    let message = 'Error interno del servidor';

    if (error.message === 'Usuario y contraseña son requeridos') {
      message = 'Por favor, ingresa tu nombre de usuario y contraseña.';

    } if (error.message === 'Credenciales inválidas') {
      message = 'Nombre de usuario o contraseña incorrectos.';
    }

    res.render('auth/login', { message, messageType });
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

router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  res.send("Ruta de prueba: Acceso permitido")
});

module.exports = router;