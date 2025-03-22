const jwt = require('jsonwebtoken');
const usersModel = require('../models/users.m');

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;

    // Validar datos de entrada
    if (!username || !password) {
      throw new Error('Usuario y contraseña son requeridos');
    }

    // Verificar credenciales
    const user = await usersModel.verifyPassword(username, password);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Configurar la cookie con el token
    res.cookie('token', token, {
      httpOnly: true, // La cookie no es accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo enviar la cookie sobre HTTPS en producción
      maxAge: 3600000, // Tiempo de expiración de la cookie (1 hora)
      sameSite: 'strict', // Prevenir ataques CSRF
    });

    // Devolver una respuesta exitosa
    return { message: 'Inicio de sesión exitoso', token: token };
  }
}

module.exports = new AuthController();