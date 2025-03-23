var express = require('express');
var router = express.Router();
var usersController = require("../controllers/users.c");
const { authenticate, authorize } = require('../middleware/auth');

/* POST registrar usuarios */
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await usersController.register(req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/users/new'
      });
    }
    res.status(201).render('message', {
      message: 'Éxito',
      messageType: 'success',
      details: 'Usuario creado con éxito.',
      redirectUrl: '/users'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al registrar el usuario: ${error.message}`,
      redirectUrl: '/users/new'
    });
  }
});

/* GET mostrar formulario de creación de usuario */
router.get('/new', authenticate, authorize(['admin']), (req, res) => {
  res.render('users/new', { user: req.user });
});

// Rutas protegidas para administradores
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await usersController.show();
    res.status(200).render('users/index', { users, user: req.user });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al listar usuarios: ${err}`,
      redirectUrl: '/dashboard'
    });
  }
});

/* GET mostrar usuario por id */
router.get('/:id', async (req, res) => {
  try {
    const user = await usersController.showByID(req.params.id);
    if (!user) {
      return res.status(404).send(`No se encontró el usuario con id: ${req.params.id}`);
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(`Error al buscar usuario: ${err}`);
  }
});

/* GET mostrar usuario por username */
router.get('/username/:username', async (req, res) => {
  try {
    const user = await usersController.showByUsername(req.params.username);
    if (!user) {
      return res.status(404).send(`No se encontró el usuario con username: ${req.params.username}`);
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(`Error al buscar usuario: ${err}`);
  }
});

/* PUT editar usuario */
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await usersController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: `/users/${req.params.id}/edit`
      });
    }
    res.status(200).render('message', {
      message: 'Éxito',
      messageType: 'success',
      details: 'Usuario actualizado con éxito.',
      redirectUrl: '/users'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al actualizar el usuario: ${error.message}`,
      redirectUrl: `/users/${req.params.id}/edit`
    });
  }
});

// Ruta para mostrar el formulario de edición de un usuario
router.get('/:id/edit', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const user = await usersController.showByID(req.params.id);
    if (!user) {
      return res.status(404).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Usuario no encontrado.',
        redirectUrl: '/users'
      });
    }
    res.render('users/edit', { user, currentUser: req.user });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al cargar el formulario de edición: ${error.message}`,
      redirectUrl: '/users'
    });
  }
});
/* DELETE eliminar usuario */
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await usersController.delete(req.params.id);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/users'
      });
    }
    res.status(200).render('message', {
      message: 'Éxito',
      messageType: 'success',
      details: 'Usuario eliminado con éxito.',
      redirectUrl: '/users'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al eliminar el usuario: ${error.message}`,
      redirectUrl: '/users'
    });
  }
});

// Relacionar un proyecto con un usuario
router.post('/:userId/projects/:projectId', async (req, res) => {
  try {
    const result = await usersController.addProjectToUser(req.params.userId, req.params.projectId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(201).send("Proyecto relacionado con el usuario");
  } catch (err) {
    res.status(500).send(`Error al relacionar proyecto con usuario: ${err}`);
  }
});

// Relacionar un hábito con un usuario
router.post('/:userId/habits/:habitId', async (req, res) => {
  try {
    const result = await usersController.addHabitToUser(req.params.userId, req.params.habitId);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/habits'
      });
    }
    res.status(201).render('message', {
      message: 'Hábito agregado',
      messageType: 'success',
      details: `El hábito ha sido agregado a tu lista de hábitos.`,
      redirectUrl: '/habits'
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al agregar el hábito: ${err}`,
      redirectUrl: '/habits'
    });
  }
});

// Obtener los hábitos de un usuario
router.get('/:userId/habits', async (req, res) => {
  try {
    const habits = await usersController.getUserHabits(req.params.userId);
    res.status(200).render('users/habits', { userHabits: habits, userId: req.params.userId });
  } catch (err) {
    res.status(500).send(`Error al obtener hábitos del usuario: ${err}`);
  }
});

// Obtener los proyectos de un usuario
router.get('/:userId/projects', async (req, res) => {
  try {
    const projects = await usersController.getUserProjects(req.params.userId);
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send(`Error al obtener proyectos del usuario: ${err}`);
  }
});

// Obtener los hábitos de un usuario
router.get('/:userId/habits', async (req, res) => {
  try {
    const habits = await usersController.getUserHabits(req.params.userId);
    res.status(200).send(habits);
  } catch (err) {
    res.status(500).send(`Error al obtener hábitos del usuario: ${err}`);
  }
});

// Eliminar la relación entre un proyecto y un usuario
router.delete('/projects/:relationId', async (req, res) => {
  try {
    const result = await usersController.removeProjectFromUser(req.params.relationId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Relación entre proyecto y usuario eliminada");
  } catch (err) {
    res.status(500).send(`Error al eliminar relación entre proyecto y usuario: ${err}`);
  }
});

// Eliminar la relación entre un hábito y un usuario
router.delete('/habits/:relationId', authenticate, async (req, res) => {
  try {
    const result = await usersController.removeHabitFromUser(req.params.relationId);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: `/users/${req.user.id}/habits` // Redirigir a la lista de hábitos del usuario
      });
    }
    res.status(200).render('message', {
      message: 'Hábito eliminado',
      messageType: 'success',
      details: `El hábito ha sido eliminado de tu lista de hábitos.`,
      redirectUrl: `/users/${req.user.id}/habits` // Redirigir a la lista de hábitos del usuario
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al eliminar el hábito: ${err}`,
      redirectUrl: `/users/${req.user.id}/habits` // Redirigir a la lista de hábitos del usuario
    });
  }
});

module.exports = router;