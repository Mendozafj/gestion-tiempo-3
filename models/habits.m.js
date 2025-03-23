const pool = require('../config/db');

class HabitsModel {
  // Método para registrar un nuevo hábito
  async register(habit) {
    const query = 'INSERT INTO habits (name, description) VALUES (?, ?)';
    const values = [habit.name, habit.description];

    try {
      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar todos los hábitos
  async show() {
    const query = 'SELECT * FROM habits';

    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar un hábito por su ID
  async showByID(id) {
    const query = 'SELECT * FROM habits WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Método para editar un hábito por su ID
  async edit(updatedHabit, id) {
    const query = 'UPDATE habits SET name = ?, description = ? WHERE id = ?';
    const values = [updatedHabit.name, updatedHabit.description, id];

    try {
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar un hábito por su ID
  async delete(id) {
    const query = 'DELETE FROM habits WHERE id = ?';

    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si una actividad existe por su ID
  async activityExists(activityId) {
    const query = 'SELECT id FROM activities WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [activityId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si un hábito existe por su ID
  async habitExists(habitId) {
    const query = 'SELECT id FROM habits WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [habitId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para agregar una actividad a un hábito
  async addActivity(habit_id, activity_id) {
    if (!(await this.habitExists(habit_id))) {
      throw new Error('El hábito no existe');
    }
    if (!(await this.activityExists(activity_id))) {
      throw new Error('La actividad no existe');
    }
    const existingRelation = await this.getActivityRelation(habit_id, activity_id);
    if (existingRelation) {
      throw new Error('Esta actividad ya está asociada al hábito');
    }
    const query = 'INSERT INTO habit_activities (habit_id, activity_id) VALUES (?, ?)';
    await pool.query(query, [habit_id, activity_id]);
  }

  async removeActivity(relationId) {
    const checkQuery = 'SELECT id FROM habit_activities WHERE id = ?';
    const [rows] = await pool.query(checkQuery, [relationId]);
    if (rows.length === 0) {
      throw new Error('La relación no existe');
    }
    const deleteQuery = 'DELETE FROM habit_activities WHERE id = ?';
    await pool.query(deleteQuery, [relationId]);
  }

  async getActivityRelation(habitId, activityId) {
    const query = 'SELECT id FROM habit_activities WHERE habit_id = ? AND activity_id = ?';
    const [rows] = await pool.query(query, [habitId, activityId]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getActivities(habitId) {
    const query = `
        SELECT a.*, ha.id AS relationId 
        FROM activities a 
        JOIN habit_activities ha ON a.id = ha.activity_id 
        WHERE ha.habit_id = ?
    `;

    try {
      const [rows] = await pool.query(query, [habitId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener los hábitos que no tienen actividades realizadas
  async getHabitsWithoutActivities() {
    const query = `
      SELECT h.*
      FROM habits h
      LEFT JOIN habit_activities ha ON h.id = ha.habit_id
      LEFT JOIN activity_logs al ON ha.activity_id = al.activity_id
      WHERE al.id IS NULL
    `;
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new HabitsModel();