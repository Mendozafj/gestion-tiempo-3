var express = require('express');
var router = express.Router();
var habitsController = require("../controllers/habits.c");

/* POST registrar hábitos */
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
  try {
    const habits = await habitsController.show();
    res.status(200).render('habits/habits', { habits });  // Renderiza la vista 'habits.ejs'
  } catch (err) {
    res.status(500).send(`Error al listar hábitos: ${err}`);
  }
});

// Mostrar formulario para crear un nuevo hábito
router.get('/new', (req, res) => {
  res.render('habits/new');
});

// Mostrar formulario para editar un hábito
router.get('/:id/edit', async (req, res) => {
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
router.get('/habits-without-activities', async (req, res) => {
  try {
    const habits = await habitsController.getHabitsWithoutActivities();
    res.status(200).send(habits);
  } catch (err) {
    res.status(500).send(`Error al obtener hábitos sin actividades realizadas: ${err}`);
  }
});

/* GET mostrar hábito por id */
router.get('/:id', async (req, res) => {
  try {
    const habit = await habitsController.showByID(req.params.id);
    if (!habit) {
      return res.status(404).send(`No se encontró el hábito con id: ${req.params.id}`);
    }
    res.status(200).send(habit);
  } catch (err) {
    res.status(500).send(`Error al buscar hábito: ${err}`);
  }
});

/* PUT editar hábito */
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
router.post('/:habitId/activities/:activityId', async (req, res) => {
  try {
    const result = await habitsController.addActivity(req.params.habitId, req.params.activityId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(201).send("Actividad agregada");
  } catch (err) {
    res.status(500).send(`Error al agregar actividad`);
  }
});

/* DELETE eliminar actividad de hábito */
router.delete('/activities/:relationId', async (req, res) => {
  try {
    const result = await habitsController.removeActivity(req.params.relationId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Actividad eliminada del hábito");
  } catch (err) {
    res.status(500).send(`Error al eliminar actividad del hábito.`);
  }
});

/* GET mostrar actividades de hábito */
router.get('/:habitId/activities', async (req, res) => {
  try {
    const activities = await habitsController.getActivities(req.params.habitId);
    res.status(200).send(activities);
  } catch (err) {
    res.status(500).send(`Error al mostrar actividades: ${err}`);
  }
});

module.exports = router;