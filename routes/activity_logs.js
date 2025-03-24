var express = require('express');
var router = express.Router();
var activityLogsController = require("../controllers/activity_logs.c");
var activitiesController = require("../controllers/activities.c");

/* POST registrar un registro de actividad */
router.post('/', async (req, res) => {
  try {
    const result = await activityLogsController.register(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    return res.status(201).send("Registro de actividad creado");
  } catch (error) {
    res.status(500).send("Error al registrar el registro de actividad");
  }
});

/* GET mostrar todos los registros de actividad */
router.get('/', async (req, res) => {
  try {
    const activityLogs = await activityLogsController.show();
    res.status(200).send(activityLogs);
  } catch (err) {
    res.status(500).send(`Error al listar registros de actividad: ${err}`);
  }
});

// Mostrar actividades abiertas (sin fecha de finalización)
router.get('/open-activities', async (req, res) => {
  try {
    const openActivities = await activityLogsController.getOpenActivities();

    // Obtener todas las actividades para mostrarlas junto con las actividades abiertas
    const activities = await activitiesController.show();

    res.status(200).render('activities/open-activities', {
      activities: activities,
      openActivities: openActivities,
      user: req.user
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener actividades abiertas: ${err.message}`,
      redirectUrl: '/activities'
    });
  }
});

/* GET mostrar un registro de actividad por su ID */
router.get('/:id', async (req, res) => {
  try {
    const activityLog = await activityLogsController.showByID(req.params.id);
    if (!activityLog) {
      return res.status(404).send(`No se encontró el registro de actividad con id: ${req.params.id}`);
    }
    res.status(200).send(activityLog);
  } catch (err) {
    res.status(500).send(`Error al buscar registro de actividad: ${err}`);
  }
});

/* GET mostrar registros de actividad por usuario */
router.get('/user/:user_id', async (req, res) => {
  try {
    const activityLogs = await activityLogsController.showByUser(req.params.user_id);
    res.status(200).send(activityLogs);
  } catch (err) {
    res.status(500).send(`Error al buscar registros de actividad por usuario: ${err}`);
  }
});

/* GET mostrar registros de actividad por actividad */
router.get('/activity/:activity_id', async (req, res) => {
  try {
    const activityLogs = await activityLogsController.showByActivity(req.params.activity_id);
    res.status(200).send(activityLogs);
  } catch (err) {
    res.status(500).send(`Error al buscar registros de actividad por actividad: ${err}`);
  }
});

/* PUT editar un registro de actividad */
router.put('/:id', async (req, res) => {
  try {
    const result = await activityLogsController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Registro de actividad editado");
  } catch (err) {
    res.status(500).send(`Error al editar el registro de actividad: ${err}`);
  }
});

/* DELETE eliminar un registro de actividad */
router.delete('/:id', async (req, res) => {
  try {
    const result = await activityLogsController.delete(req.params.id);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Registro de actividad eliminado")
  } catch (err) {
    res.status(500).send(`Error al eliminar registro de actividad: ${err}`);
  }
});

// Mostrar las últimas 5 actividades realizadas por un usuario
router.get('/users/:userId/last-activities', async (req, res) => {
  try {
    const activities = await activityLogsController.getLastActivitiesByUser(req.params.userId);
    res.status(200).send(activities);
  } catch (err) {
    res.status(500).send(`Error al obtener las últimas actividades: ${err}`);
  }
});

// Buscar actividades realizadas por proyecto
router.get('/projects/:projectId/activities', async (req, res) => {
  try {
    const activities = await activityLogsController.getActivitiesByProject(req.params.projectId);
    res.status(200).send(activities);
  } catch (err) {
    res.status(500).send(`Error al obtener actividades por proyecto: ${err}`);
  }
});

// Mostrar actividades realizadas de un hábito en específico por rango de fecha
router.get('/habits/:habitId/activities', async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Obtener las fechas del query string
    const activities = await activityLogsController.getActivitiesByHabitAndDateRange(
      req.params.habitId,
      startDate,
      endDate
    );
    res.status(200).send(activities);
  } catch (err) {
    res.status(500).send(`Error al obtener actividades por hábito y rango de fecha: ${err}`);
  }
});

// Buscar actividades realizadas por nombre de la actividad
router.get('/activities/search', async (req, res) => {
  try {
    const { name } = req.query; // Obtener el nombre de la actividad del query string
    if (!name) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Debes proporcionar un nombre de actividad.',
        redirectUrl: '/activities'
      });
    }

    const activities = await activityLogsController.getActivitiesByName(name);

    res.status(200).render('activities/search-results', {
      activities: activities,
      searchQuery: name,
      user: req.user
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al buscar actividades por nombre: ${err.message}`,
      redirectUrl: '/activities'
    });
  }
});

module.exports = router;