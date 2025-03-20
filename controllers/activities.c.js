const activitiesModel = require("../models/activities.m");

class ActivitiesController {
  async register(data) {
    const { name, description } = data;
    if (!name || !description) {
      return { error: "Todos los campos son requeridos." };
    }

    try {
      const newActivity = { name, description };
      await activitiesModel.register(newActivity);

      return { success: true };
    } catch (error) {
      return { error: `Error al registrar actividad: ${error.message}` };
    }
  }

  async show() {
    try {
      const activities = await activitiesModel.show();
      return activities;
    } catch (err) {
      throw new Error(`Error al listar actividades: ${err}`);
    }
  }

  async showByID(id) {
    try {
      const activity = await activitiesModel.showByID(id);
      if (!activity) {
        return false;
      }
      return activity;
    } catch (err) {
      throw new Error(`Error al buscar actividad: ${err}`);
    }
  }

  async update(id, data) {
    const { name, description } = data;

    try {
      const activity = await activitiesModel.showByID(id);
      if (!activity) {
        return { error: `No se encontró la actividad con id: ${id}` };
      }

      const updatedActivity = {
        name: name || activity.name,
        description: description || activity.description
      };

      await activitiesModel.edit(updatedActivity, id);

      return { success: true };
    } catch (err) {
      throw new Error(`Error al editar la actividad: ${err}`);
    }
  }

  async delete(id) {
    try {
      const activity = await activitiesModel.showByID(id);
      if (!activity) {
        return { error: `No se encontró la actividad con id: ${id}` };
      }

      await activitiesModel.delete(id);
      return { success: true };
    } catch (err) {
      throw new Error(`Error al eliminar actividad: ${err}`);
    }
  }

  async addCategory(id, categoryId) {
    try {
      const existingRelation = await activitiesModel.getCategoryRelation(id, categoryId);
      if (existingRelation) {
        return { error: 'Esta categoría ya está asociada a la actividad' };
      }
      const relationId = await activitiesModel.addCategory(id, categoryId);
      return { id: relationId };
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async removeCategory(id, relationId) {
    try {
      await activitiesModel.removeCategory(id, relationId);
      return { message: 'Categoría eliminada de la actividad con éxito' };
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  async getCategories(id) {
    try {
      const categories = await activitiesModel.getCategories(id);
      return categories;
    } catch (err) {
      throw new Error(`Error al obtener categorías de la actividad: ${err}`);
    }
  }

  // Mostrar las actividades de una categoría determinada de un usuario dado
  async getActivitiesByUserAndCategory(userId, categoryId) {
    try {
      // Verificar si el usuario existe
      const userExists = await activitiesModel.userExists(userId);
      if (!userExists) {
        return { error: `El usuario con id ${userId} no existe` };
      }

      // Verificar si la categoría existe
      const categoryExists = await activitiesModel.categoryExists(categoryId);
      if (!categoryExists) {
        return { error: `La categoría con id ${categoryId} no existe` };
      }

      // Obtener las actividades
      const activities = await activitiesModel.getActivitiesByUserAndCategory(userId, categoryId);
      return activities;
    } catch (error) {
      throw new Error(`Error al obtener actividades: ${error.message}`);
    }
  }
}

module.exports = new ActivitiesController();