const activityLogsModel = require("../models/activity_logs.m");

class ActivityLogsController {
  async register(data) {
    const { activity_id, user_id, start_time, end_time } = data;
    if (!activity_id || !user_id || !start_time) {
      return { error: "Todos los campos son requeridos." };
    }

    try {
      const existingActivityLogs = await activityLogsModel.showByActivity(activity_id);
      if (existingActivityLogs.length > 0) {
        return { error: "Ya existe un registro para esta actividad." };
      }

      const newActivityLog = { activity_id, user_id, start_time, end_time: end_time ?? null };
      await activityLogsModel.register(newActivityLog);

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  async show() {
    try {
      const activityLogs = await activityLogsModel.show();
      return activityLogs;
    } catch (err) {
      throw new Error(`Error al listar registros de actividad: ${err}`);
    }
  }

  async showByID(id) {
    try {
      const activityLog = await activityLogsModel.showByID(id);
      if (!activityLog) {
        return false;
      }
      return activityLog;
    } catch (err) {
      throw new Error(`Error al buscar registro de actividad: ${err}`);
    }
  }

  async showByUser(user_id) {
    try {
      const activityLogs = await activityLogsModel.showByUser(user_id);
      return activityLogs;
    } catch (err) {
      throw new Error(`Error al buscar registros de actividad por usuario: ${err}`);
    }
  }

  async showByActivity(activity_id) {
    try {
      const activityLogs = await activityLogsModel.showByActivity(activity_id);
      return activityLogs;
    } catch (err) {
      throw new Error(`Error al buscar registros de actividad por actividad: ${err}`);
    }
  }

  async update(id, data) {
    const { start_time, end_time } = data;

    try {
      const activityLog = await activityLogsModel.showByID(id);
      if (!activityLog) {
        return { error: `No se encontró el registro de actividad con id: ${id}` };
      }

      const updatedActivityLog = {
        start_time: start_time || activityLog.start_time,
        end_time: end_time || activityLog.end_time
      };

      await activityLogsModel.edit(updatedActivityLog, id);

      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  }

  async delete(id) {
    try {
      const activityLog = await activityLogsModel.showByID(id);
      if (!activityLog) {
        return { error: `No se encontró el registro de actividad con id: ${id}` };
      }

      await activityLogsModel.delete(id);
      return { success: true };
    } catch (err) {
      throw new Error(`Error al eliminar registro de actividad: ${err}`);
    }
  }

  // Mostrar las últimas 5 actividades realizadas por un usuario
  async getLastActivitiesByUser(userId) {
    try {
      // Verificar si el usuario existe
      const userExists = await activityLogsModel.userExists(userId);
      if (!userExists) {
        return { error: `El usuario con id ${userId} no existe` };
      }

      // Obtener las últimas 5 actividades
      const activities = await activityLogsModel.getLastActivitiesByUser(userId);
      return activities;
    } catch (error) {
      throw new Error(`Error al obtener las últimas actividades: ${error.message}`);
    }
  }

  // Buscar actividades realizadas por proyecto
  async getActivitiesByProject(projectId) {
    try {
      // Verificar si el proyecto existe
      const projectExists = await activityLogsModel.projectExists(projectId);
      if (!projectExists) {
        return { error: `El proyecto con id ${projectId} no existe` };
      }

      // Obtener las actividades realizadas por proyecto
      const activities = await activityLogsModel.getActivitiesByProject(projectId);
      return activities;
    } catch (error) {
      throw new Error(`Error al obtener actividades por proyecto: ${error.message}`);
    }
  }

  // Mostrar actividades realizadas de un hábito en específico por rango de fecha
  async getActivitiesByHabitAndDateRange(habitId, startDate, endDate) {
    try {
      // Verificar si el hábito existe
      const habitExists = await activityLogsModel.habitExists(habitId);
      if (!habitExists) {
        return { error: `El hábito con id ${habitId} no existe` };
      }

      // Validar las fechas
      if (!startDate || !endDate) {
        return { error: "Debes proporcionar un rango de fechas válido (startDate y endDate)" };
      }

      // Obtener las actividades realizadas por hábito y rango de fecha
      const activities = await activityLogsModel.getActivitiesByHabitAndDateRange(
        habitId,
        startDate,
        endDate
      );
      return activities;
    } catch (error) {
      throw new Error(`Error al obtener actividades por hábito y rango de fecha: ${error.message}`);
    }
  }

  // Buscar actividades realizadas por nombre de la actividad
  async getActivitiesByName(name) {
    try {
      const activities = await activityLogsModel.getActivitiesByName(name);
      return activities;
    } catch (error) {
      throw new Error(`Error al buscar actividades por nombre: ${error.message}`);
    }
  }

  // Mostrar actividades abiertas (sin fecha de finalización)
  async getOpenActivities() {
    try {
      // Obtener las actividades abiertas
      const openActivities = await activityLogsModel.getOpenActivities();
      return openActivities;
    } catch (error) {
      throw new Error(`Error al obtener actividades abiertas: ${error.message}`);
    }
  }
}

module.exports = new ActivityLogsController();