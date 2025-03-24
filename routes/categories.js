var express = require('express');
var router = express.Router();
var categoriesController = require("../controllers/categories.c");
var activitiesController = require("../controllers/activities.c");
const { authenticate } = require('../middleware/auth');

/* POST registrar categorías */
router.post('/', async (req, res) => {
  try {
    const result = await categoriesController.register(req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/categories'
      });
    }
    res.status(201).render('message', {
      message: 'Categoría creada',
      messageType: 'success',
      details: `La categoría "${req.body.name}" ha sido creada exitosamente.`,
      redirectUrl: '/categories'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo crear la categoría: ${error.message}`,
      redirectUrl: '/categories'
    });
  }
});

/* GET mostrar categorías. */
router.get('/', async (req, res) => {
  try {
    const categories = await categoriesController.show();
    res.status(200).render('categories/categories', { categories });  // Renderiza la vista 'categories.ejs'
  } catch (err) {
    res.status(500).send(`Error al listar categorías: ${err}`);
  }
});

// Mostrar formulario para crear una categoría
router.get('/new', (req, res) => {
  res.render('categories/new');
});

// Mostrar formulario para editar una categoría
router.get('/:id/edit', async (req, res) => {
  try {
    const category = await categoriesController.showByID(req.params.id);
    if (!category) {
      return res.status(404).send("Categoría no encontrada");
    }
    res.render('categories/edit', { category });
  } catch (err) {
    res.status(500).send(`Error al obtener la categoría: ${err}`);
  }
});

// Mostrar información sobre el tiempo usado en cada categoría
router.get('/time-used', async (req, res) => {
  try {
    const timeUsedByCategory = await categoriesController.getTimeUsedByCategory();
    res.status(200).render('categories/time-used-by-category', {
      timeUsedByCategory: timeUsedByCategory
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener el tiempo usado por categoría: ${err.message}`,
      redirectUrl: '/'
    });
  }
});

/* GET mostrar categoría por id */
router.get('/:id', async (req, res) => {
  try {
    const category = await categoriesController.showByID(req.params.id);
    if (!category) {
      return res.status(404).send(`No se encontró la categoría con id: ${req.params.id}`);
    }
    res.status(200).send(category);
  } catch (err) {
    res.status(500).send(`Error al buscar categoría: ${err}`);
  }
});

/* PUT editar categoría */
router.put('/:id', async (req, res) => {
  try {
    const result = await categoriesController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/categories'
      });
    }
    res.status(200).render('message', {
      message: 'Categoría editada',
      messageType: 'success',
      details: `La categoría "${req.body.name}" ha sido actualizada exitosamente.`,
      redirectUrl: '/categories'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo editar la categoría: ${error.message}`,
      redirectUrl: '/categories'
    });
  }
});

/* DELETE eliminar categoría */
router.delete('/:id', async (req, res) => {
  try {
    const result = await categoriesController.delete(req.params.id);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/categories'
      });
    }
    res.status(200).render('message', {
      message: 'Categoría eliminada',
      messageType: 'success',
      details: `La categoría ha sido eliminada exitosamente.`,
      redirectUrl: '/categories'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo eliminar la categoría: ${error.message}`,
      redirectUrl: '/categories'
    });
  }
});

// Mostrar actividades de una categoría específica para el usuario autenticado
router.get('/:categoryId/activities', authenticate, async (req, res) => {
  try {
    const category = await categoriesController.showByID(req.params.categoryId);
    if (!category) {
      return res.status(404).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Categoría no encontrada.',
        redirectUrl: '/categories'
      });
    }

    // Obtener las actividades de la categoría para el usuario autenticado
    const activities = await activitiesController.getActivitiesByUserAndCategory(
      req.user.id, // ID del usuario autenticado
      req.params.categoryId // ID de la categoría
    );

    // Renderizar la vista con los datos
    res.status(200).render('categories/category-activities', {
      category: category,
      activities: activities,
      user: req.user, // Pasar el usuario autenticado
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener actividades: ${error.message}`,
      redirectUrl: '/categories'
    });
  }
});

module.exports = router;