const pool = require('../config/db');

class ActivityLogsModel {
  // Método para verificar si una actividad existe por su ID
  async activityExists(activity_id) {
    const query = 'SELECT id FROM activities WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [activity_id]);
      return rows.length > 0; // Devuelve true si existe, false si no
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si un usuario existe por su ID
  async userExists(user_id) {
    const query = 'SELECT id FROM users WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [user_id]);
      return rows.length > 0; // Devuelve true si existe, false si no
    } catch (error) {
      throw error;
    }
  }

  // Método para registrar un nuevo registro de actividad
  async register(activityLog) {
    const query = `
      INSERT INTO activity_logs (activity_id, user_id, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      activityLog.activity_id,
      activityLog.user_id,
      activityLog.start_time,
      activityLog.end_time
    ];

    try {
      // Verificar si la actividad existe
      const activityExists = await this.activityExists(activityLog.activity_id);
      if (!activityExists) {
        throw new Error("La actividad no existe.");
      }

      // Verificar si el usuario existe
      const userExists = await this.userExists(activityLog.user_id);
      if (!userExists) {
        throw new Error("El usuario no existe.");
      }

      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar todos los registros de actividad
  async show() {
    const query = 'SELECT * FROM activity_logs';

    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar un registro de actividad por su ID
  async showByID(id) {
    const query = 'SELECT * FROM activity_logs WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar registros de actividad por usuario
  async showByUser(user_id) {
    const query = 'SELECT * FROM activity_logs WHERE user_id = ?';

    try {
      const [rows] = await pool.query(query, [user_id]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar registros de actividad por actividad
  async showByActivity(activity_id) {
    const query = 'SELECT * FROM activity_logs WHERE activity_id = ?';

    try {
      const [rows] = await pool.query(query, [activity_id]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para editar un registro de actividad por su ID
  async edit(updatedActivityLog, id) {
    const query = `
      UPDATE activity_logs
      SET start_time = ?, end_time = ?
      WHERE id = ?
    `;
    const values = [
      updatedActivityLog.start_time,
      updatedActivityLog.end_time,
      id
    ];

    try {
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar un registro de actividad por su ID
  async delete(id) {
    const query = 'DELETE FROM activity_logs WHERE id = ?';

    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener las últimas 5 actividades realizadas por un usuario
  async getLastActivitiesByUser(userId) {
    const query = `
      SELECT a.name AS activity_name, c.name AS category_name, al.start_time, al.end_time
      FROM activity_logs al
      JOIN activities a ON al.activity_id = a.id
      JOIN category_activities ca ON a.id = ca.activity_id
      JOIN categories c ON ca.category_id = c.id
      WHERE al.user_id = ?
      ORDER BY al.start_time DESC
      LIMIT 5
    `;
    try {
      const [rows] = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un proyecto existe
  async projectExists(projectId) {
    const query = 'SELECT id FROM projects WHERE id = ?';
    try {
      const [rows] = await pool.query(query, [projectId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener actividades realizadas por proyecto
  async getActivitiesByProject(projectId) {
    const query = `
      SELECT a.name AS activity_name, c.name AS category_name, al.start_time, al.end_time
      FROM activity_logs al
      JOIN activities a ON al.activity_id = a.id
      JOIN category_activities ca ON a.id = ca.activity_id
      JOIN categories c ON ca.category_id = c.id
      JOIN project_activity_logs pal ON al.id = pal.activity_log_id
      WHERE pal.project_id = ?
    `;
    try {
      const [rows] = await pool.query(query, [projectId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un hábito existe
  async habitExists(habitId) {
    const query = 'SELECT id FROM habits WHERE id = ?';
    try {
      const [rows] = await pool.query(query, [habitId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener actividades realizadas de un hábito en específico por rango de fecha
  async getActivitiesByHabitAndDateRange(habitId, startDate, endDate) {
    const query = `
      SELECT a.name AS activity_name, c.name AS category_name, al.start_time, al.end_time
      FROM activity_logs al
      JOIN activities a ON al.activity_id = a.id
      JOIN category_activities ca ON a.id = ca.activity_id
      JOIN categories c ON ca.category_id = c.id
      JOIN habit_activities ha ON a.id = ha.activity_id
      WHERE ha.habit_id = ? AND al.start_time >= ? AND al.end_time <= ?
    `;
    try {
      const [rows] = await pool.query(query, [habitId, startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener actividades realizadas por nombre de la actividad
  async getActivitiesByName(name) {
    const query = `
      SELECT a.name AS activity_name, c.name AS category_name, al.start_time, al.end_time
      FROM activity_logs al
      JOIN activities a ON al.activity_id = a.id
      JOIN category_activities ca ON a.id = ca.activity_id
      JOIN categories c ON ca.category_id = c.id
      WHERE a.name LIKE ?
    `;
    try {
      const [rows] = await pool.query(query, [`%${name}%`]); // Usar LIKE para búsqueda parcial
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener actividades abiertas (sin fecha de finalización)
  async getOpenActivities() {
    const query = `
    SELECT 
      a.name AS activity_name,
      c.name AS category_name,
      al.start_time
    FROM activity_logs al
    JOIN activities a ON al.activity_id = a.id
    JOIN category_activities ca ON a.id = ca.activity_id
    JOIN categories c ON ca.category_id = c.id
    WHERE al.end_time IS NULL
  `;
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ActivityLogsModel();