var express = require('express');
var router = express.Router();
const { authenticate, redirectIfAuthenticated } = require('../middleware/auth');

/* GET home page. */
router.get('/', redirectIfAuthenticated, function (req, res, next) {
  res.render('index', { title: 'Gestión del Tiempo', user: req.user });
});

// Ruta para el dashboard (requiere autenticación)
router.get('/dashboard', authenticate, (req, res) => {
  res.render('dashboard', { user: req.user });
});

module.exports = router;