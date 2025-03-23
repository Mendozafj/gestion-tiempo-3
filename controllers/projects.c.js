const projectsModel = require("../models/projects.m");
const usersModel = require("../models/users.m"); // Importar el modelo de usuarios
const activityLogsModel = require("../models/activity_logs.m");

class ProjectsController {
  async register(data) {
    const { name, description, userId } = data; // Añadir userId a los datos
    if (!name || !description || !userId) {
      return { error: "Todos los campos son requeridos." };
    }

    try {
      const newProject = { name, description };
      const projectId = await projectsModel.register(newProject);

      // Relacionar el proyecto con el usuario
      await usersModel.addProjectToUser(userId, projectId);

      return { success: true, projectId };
    } catch (error) {
      return { error: `Error al registrar proyecto: ${error.message}` };
    }
  }

  async show() {
    try {
      const projects = await projectsModel.show();
      return projects;
    } catch (err) {
      throw new Error(`Error al listar proyectos: ${err}`);
    }
  }

  async showByID(id) {
    try {
      const project = await projectsModel.showByID(id);
      if (!project) {
        return false;
      }
      return project;
    } catch (err) {
      throw new Error(`Error al buscar proyecto: ${err}`);
    }
  }

  async update(id, data) {
    const { name, description } = data;

    try {
      const project = await projectsModel.showByID(id);
      if (!project) {
        return { error: `No se encontró el proyecto con id: ${id}` };
      }

      const updatedProject = {
        name: name || project.name,
        description: description || project.description
      };

      await projectsModel.edit(updatedProject, id);

      return { success: true };
    } catch (err) {
      throw new Error(`Error al editar el proyecto: ${err}`);
    }
  }

  // Eliminar proyecto y sus actividades realizadas
  async delete(id) {
    try {
      // Verificar si el proyecto existe
      const project = await projectsModel.showByID(id);
      if (!project) {
        return { error: `No se encontró el proyecto con id: ${id}` };
      }

      // Eliminar la relación entre el proyecto y el usuario
      await usersModel.removeProjectFromUser(id);

      // Eliminar el proyecto y sus actividades realizadas
      await projectsModel.deleteProjectAndActivities(id);
      return { success: true };
    } catch (err) {
      throw new Error(`Error al eliminar proyecto: ${err}`);
    }
  }

  // Relacionar un proyecto con una actividad realizada
  async addActivityLogToProject(projectId, activityLogId) {
    try {
      // Verificar si el proyecto existe
      const projectExists = await projectsModel.projectExists(projectId);
      if (!projectExists) {
        return { error: `El proyecto con id ${projectId} no existe` };
      }

      // Verificar si la actividad realizada existe
      const activityLogExists = await projectsModel.activityLogExists(activityLogId);
      if (!activityLogExists) {
        return { error: `La actividad realizada con id ${activityLogId} no existe` };
      }

      // Crear la relación (el modelo ya verifica si la relación existe)
      const relationId = await projectsModel.addActivityLogToProject(projectId, activityLogId);
      return { id: relationId };
    } catch (error) {
      return { error: error.message }; // Devuelve el mensaje de error lanzado por el modelo
    }
  }

  // Obtener las actividades realizadas de un proyecto
  async getProjectActivityLogs(projectId) {
    try {
      const activityLogs = await activityLogsModel.getActivitiesByProject(projectId);
      return activityLogs;
    } catch (error) {
      throw new Error(`Error al obtener actividades realizadas del proyecto: ${error.message}`);
    }
  }

  // Eliminar la relación entre un proyecto y una actividad realizada
  async removeActivityLogFromProject(relationId) {
    try {
      // Verificar si la relación existe
      const relationExists = await projectsModel.relationExistsId(relationId);
      if (!relationExists) {
        return { error: `La relación con id ${relationId} no existe` };
      }

      // Eliminar la relación
      await projectsModel.removeActivityLogFromProject(relationId);
      return { success: true };
    } catch (error) {
      return { error: `Error al eliminar relación entre proyecto y actividad realizada: ${error.message}` };
    }
  }

  // Mostrar información sobre el tiempo usado en cada proyecto
  async getTimeUsedByProject() {
    try {
      // Obtener el tiempo usado por proyecto
      const timeUsedByProject = await projectsModel.getTimeUsedByProject();
      return timeUsedByProject;
    } catch (error) {
      throw new Error(`Error al obtener el tiempo usado por proyecto: ${error.message}`);
    }
  }
}

module.exports = new ProjectsController();