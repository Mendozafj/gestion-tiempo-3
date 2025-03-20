var express = require('express');
var router = express.Router();
var projectsController = require("../controllers/projects.c");

/* POST registrar proyectos */
router.post('/', async (req, res) => {
  try {
    const result = await projectsController.register(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    return res.status(201).send("Proyecto creado");
  } catch (error) {
    res.status(500).send("Error al registrar el proyecto");
  }
});

/* GET mostrar proyectos. */
router.get('/', async (req, res) => {
  try {
    const projects = await projectsController.show();
    res.status(200).render('projects', { projects });  // Renderiza la vista 'projects.ejs'
  } catch (err) {
    res.status(500).send(`Error al listar proyectos: ${err}`);
  }
});

/* Mostrar información sobre el tiempo usado en cada proyecto */
router.get('/time-used', async (req, res) => {
  try {
    const timeUsedByProject = await projectsController.getTimeUsedByProject();
    res.status(200).send(timeUsedByProject);
  } catch (err) {
    res.status(500).send(`Error al obtener el tiempo usado por proyecto: ${err}`);
  }
});

/* GET mostrar proyecto por id */
router.get('/:id', async (req, res) => {
  try {
    const project = await projectsController.showByID(req.params.id);
    if (!project) {
      return res.status(404).send(`No se encontró el proyecto con id: ${req.params.id}`);
    }
    res.status(200).send(project);
  } catch (err) {
    res.status(500).send(`Error al buscar proyecto: ${err}`);
  }
});

/* PUT editar proyecto */
router.put('/:id', async (req, res) => {
  try {
    const result = await projectsController.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Proyecto editado");
  } catch (err) {
    res.status(500).send(`Error al editar el proyecto: ${err}`);
  }
});

// Eliminar proyecto y sus actividades realizadas
router.delete('/:id', async (req, res) => {
  try {
    const result = await projectsController.delete(req.params.id);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Proyecto y sus actividades realizadas eliminados");
  } catch (err) {
    res.status(500).send(`Error al eliminar proyecto y sus actividades realizadas: ${err}`);
  }
});

// Relacionar un proyecto con una actividad realizada
router.post('/:projectId/activity-logs/:activityLogId', async (req, res) => {
  try {
    const result = await projectsController.addActivityLogToProject(req.params.projectId, req.params.activityLogId);
    if (result.error) {
      return res.status(400).send(result.error); // Devuelve el mensaje de error
    }
    res.status(201).send(`Actividad agregada al proyecto`);
  } catch (err) {
    res.status(500).send(`Error al relacionar actividad realizada con proyecto: ${err}`);
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

// Eliminar la relación entre un proyecto y una actividad realizada
router.delete('/activity-logs/:relationId', async (req, res) => {
  try {
    const result = await projectsController.removeActivityLogFromProject(req.params.relationId);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    res.status(200).send("Relación entre proyecto y actividad realizada eliminada");
  } catch (err) {
    res.status(500).send(`Error al eliminar relación entre proyecto y actividad realizada: ${err}`);
  }
});

module.exports = router;