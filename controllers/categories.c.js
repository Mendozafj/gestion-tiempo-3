const categoriesModel = require("../models/categories.m");

class CategoriesController {
  async register(data) {
    const { name, description } = data;
    if (!name || !description) {
      return { error: "Todos los campos son requeridos." };
    }

    try {
      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await categoriesModel.showByName(name);
      if (existingCategory) {
        return { error: "El nombre de la categoría ya está en uso." };
      }

      const newCategory = { name, description };
      await categoriesModel.register(newCategory);

      return { success: true };
    } catch (error) {
      return { error: `Error al registrar categoría: ${error.message}` };
    }
  }

  async show() {
    try {
      const categories = await categoriesModel.show();
      return categories;
    } catch (err) {
      throw new Error(`Error al listar categorías: ${err}`);
    }
  }

  async showByID(id) {
    try {
      const category = await categoriesModel.showByID(id);
      if (!category) {
        return false;
      }
      return category;
    } catch (err) {
      throw new Error(`Error al buscar categoría: ${err}`);
    }
  }

  async update(id, data) {
    const { name, description } = data;

    try {
      const category = await categoriesModel.showByID(id);
      if (!category) {
        return { error: `No se encontró la categoría con id: ${id}` };
      }

      // Verificar si el nuevo nombre ya está en uso por otra categoría (excluyendo la actual)
      if (name) {
        const existingCategory = await categoriesModel.showByNameExcludingID(name, id);
        if (existingCategory) {
          return { error: "El nombre de la categoría ya está en uso por otra categoría." };
        }
      }

      const updatedCategory = {
        name: name || category.name,
        description: description || category.description
      };

      await categoriesModel.edit(updatedCategory, id);

      return { success: true };
    } catch (err) {
      throw new Error(`Error al editar la categoría: ${err}`);
    }
  }

  async delete(id) {
    try {
      const category = await categoriesModel.showByID(id);
      if (!category) {
        return { error: `No se encontró la categoría con id: ${id}` };
      }

      await categoriesModel.delete(id);
      return { success: true };
    } catch (err) {
      throw new Error(`Error al eliminar categoría: ${err}`);
    }
  }

  // Mostrar información sobre el tiempo usado en cada categoría
  async getTimeUsedByCategory() {
    try {
      // Obtener el tiempo usado por categoría
      const timeUsedByCategory = await categoriesModel.getTimeUsedByCategory();
      return timeUsedByCategory;
    } catch (error) {
      throw new Error(`Error al obtener el tiempo usado por categoría: ${error.message}`);
    }
  }
}

module.exports = new CategoriesController();