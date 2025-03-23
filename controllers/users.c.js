const usersModel = require("../models/users.m");
const projectsModel = require("../models/projects.m");
const habitsModel = require("../models/habits.m");

class UsersController {
  async register(data) {
    const { name, username, password, role = "user" } = data;
    if (!name || !username || !password) {
      return { error: "Todos los campos son requeridos." };
    }

    try {
      const userByUsername = await usersModel.showByUsername(username);
      if (userByUsername) {
        return { error: "El nombre de usuario ya está en uso." };
      }

      const newUser = { name, username, password, role };
      await usersModel.register(newUser);

      return { success: true };
    } catch (error) {
      return { error: `Error al registrar usuario: ${error.message}` };
    }
  }

  async show() {
    try {
      const users = await usersModel.show();
      return users;
    } catch (err) {
      throw new Error(`Error al listar usuarios: ${err}`);
    }
  }

  async showByID(id) {
    try {
      const user = await usersModel.showByID(id);
      if (!user) {
        return false;
      }
      return user;
    } catch (err) {
      throw new Error(`Error al buscar usuario: ${err}`);
    }
  }

  async showByUsername(username) {
    try {
      const user = await usersModel.showByUsername(username);
      return user;
    } catch (err) {
      throw new Error(`Error al buscar usuario: ${err}`);
    }
  }

  async update(id, data) {
    const { name, username, password, role = "user" } = data;

    try {
      const user = await usersModel.showByID(id);
      if (!user) {
        return { error: `No se encontró el usuario con id: ${id}` };
      }

      if (username) {
        const existingUser = await usersModel.showByUsernameExcludingID(username, id);
        if (existingUser) {
          return { error: "El nombre de usuario ya está en uso por otro usuario." };
        }
      }

      const updatedUser = {
        name: name || user.name,
        username: username || user.username,
        password: password || user.password,
        role: role || user.role
      };

      await usersModel.edit(updatedUser, id);

      return { success: true };
    } catch (err) {
      throw new Error(`Error al editar el usuario: ${err}`);
    }
  }

  async delete(id) {
    try {
      const user = await usersModel.showByID(id);
      if (!user) {
        return { error: `No se encontró el usuario con id: ${id}` };
      }

      await usersModel.delete(id);
      return { success: true };
    } catch (err) {
      throw new Error(`Error al eliminar usuario: ${err}`);
    }
  }

  // Relacionar un proyecto con un usuario
  async addProjectToUser(userId, projectId) {
    try {
      // Verificar si el usuario existe
      const userExists = await usersModel.showByID(userId);
      if (!userExists) {
        return { error: `El usuario con id ${userId} no existe` };
      }

      // Verificar si el proyecto existe
      const projectExists = await projectsModel.projectExists(projectId);
      if (!projectExists) {
        return { error: `El proyecto con id ${projectId} no existe` };
      }

      // Verificar si la relación ya existe
      const relationExists = await usersModel.relationExists(userId, projectId, 'project');
      if (relationExists) {
        return { error: 'Este proyecto ya está asociado al usuario' };
      }

      // Crear la relación
      const relationId = await usersModel.addProjectToUser(userId, projectId);
      return { id: relationId };
    } catch (error) {
      return { error: `Error al relacionar proyecto con usuario: ${error.message}` };
    }
  }

  // Relacionar un hábito con un usuario
  async addHabitToUser(userId, habitId) {
    try {
      // Verificar si el usuario existe
      const userExists = await usersModel.showByID(userId);
      if (!userExists) {
        return { error: `El usuario con id ${userId} no existe` };
      }

      // Verificar si el hábito existe
      const habitExists = await habitsModel.habitExists(habitId);
      if (!habitExists) {
        return { error: `El hábito con id ${habitId} no existe` };
      }

      // Verificar si la relación ya existe
      const relationExists = await usersModel.relationExists(userId, habitId, 'habit');
      if (relationExists) {
        return { error: 'Este hábito ya está asociado al usuario' };
      }

      // Crear la relación
      const relationId = await usersModel.addHabitToUser(userId, habitId);
      return { id: relationId };
    } catch (error) {
      return { error: `Error al relacionar hábito con usuario: ${error.message}` };
    }
  }

  // Obtener los proyectos de un usuario
  async getUserProjects(userId) {
    try {
      const projects = await usersModel.getUserProjects(userId);
      return projects;
    } catch (error) {
      throw new Error(`Error al obtener proyectos del usuario: ${error.message}`);
    }
  }

  // Obtener los hábitos de un usuario
  async getUserHabits(userId) {
    try {
      const habits = await usersModel.getUserHabits(userId);
      return habits;
    } catch (error) {
      throw new Error(`Error al obtener hábitos del usuario: ${error.message}`);
    }
  }

  // Eliminar la relación entre un proyecto y un usuario
  async removeProjectFromUser(relationId) {
    try {
      // Verificar si la relación existe
      const relationExists = await usersModel.relationExistsById(relationId, 'project');
      if (!relationExists) {
        return { error: `La relación con id ${relationId} no existe` };
      }

      // Eliminar la relación
      await usersModel.removeProjectFromUser(relationId);
      return { success: true };
    } catch (error) {
      return { error: `Error al eliminar relación entre proyecto y usuario: ${error.message}` };
    }
  }

  // Eliminar la relación entre un hábito y un usuario
  async removeHabitFromUser(relationId) {
    try {
      // Verificar si la relación existe
      const relationExists = await usersModel.relationExistsById(relationId, 'habit');
      if (!relationExists) {
        return { error: `La relación con id ${relationId} no existe` };
      }

      // Eliminar la relación
      await usersModel.removeHabitFromUser(relationId);
      return { success: true };
    } catch (error) {
      return { error: `Error al eliminar relación entre hábito y usuario: ${error.message}` };
    }
  }
}

module.exports = new UsersController();