const pool = require('../config/db');

class ProjectsModel {
  // Método para registrar un nuevo proyecto
  async register(project) {
    const query = 'INSERT INTO projects (name, description) VALUES (?, ?)';
    const values = [project.name, project.description];

    try {
      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar todos los proyectos
  async show() {
    const query = 'SELECT * FROM projects';

    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar un proyecto por su ID
  async showByID(id) {
    const query = 'SELECT * FROM projects WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Método para editar un proyecto por su ID
  async edit(updatedProject, id) {
    const query = 'UPDATE projects SET name = ?, description = ? WHERE id = ?';
    const values = [updatedProject.name, updatedProject.description, id];

    try {
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si un proyecto existe
  async projectExists(projectId) {
    const query = 'SELECT id FROM projects WHERE id = ?';
    const [rows] = await pool.query(query, [projectId]);
    return rows.length > 0;
  }

  // Método para eliminar un proyecto y sus actividades realizadas
  async deleteProjectAndActivities(projectId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction(); // Iniciar transacción

      // 1. Eliminar las actividades realizadas asociadas al proyecto
      const deleteActivitiesQuery = `
      DELETE al FROM activity_logs al
      JOIN project_activity_logs pal ON al.id = pal.activity_log_id
      WHERE pal.project_id = ?
    `;
      await connection.query(deleteActivitiesQuery, [projectId]);

      // 2. Eliminar el proyecto (esto eliminará automáticamente las relaciones en project_activity_logs debido a ON DELETE CASCADE)
      const deleteProjectQuery = 'DELETE FROM projects WHERE id = ?';
      await connection.query(deleteProjectQuery, [projectId]);

      await connection.commit(); // Confirmar transacción
    } catch (error) {
      await connection.rollback(); // Revertir transacción en caso de error
      throw error;
    } finally {
      connection.release(); // Liberar la conexión
    }
  }

  // Método para verificar si una actividad realizada existe
  async activityLogExists(activityLogId) {
    const query = 'SELECT id FROM activity_logs WHERE id = ?';
    const [rows] = await pool.query(query, [activityLogId]);
    return rows.length > 0;
  }

  // Método para verificar si ya existe una relación entre un proyecto y una actividad realizada
  async relationExists(projectId, activityLogId) {
    const query = 'SELECT id FROM project_activity_logs WHERE project_id = ? AND activity_log_id = ?';
    try {
      const [rows] = await pool.query(query, [projectId, activityLogId]);
      return rows.length > 0; // Devuelve true si la relación ya existe
    } catch (error) {
      throw error;
    }
  }

  // Método para agregar una actividad realizada a un proyecto
  async addActivityLogToProject(projectId, activityLogId) {
    // Verificar si el proyecto existe
    const projectExists = await this.projectExists(projectId);
    if (!projectExists) {
      throw new Error('El proyecto no existe');
    }

    // Verificar si la actividad realizada existe
    const activityLogExists = await this.activityLogExists(activityLogId);
    if (!activityLogExists) {
      throw new Error('La actividad realizada no existe');
    }

    // Verificar si la relación ya existe
    const relationExists = await this.relationExists(projectId, activityLogId);
    if (relationExists) {
      throw new Error('Esta actividad realizada ya está asociada al proyecto');
    }

    // Si no existe, crear la relación
    const query = 'INSERT INTO project_activity_logs (project_id, activity_log_id) VALUES (?, ?)';
    try {
      const [result] = await pool.query(query, [projectId, activityLogId]);
      return result.insertId; // Devuelve el ID de la nueva relación
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar una actividad realizada de un proyecto
  async removeActivityLog(relationId) {
    const checkQuery = 'SELECT id FROM project_activity_logs WHERE id = ?';
    const [rows] = await pool.query(checkQuery, [relationId]);
    if (rows.length === 0) {
      throw new Error('La relación no existe');
    }
    const deleteQuery = 'DELETE FROM project_activity_logs WHERE id = ?';
    const [result] = await pool.query(deleteQuery, [relationId]);
    return result.affectedRows;
  }

  // Método para obtener la relación entre un proyecto y una actividad realizada
  async getActivityLogRelation(projectId, activityLogId) {
    const query = 'SELECT id FROM project_activity_logs WHERE project_id = ? AND activity_log_id = ?';
    const [rows] = await pool.query(query, [projectId, activityLogId]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Verificar si una relación existe
  async relationExistsId(relationId) {
    const query = 'SELECT id FROM project_activity_logs WHERE id = ?';
    try {
      const [rows] = await pool.query(query, [relationId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }


  // Obtener las actividades realizadas de un proyecto
  async getProjectActivityLogs(projectId) {
    const query = `
      SELECT al.*, a.name AS activity_name
      FROM activity_logs al
      JOIN activities a ON al.activity_id = a.id
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

  // Eliminar la relación entre un proyecto y una actividad realizada
  async removeActivityLogFromProject(relationId) {
    const query = 'DELETE FROM project_activity_logs WHERE id = ?';
    try {
      const [result] = await pool.query(query, [relationId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener el tiempo usado en cada proyecto
  async getTimeUsedByProject() {
    const query = `
      SELECT 
        p.name AS project_name,
        SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(al.end_time, al.start_time)))) AS total_time
      FROM activity_logs al
      JOIN project_activity_logs pal ON al.id = pal.activity_log_id
      JOIN projects p ON pal.project_id = p.id
      GROUP BY p.name
    `;
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProjectsModel();