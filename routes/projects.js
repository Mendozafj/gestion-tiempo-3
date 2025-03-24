var express = require('express');
var router = express.Router();
var projectsController = require("../controllers/projects.c");
var usersController = require("../controllers/users.c");
var activitiesController = require("../controllers/activities.c");
var activityLogsController = require("../controllers/activity_logs.c");
var activityLogsModel = require("../models/activity_logs.m");
const { authenticate } = require('../middleware/auth');

/* POST registrar proyectos */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    const result = await projectsController.register({ ...req.body, userId }); // Pasar el userId al controlador
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/projects'
      });
    }
    res.status(201).render('message', {
      message: 'Proyecto creado',
      messageType: 'success',
      details: `El proyecto "${req.body.name}" ha sido creado exitosamente.`,
      redirectUrl: '/projects'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo crear el proyecto: ${error.message}`,
      redirectUrl: '/projects'
    });
  }
});

/* GET mostrar proyectos. */
router.get('/all', async (req, res) => {
  try {
    const projects = await projectsController.show();
    res.status(200).render('projects', { projects });  // Renderiza la vista 'projects.ejs'
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al listar proyectos: ${err}`,
      redirectUrl: '/projects'
    });
  }
});

/* GET mostrar proyectos del usuario autenticado */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    const projects = await usersController.getUserProjects(userId);
    res.status(200).render('projects/projects', { projects }); // Renderiza la vista 'projects.ejs'
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al listar proyectos: ${err}`,
      redirectUrl: '/projects'
    });
  }
});

// Mostrar formulario para crear un nuevo proyecto
router.get('/new', authenticate, (req, res) => {
  res.render('projects/new');
});

// Mostrar formulario para editar un proyecto
router.get('/:id/edit', authenticate, async (req, res) => {
  try {
    const project = await projectsController.showByID(req.params.id);
    if (!project) {
      return res.status(404).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Proyecto no encontrado',
        redirectUrl: '/projects'
      });
    }
    res.render('projects/edit', { project });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener el proyecto: ${err}`,
      redirectUrl: '/projects'
    });
  }
});

// Mostrar formulario para editar un registro de actividad realizada
router.get('/:projectId/activity-logs/:activityLogId/edit', authenticate, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const activityLogId = req.params.activityLogId;

    // Obtener el registro de actividad realizada
    const activityLog = await activityLogsController.showByID(activityLogId);
    if (!activityLog) {
      return res.status(404).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Registro de actividad no encontrado',
        redirectUrl: `/projects/${projectId}`
      });
    }

    // Renderizar la vista de edición
    res.render('projects/edit-activity-log', {
      projectId,
      activityLogId,
      activityLog
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener el registro de actividad: ${err}`,
      redirectUrl: `/projects/${projectId}`
    });
  }


});

/* Mostrar información sobre el tiempo usado en cada proyecto */
router.get('/time-used', async (req, res) => {
  try {
    const timeUsedByProject = await projectsController.getTimeUsedByProject();
    res.status(200).render('projects/time-used-by-project', {
      timeUsedByProject: timeUsedByProject
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener el tiempo usado por proyecto: ${err.message}`,
      redirectUrl: '/'
    });
  }
});

// Mostrar detalles de un proyecto por id y sus actividades
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await projectsController.showByID(req.params.id);
    if (!project) {
      return res.status(404).render('message', {
        message: 'Error',
        messageType: 'error',
        details: 'Proyecto no encontrado',
        redirectUrl: '/projects'
      });
    }

    // Obtener las actividades creadas
    const activities = await activitiesController.show();

    // Obtener las actividades del proyecto
    const activitiesProject = await projectsController.getProjectActivityLogs(req.params.id);

    res.status(200).render('projects/details', { project, activities, activitiesProject });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al obtener el proyecto: ${err}`,
      redirectUrl: '/projects'
    });
  }
});

/* PUT editar proyecto */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const result = await projectsController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/projects'
      });
    }
    res.status(200).render('message', {
      message: 'Proyecto editado',
      messageType: 'success',
      details: `El proyecto "${req.body.name}" ha sido actualizado exitosamente.`,
      redirectUrl: '/projects'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo editar el proyecto: ${error.message}`,
      redirectUrl: '/projects'
    });
  }
});

/* DELETE eliminar proyecto */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await projectsController.delete(req.params.id);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: '/projects'
      });
    }
    res.status(200).render('message', {
      message: 'Proyecto eliminado',
      messageType: 'success',
      details: `El proyecto ha sido eliminado exitosamente.`,
      redirectUrl: '/projects'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `No se pudo eliminar el proyecto: ${error.message}`,
      redirectUrl: '/projects'
    });
  }
});

// Agregar actividad realizada a un proyecto
router.post('/:projectId/activity-logs', authenticate, async (req, res) => {
  try {
    const { activityId, startTime, endTime } = req.body;
    const projectId = req.params.projectId;
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    // Crear la actividad realizada
    const activityLog = {
      activity_id: activityId,
      start_time: startTime,
      end_time: endTime,
      user_id: userId,
    };

    // Guardar la actividad realizada en la base de datos
    const activityLogId = await activityLogsModel.register(activityLog);

    // Asignar la actividad realizada al proyecto
    await projectsController.addActivityLogToProject(projectId, activityLogId);

    res.status(201).render('message', {
      message: 'Actividad realizada agregada',
      messageType: 'success',
      details: 'La actividad realizada ha sido agregada al proyecto.',
      redirectUrl: `/projects/${projectId}`
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al agregar la actividad realizada: ${error.message}`,
      redirectUrl: `/projects/${projectId}`
    });
  }
});

// Obtener las actividades realizadas de un proyecto
router.get('/:projectId/activity-logs', async (req, res) => {
  try {
    const activityLogs = await projectsController.getProjectActivityLogs(req.params.projectId);
    res.status(200).send(activityLogs);
  } catch (err) {
    res.status(500).send(`Error al obtener actividades realizadas del proyecto: ${err}`);
  }
});

// Eliminar la relación entre un proyecto y una actividad realizada (Quitar una actividad del proyecto)
router.delete('/:projectId/activity-logs/:relationId', authenticate, async (req, res) => {
  try {
    const result = await projectsController.removeActivityLogFromProject(req.params.relationId);
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: `/projects/${req.params.projectId}`
      });
    }
    res.status(200).render('message', {
      message: 'Actividad eliminada',
      messageType: 'success',
      details: `La actividad ha sido quitada del proyecto.`,
      redirectUrl: `/projects/${req.params.projectId}`
    });
  } catch (err) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al quitar la actividad: ${err}`,
      redirectUrl: `/projects/${req.params.projectId}`
    });
  }
});

router.put('/:projectId/activity-logs/:activityLogId', authenticate, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const activityLogId = req.params.activityLogId;
    const { startTime, endTime } = req.body;

    // Actualizar el registro de actividad realizada
    const result = await activityLogsController.update(activityLogId, { start_time: startTime, end_time: endTime });
    if (result.error) {
      return res.status(400).render('message', {
        message: 'Error',
        messageType: 'error',
        details: result.error,
        redirectUrl: `/projects/${projectId}`
      });
    }

    res.status(200).render('message', {
      message: 'Actividad actualizada',
      messageType: 'success',
      details: 'El registro de actividad ha sido actualizado exitosamente.',
      redirectUrl: `/projects/${projectId}`
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error',
      messageType: 'error',
      details: `Error al actualizar el registro de actividad: ${error.message}`,
      redirectUrl: `/projects/${projectId}`
    });
  }
});

module.exports = router;