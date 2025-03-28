var express = require('express');
var router = express.Router();
var habitsController = require("../controllers/habits.c");
var activitiesController = require("../controllers/activities.c");
var activityLogsController = require("../controllers/activity_logs.c");
const { authenticate, authorize } = require('../middleware/auth');

/* POST registrar hábitos */
router.post('/', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const result = await habitsController.register(req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/habits'
      });
    }
    res.status(201).render('message', {
      message: 'Hábito creado',
      messageType: 'success',
      details: `El hábito "${req.body.name}" ha sido creado exitosamente.`,
      redirectUrl: '/habits'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo crear el hábito: ${error.message}`,
      redirectUrl: '/habits'
    });
  }
});

/* GET mostrar hábitos. */
router.get('/', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const habits = await habitsController.show();
    res.status(200).render('habits/habits', { habits, user: req.user });  // Renderiza la vista 'habits.ejs'
  } catch (err) {
    res.status(500).send(`Error al listar hábitos: ${err}`);
  }
});

// Obtener los hábitos de un usuario
router.get('/:userId/habits', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const habits = await usersController.getUserHabits(req.params.userId);
    res.status(200).render('users/habits', { userHabits: habits, user: req.user });
  } catch (err) {
    res.status(500).send(`Error al obtener hábitos del usuario: ${err}`);
  }
});

// Mostrar formulario para crear un nuevo hábito
router.get('/new', authenticate, authorize(['admin', 'user']), (req, res) => {
  res.render('habits/new');
});

// Mostrar formulario para editar un hábito
router.get('/:id/edit', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const habit = await habitsController.showByID(req.params.id);
    if (!habit) {
      return res.status(404).send("Hábito no encontrado");
    }
    res.render('habits/edit', { habit });
  } catch (err) {
    res.status(500).send(`Error al obtener el hábito: ${err}`);
  }
});

// Mostrar los hábitos que no tienen actividades realizadas
router.get('/habits-without-activities', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const habits = await habitsController.getHabitsWithoutActivities();
    res.status(200).render('habits/habits-without-activities', {
      habits: habits,
      user: req.user
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener hábitos sin actividades realizadas: ${err.message}`,
      redirectUrl: '/habits'
    });
  }
});

/* GET mostrar hábito por id */
router.get('/:id', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const habit = await habitsController.showByID(req.params.id);
    if (!habit) {
      return res.status(404).send("Hábito no encontrado");
    }

    const activities = await habitsController.getActivities(req.params.id);
    res.render('habits/details', { habit, activities, user: req.user });
  } catch (error) {
    res.status(500).send(`Error al mostrar los detalles del hábito: ${error.message}`);
  }
});

/* PUT editar hábito */
router.put('/:id', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const result = await habitsController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/habits'
      });
    }
    res.status(200).render('message', {
      message: 'Hábito editado',
      messageType: 'success',
      details: `El hábito "${req.body.name}" ha sido actualizado exitosamente.`,
      redirectUrl: '/habits'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo editar el hábito: ${error.message}`,
      redirectUrl: '/habits'
    });
  }
});

/* DELETE eliminar hábito */
router.delete('/:id', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const result = await habitsController.delete(req.params.id);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/habits'
      });
    }
    res.status(200).render('message', {
      message: 'Hábito eliminado',
      messageType: 'success',
      details: `El hábito ha sido eliminado exitosamente.`,
      redirectUrl: '/habits'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo eliminar el hábito: ${error.message}`,
      redirectUrl: '/habits'
    });
  }
});

/* POST agregar actividad a hábito */
router.post('/:habitId/activities', authenticate, authorize(['admin', 'user']), async (req, res) => {
  const { activityId } = req.body;
  const { habitId } = req.params;

  try {
    const result = await habitsController.addActivity(habitId, activityId);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: `/habits/${habitId}/add-activity` // Redirigir de vuelta al formulario
      });
    }

    res.status(201).render('message', {
      message: 'Éxito',
      messageType: 'success',
      details: 'Actividad agregada al hábito con éxito.',
      redirectUrl: `/habits/${habitId}` // Redirigir de vuelta a los detalles del hábito
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al agregar actividad al hábito: ${error.message}`,
      redirectUrl: `/habits/${habitId}/add-activity` // Redirigir de vuelta al formulario
    });
  }
});

// Mostrar formulario para agregar actividad a un hábito
router.get('/:id/add-activity', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const habit = await habitsController.showByID(req.params.id);
    const activities = await activitiesController.show(); // Asegúrate de tener un método para obtener todas las actividades
    res.render('habits/add-activity', { habit, activities });
  } catch (error) {
    res.status(500).send(`Error al mostrar el formulario: ${error.message}`);
  }
});

/* DELETE eliminar actividad de hábito */
router.delete('/:habitId/activities/:relationId', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const result = await habitsController.removeActivity(req.params.relationId);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: `/habits/${req.params.habitId}` // Redirigir de vuelta a los detalles del hábito
      });
    }
    res.status(200).render('message', {
      message: 'Éxito',
      messageType: 'success',
      details: 'Actividad eliminada del hábito con éxito.',
      redirectUrl: `/habits/${req.params.habitId}` // Redirigir de vuelta a los detalles del hábito
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: 'Error al eliminar actividad del hábito.',
      redirectUrl: `/habits/${req.params.habitId}` // Redirigir de vuelta a los detalles del hábito
    });
  }
});

/* GET mostrar actividades de hábito */
router.get('/:habitId/activities', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const activities = await habitsController.getActivities(req.params.habitId);
    res.status(200).send(activities);
  } catch (err) {
    res.status(500).send(`Error al mostrar actividades: ${err}`);
  }
});

/* GET mostrar actividades de hábito por rango de fecha */
router.get('/:habitId/activities-by-date', authenticate, authorize(['admin', 'user']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Obtener las fechas del query string
    const habit = await habitsController.showByID(req.params.habitId);

    if (!habit) {
      return res.status(404).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Hábito no encontrado.',
        redirectUrl: '/habits'
      });
    }

    const activities = await activityLogsController.getActivitiesByHabitAndDateRange(
      req.params.habitId,
      startDate,
      endDate
    );

    res.status(200).render('habits/activities-by-date', {
      habit: habit,
      activities: activities,
      startDate: startDate,
      endDate: endDate
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener actividades por hábito y rango de fecha: ${err.message}`,
      redirectUrl: `/habits/${req.params.habitId}`
    });
  }
});

module.exports = router;