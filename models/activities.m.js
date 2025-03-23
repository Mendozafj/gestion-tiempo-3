const pool = require('../config/db');

class ActivitiesModel {
  // Método para registrar una nueva actividad
  async register(activity) {
    const query = 'INSERT INTO activities (name, description) VALUES (?, ?)';
    const values = [activity.name, activity.description];

    try {
      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar todas las actividades
  async show() {
    try {
      const query = `
        SELECT a.*, c.name AS category_name
        FROM activities a
        LEFT JOIN category_activities ca ON a.id = ca.activity_id
        LEFT JOIN categories c ON ca.category_id = c.id
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (err) {
      throw new Error(`Error al listar actividades: ${err}`);
    }
  }

  // Método para mostrar una actividad por su ID
  async showByID(id) {
    try {
      const query = `
        SELECT a.*, c.id AS category_id, c.name AS category_name
        FROM activities a
        LEFT JOIN category_activities ca ON a.id = ca.activity_id
        LEFT JOIN categories c ON ca.category_id = c.id
        WHERE a.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (err) {
      throw new Error(`Error al buscar actividad: ${err}`);
    }
  }

  // Método para editar una actividad por su ID
  async edit(updatedActivity, id) {
    const query = 'UPDATE activities SET name = ?, description = ? WHERE id = ?';
    const values = [updatedActivity.name, updatedActivity.description, id];

    try {
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar una actividad por su ID
  async delete(id) {
    const query = 'DELETE FROM activities WHERE id = ?';

    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para agregar una categoría a una actividad
  async addCategory(activityId, categoryId) {
    if (!(await this.activityExists(activityId))) {
      throw new Error('La actividad no existe');
    }
    if (!(await this.categoryExists(categoryId))) {
      throw new Error('La categoría no existe');
    }
    const query = 'INSERT INTO category_activities (activity_id, category_id) VALUES (?, ?)';
    await pool.query(query, [activityId, categoryId]);
  }

  // Método para actualizar la categoría de una actividad
  async updateCategory(activityId, categoryId) {
    if (!(await this.activityExists(activityId))) {
      throw new Error('La actividad no existe');
    }
    if (!(await this.categoryExists(categoryId))) {
      throw new Error('La categoría no existe');
    }
    const query = 'UPDATE category_activities SET category_id = ? WHERE activity_id = ?';
    await pool.query(query, [categoryId, activityId]);
  }

  // Método para eliminar una categoría de una actividad
  async removeCategory(relationId) {
    const checkQuery = 'SELECT id FROM category_activities WHERE id = ?';
    const [rows] = await pool.query(checkQuery, [relationId]);
    if (rows.length === 0) {
      throw new Error('La relación no existe');
    }
    const deleteQuery = 'DELETE FROM category_activities WHERE id = ?';
    await pool.query(deleteQuery, [relationId]);
  }

  // Método para obtener las categorías de una actividad
  async getCategories(activityId) {
    const query = 'SELECT c.* FROM categories c JOIN category_activities ca ON c.id = ca.category_id WHERE ca.activity_id = ?';

    try {
      const [rows] = await pool.query(query, [activityId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si una actividad existe
  async activityExists(activityId) {
    const query = 'SELECT id FROM activities WHERE id = ?';
    const [rows] = await pool.query(query, [activityId]);
    return rows.length > 0;
  }

  // Verificar si una categoría existe
  async categoryExists(categoryId) {
    const query = 'SELECT id FROM categories WHERE id = ?';
    try {
      const [rows] = await pool.query(query, [categoryId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si una categoría ya está asociada a una actividad
  async getCategoryRelation(activityId, categoryId) {
    const query = 'SELECT id FROM category_activities WHERE activity_id = ? AND category_id = ?';
    const [rows] = await pool.query(query, [activityId, categoryId]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Verificar si un usuario existe
  async userExists(userId) {
    const query = 'SELECT id FROM users WHERE id = ?';
    try {
      const [rows] = await pool.query(query, [userId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener las actividades de una categoría determinada de un usuario dado
  async getActivitiesByUserAndCategory(userId, categoryId) {
    const query = `
        SELECT a.* 
        FROM activities a
        JOIN category_activities ca ON a.id = ca.activity_id
        JOIN activity_logs al ON a.id = al.activity_id
        WHERE ca.category_id = ? AND al.user_id = ?
      `;
    try {
      const [rows] = await pool.query(query, [categoryId, userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ActivitiesModel();