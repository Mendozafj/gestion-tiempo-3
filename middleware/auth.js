const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.cookies.token; // Obtener el token de la cookie

  if (!token) {
    return res.redirect('/auth/login'); // Redirigir al login si no hay token
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntar el usuario decodificado a la solicitud
    next();
  } catch (error) {
    res.redirect('/auth/login'); // Redirigir al login si el token es inválido
  }
}

function redirectIfAuthenticated(req, res, next) {
  const token = req.cookies.token; // Obtener el token de la cookie

  if (token) {
    // Si el usuario está autenticado, redirigir al dashboard
    return res.redirect('/dashboard');
  }

  // Si el usuario no está autenticado, continuar con la siguiente función
  next();
}

function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso prohibido' });
    }
    next();
  };
}

module.exports = { authenticate, authorize, redirectIfAuthenticated };