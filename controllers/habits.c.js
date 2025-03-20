const habitsModel = require("../models/habits.m");

class HabitsController {
  async register(data) {
    const { name, description } = data;
    if (!name || !description) {
      return { error: "Todos los campos son requeridos." };
    }

    try {
      const newHabit = { name, description };
      await habitsModel.register(newHabit);

      return { success: true };
    } catch (error) {
      return { error: `Error al registrar hábito: ${error.message}` };
    }
  }

  async show() {
    try {
      const habits = await habitsModel.show();
      return habits;
    } catch (err) {
      return { error: `Error al listar hábitos: ${err.message}` };
    }
  }

  async showByID(id) {
    try {
      const habit = await habitsModel.showByID(id);
      if (!habit) {
        return { error: `No se encontró el hábito con id: ${id}` };
      }
      return habit;
    } catch (err) {
      return { error: `Error al buscar hábito: ${err.message}` };
    }
  }

  async update(id, data) {
    const { name, description } = data;

    try {
      const habit = await habitsModel.showByID(id);
      if (!habit) {
        return { error: `No se encontró el hábito con id: ${id}` };
      }

      const updatedHabit = {
        name: name || habit.name,
        description: description || habit.description
      };

      await habitsModel.edit(updatedHabit, id);

      return { success: true };
    } catch (err) {
      return { error: `Error al editar el hábito: ${err.message}` };
    }
  }

  async delete(id) {
    try {
      const habit = await habitsModel.showByID(id);
      if (!habit) {
        return { error: `No se encontró el hábito con id: ${id}` };
      }

      await habitsModel.delete(id);
      return { success: true };
    } catch (err) {
      return { error: `Error al eliminar hábito: ${err.message}` };
    }
  }

  async addActivity(id, activityId) {
    try {
      const existingRelation = await habitsModel.getActivityRelation(id, activityId);
      if (existingRelation) {
        return { error: 'Esta actividad ya está asociada al hábito' };
      }
      const relationId = await habitsModel.addActivity(id, activityId);
      return { id: relationId };
    } catch (error) {
      return { error: `Error al agregar actividad al hábito: ${error.message}` };
    }
  }

  async removeActivity(relationId) {
    try {
      await habitsModel.removeActivity(relationId);
      return { message: 'Actividad eliminada del hábito con éxito' };
    } catch (error) {
      return { error: `Error al eliminar actividad del hábito: ${error.message}` };
    }
  }

  async getActivities(id) {
    try {
      const activities = await habitsModel.getActivities(id);
      return activities;
    } catch (error) {
      return { error: `Error al obtener actividades del hábito: ${error.message}` };
    }
  }

  // Mostrar los hábitos que no tienen actividades realizadas
  async getHabitsWithoutActivities() {
    try {
      // Obtener los hábitos sin actividades realizadas
      const habits = await habitsModel.getHabitsWithoutActivities();
      return habits;
    } catch (error) {
      throw new Error(`Error al obtener hábitos sin actividades realizadas: ${error.message}`);
    }
  }
}

module.exports = new HabitsController();