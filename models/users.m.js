const pool = require('../config/db');
const bcrypt = require('bcrypt');

class UsersModel {
  // Método para registrar un nuevo usuario con contraseña cifrada
  async register(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const query = 'INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)';
    const values = [user.username, user.name, hashedPassword, user.role || 'user'];

    try {
      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar la contraseña
  async verifyPassword(username, password) {
    const user = await this.showByUsername(username);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Método para mostrar todos los usuarios
  async show() {
    const query = 'SELECT * FROM users';

    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar un usuario por su ID
  async showByID(id) {
    const query = 'SELECT * FROM users WHERE id = ?';

    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar un usuario por su nombre de usuario
  async showByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';

    try {
      const [rows] = await pool.query(query, [username]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Método para mostrar un usuario por su nombre de usuario, excluyendo un ID específico
  async showByUsernameExcludingID(username, id) {
    const query = 'SELECT * FROM users WHERE username = ? AND id != ?';

    try {
      const [rows] = await pool.query(query, [username, id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Método para editar un usuario por su ID
  async edit(updatedUser, id) {
    const hashedPassword = await bcrypt.hash(updatedUser.password, 10);
    const query = 'UPDATE users SET username = ?, name = ?, password = ?, role = ? WHERE id = ?';
    const values = [updatedUser.username, updatedUser.name, hashedPassword, updatedUser.role || 'user', id];

    try {
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar un usuario por su ID
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';

    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si una relación existe
  async relationExists(userId, entityId, type) {
    let query;
    if (type === 'project') {
      query = 'SELECT id FROM user_projects WHERE user_id = ? AND project_id = ?';
    } else if (type === 'habit') {
      query = 'SELECT id FROM user_habits WHERE user_id = ? AND habit_id = ?';
    } else {
      throw new Error('Tipo de relación no válido');
    }

    try {
      const [rows] = await pool.query(query, [userId, entityId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para agregar un proyecto a un usuario
  async addProjectToUser(userId, projectId) {
    const query = 'INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)';
    try {
      const [result] = await pool.query(query, [userId, projectId]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para agregar un hábito a un usuario
  async addHabitToUser(userId, habitId) {
    const query = 'INSERT INTO user_habits (user_id, habit_id) VALUES (?, ?)';
    try {
      const [result] = await pool.query(query, [userId, habitId]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener los proyectos de un usuario
  async getUserProjects(userId) {
    const query = `
      SELECT p.* 
      FROM projects p
      JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ?
    `;
    try {
      const [rows] = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener los hábitos de un usuario
  async getUserHabits(userId) {
    const query = `
      SELECT h.* 
      FROM habits h
      JOIN user_habits uh ON h.id = uh.habit_id
      WHERE uh.user_id = ?
    `;
    try {
      const [rows] = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para verificar si una relación existe por su ID
  async relationExistsById(relationId, type) {
    let query;
    if (type === 'project') {
      query = 'SELECT id FROM user_projects WHERE id = ?';
    } else if (type === 'habit') {
      query = 'SELECT id FROM user_habits WHERE id = ?';
    } else {
      throw new Error('Tipo de relación no válido');
    }

    try {
      const [rows] = await pool.query(query, [relationId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar la relación entre un proyecto y un usuario
  async removeProjectFromUser(relationId) {
    const query = 'DELETE FROM user_projects WHERE id = ?';
    try {
      const [result] = await pool.query(query, [relationId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar la relación entre un hábito y un usuario
  async removeHabitFromUser(relationId) {
    const query = 'DELETE FROM user_habits WHERE id = ?';
    try {
      const [result] = await pool.query(query, [relationId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UsersModel();