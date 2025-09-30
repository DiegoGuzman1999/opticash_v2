const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 * Controlador para gestión de categorías
 */
class CategoryController {
  
  /**
   * Obtener todas las categorías por tipo
   */
  async getCategories(req, res) {
    try {
      const { tipo } = req.query; // 'gasto' o 'ingreso'
      
      const where = {
        activa: true
      };

      if (tipo) {
        where.tipo = tipo;
      }

      const categorias = await prisma.categoria.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          tipo: true,
          descripcion: true,
          activa: true,
          creado_en: true
        },
        orderBy: { nombre: 'asc' }
      });

      res.json({
        success: true,
        data: categorias,
        message: 'Categorías obtenidas exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener una categoría específica por ID
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const categoria = await prisma.categoria.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          descripcion: true,
          activa: true,
          creado_en: true
        }
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      res.json({
        success: true,
        data: categoria,
        message: 'Categoría obtenida exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva categoría (solo administradores)
   */
  async createCategory(req, res) {
    try {
      // Verificar que el usuario es administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: Se requiere rol de administrador'
        });
      }

      const { nombre, tipo, descripcion } = req.body;

      // Verificar que el tipo es válido
      if (!['gasto', 'ingreso'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'El tipo debe ser "gasto" o "ingreso"'
        });
      }

      // Verificar que no existe una categoría con el mismo nombre y tipo
      const categoriaExistente = await prisma.categoria.findFirst({
        where: {
          nombre,
          tipo,
          activa: true
        }
      });

      if (categoriaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con este nombre y tipo'
        });
      }

      const categoria = await prisma.categoria.create({
        data: {
          nombre,
          tipo,
          descripcion,
          activa: true
        }
      });

      res.status(201).json({
        success: true,
        data: categoria,
        message: 'Categoría creada exitosamente'
      });

    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar una categoría existente (solo administradores)
   */
  async updateCategory(req, res) {
    try {
      // Verificar que el usuario es administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: Se requiere rol de administrador'
        });
      }

      const { id } = req.params;
      const { nombre, descripcion, activa } = req.body;

      // Verificar que la categoría existe
      const categoriaExistente = await prisma.categoria.findUnique({
        where: { id }
      });

      if (!categoriaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Verificar que no existe otra categoría con el mismo nombre y tipo
      if (nombre) {
        const categoriaDuplicada = await prisma.categoria.findFirst({
          where: {
            nombre,
            tipo: categoriaExistente.tipo,
            activa: true,
            id: { not: id }
          }
        });

        if (categoriaDuplicada) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con este nombre y tipo'
          });
        }
      }

      const categoria = await prisma.categoria.update({
        where: { id },
        data: {
          ...(nombre && { nombre }),
          ...(descripcion !== undefined && { descripcion }),
          ...(activa !== undefined && { activa })
        }
      });

      res.json({
        success: true,
        data: categoria,
        message: 'Categoría actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar una categoría (soft delete - solo administradores)
   */
  async deleteCategory(req, res) {
    try {
      // Verificar que el usuario es administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: Se requiere rol de administrador'
        });
      }

      const { id } = req.params;

      // Verificar que la categoría existe
      const categoriaExistente = await prisma.categoria.findUnique({
        where: { id }
      });

      if (!categoriaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Verificar que no hay gastos o ingresos usando esta categoría
      const [gastosCount, ingresosCount] = await Promise.all([
        prisma.gasto.count({
          where: {
            categoria_id: id,
            estado: 'activo'
          }
        }),
        prisma.ingreso.count({
          where: {
            categoria_id: id,
            estado: 'activo'
          }
        })
      ]);

      if (gastosCount > 0 || ingresosCount > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${gastosCount + ingresosCount} transacciones asociadas`
        });
      }

      // Soft delete - cambiar estado a inactivo
      await prisma.categoria.update({
        where: { id },
        data: { activa: false }
      });

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de uso de categorías
   */
  async getCategoryStats(req, res) {
    try {
      const { tipo } = req.query;

      const where = {
        activa: true
      };

      if (tipo) {
        where.tipo = tipo;
      }

      const categorias = await prisma.categoria.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          tipo: true,
          descripcion: true
        }
      });

      // Obtener estadísticas de uso para cada categoría
      const categoriasConStats = await Promise.all(
        categorias.map(async (categoria) => {
          const [gastosCount, ingresosCount] = await Promise.all([
            prisma.gasto.count({
              where: {
                categoria_id: categoria.id,
                estado: 'activo'
              }
            }),
            prisma.ingreso.count({
              where: {
                categoria_id: categoria.id,
                estado: 'activo'
              }
            })
          ]);

          return {
            ...categoria,
            uso: {
              gastos: gastosCount,
              ingresos: ingresosCount,
              total: gastosCount + ingresosCount
            }
          };
        })
      );

      res.json({
        success: true,
        data: categoriasConStats,
        message: 'Estadísticas de categorías obtenidas exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new CategoryController();
