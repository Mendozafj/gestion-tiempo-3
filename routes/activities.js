var express = require('express');
var router = express.Router();
var activitiesController = require("../controllers/activities.c");
var categoriesController = require("../controllers/categories.c");
var activityLogsController = require("../controllers/activity_logs.c");
const { authenticate } = require('../middleware/auth');

/* POST registrar actividades */
router.post('/', async (req, res) => {
  try {
    const result = await activitiesController.register(req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/activities'
      });
    }
    res.status(201).render('message', {
      message: 'Actividad creada',
      messageType: 'success',
      details: `La actividad "${req.body.name}" ha sido creada exitosamente.`,
      redirectUrl: '/activities'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo crear la actividad: ${error.message}`,
      redirectUrl: '/activities'
    });
  }
});

/* GET mostrar actividades. */
router.get('/', authenticate, async (req, res) => {
  try {
    const activities = await activitiesController.show();
    const lastActivities = await activityLogsController.getLastActivitiesByUser(req.user.id);

    res.status(200).render('activities/activities', {
      activities: activities,
      lastActivities: lastActivities,
      user: req.user
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener actividades: ${err.message}`,
      redirectUrl: '/dashboard'
    });
  }
});

// Mostrar formulario para crear una actividad
router.get('/new', async (req, res) => {
  try {
    const categories = await categoriesController.show(); // Obtener la lista de categorías
    res.render('activities/new', { categories }); // Pasar las categorías a la vista
  } catch (err) {
    res.status(500).send(`Error al obtener categorías: ${err}`);
  }
});

// Mostrar formulario para editar una actividad
router.get('/:id/edit', async (req, res) => {
  try {
    const activity = await activitiesController.showByID(req.params.id);
    if (!activity) {
      return res.status(404).send("Actividad no encontrada");
    }

    const categories = await categoriesController.show(); // Obtener la lista de categorías
    res.render('activities/edit', { activity, categories }); // Pasar la actividad y las categorías a la vista
  } catch (err) {
    res.status(500).send(`Error al obtener la actividad: ${err}`);
  }
});

/* GET mostrar actividad por id */
router.get('/:id', async (req, res) => {
  try {
    const activity = await activitiesController.showByID(req.params.id);
    if (!activity) {
      return res.status(404).send(`No se encontró la actividad con id: ${req.params.id}`);
    }
    res.status(200).send(activity);
  } catch (err) {
    res.status(500).send(`Error al buscar actividad: ${err}`);
  }
});

/* PUT editar actividad */
router.put('/:id', async (req, res) => {
  try {
    const result = await activitiesController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/activities'
      });
    }
    res.status(200).render('message', {
      message: 'Actividad editada',
      messageType: 'success',
      details: `La actividad "${req.body.name}" ha sido actualizada exitosamente.`,
      redirectUrl: '/activities'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo editar la actividad: ${error.message}`,
      redirectUrl: '/activities'
    });
  }
});

/* DELETE eliminar actividad */
router.delete('/:id', async (req, res) => {
  try {
    const result = await activitiesController.delete(req.params.id);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/activities'
      });
    }
    res.status(200).render('message', {
      message: 'Actividad eliminada',
      messageType: 'success',
      details: `La actividad ha sido eliminada exitosamente.`,
      redirectUrl: '/activities'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo eliminar la actividad: ${error.message}`,
      redirectUrl: '/activities'
    });
  }
});

// Rutas para manejar la relación entre actividades y categorías
router.post('/:activityId/categories/:categoryId', async (req, res) => {
  try {
    const result = await activitiesController.addCategory(req.params.activityId, req.params.categoryId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Categoría agregada a la actividad");
  } catch (err) {
    res.status(500).send(`Error al agregar categoría a la actividad: ${err}`);
  }
});

// Rutas para eliminar la relación entre actividades y categorías
router.delete('/categories/:relationId', async (req, res) => {
  try {
    const result = await activitiesController.removeCategory(req.params.relationId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Categoría eliminada de la actividad");
  } catch (err) {
    res.status(500).send(`No se eliminó la categoría de la actividad`);
  }
});

// Rutas para obtener las categorías de una actividad
router.get('/:activityId/categories', async (req, res) => {
  try {
    const categories = await activitiesController.getCategories(req.params.activityId);
    res.status(200).send(categories);
  } catch (err) {
    res.status(500).send(`Error al obtener categorías de la actividad: ${err}`);
  }
});

// Mostrar las actividades de una categoría determinada de un usuario dado
router.get('/users/:userId/categories/:categoryId', async (req, res) => {
  try {
    const activities = await activitiesController.getActivitiesByUserAndCategory(
      req.params.userId,
      req.params.categoryId
    );
    res.status(200).send(activities);
  } catch (err) {
    res.status(500).send(`Error al obtener actividades: ${err}`);
  }
});

module.exports = router;