const { PrismaClient } = require('../../generated/prisma');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Controlador para gestión de ingresos
 */
class IncomeController {
  
  /**
   * Obtener todos los ingresos del usuario autenticado
   */
  async getIncomes(req, res) {
    try {
      const { page = 1, limit = 10, search, category, start_date, end_date } = req.query;
      const userId = req.user.id;
      
      // Construir filtros
      const where = {
        usuario_id: userId,
        estado: 'activo'
      };

      if (search) {
        where.descripcion = {
          contains: search,
          mode: 'insensitive'
        };
      }

      if (category) {
        where.categoria_id = category;
      }

      if (start_date || end_date) {
        where.fecha_ingreso = {};
        if (start_date) where.fecha_ingreso.gte = new Date(start_date);
        if (end_date) where.fecha_ingreso.lte = new Date(end_date);
      }

      // Calcular offset para paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Obtener ingresos con paginación
      const [ingresos, total] = await Promise.all([
        prisma.ingreso.findMany({
          where,
          include: {
            categoria: {
              select: {
                id: true,
                nombre: true,
                descripcion: true
              }
            }
          },
          orderBy: { fecha_ingreso: 'desc' },
          skip: offset,
          take: parseInt(limit)
        }),
        prisma.ingreso.count({ where })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          ingresos,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        },
        message: 'Ingresos obtenidos exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener ingresos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener un ingreso específico por ID
   */
  async getIncomeById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const ingreso = await prisma.ingreso.findFirst({
        where: {
          id,
          usuario_id: userId,
          estado: 'activo'
        },
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      });

      if (!ingreso) {
        return res.status(404).json({
          success: false,
          message: 'Ingreso no encontrado'
        });
      }

      res.json({
        success: true,
        data: ingreso,
        message: 'Ingreso obtenido exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener ingreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo ingreso
   */
  async createIncome(req, res) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { descripcion, categoria_id, monto, fecha_ingreso } = req.body;
      const userId = req.user.id;

      // Verificar que la categoría existe y es de tipo 'ingreso'
      const categoria = await prisma.categoria.findFirst({
        where: {
          id: categoria_id,
          tipo: 'ingreso',
          activa: true
        }
      });

      if (!categoria) {
        return res.status(400).json({
          success: false,
          message: 'Categoría de ingreso no válida'
        });
      }

      // Crear el ingreso
      const ingreso = await prisma.ingreso.create({
        data: {
          usuario_id: userId,
          descripcion,
          categoria_id,
          monto: parseFloat(monto),
          fecha_ingreso: new Date(fecha_ingreso),
          estado: 'activo'
        },
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: ingreso,
        message: 'Ingreso creado exitosamente'
      });

    } catch (error) {
      console.error('Error al crear ingreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar un ingreso existente
   */
  async updateIncome(req, res) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { descripcion, categoria_id, monto, fecha_ingreso } = req.body;
      const userId = req.user.id;

      // Verificar que el ingreso existe y pertenece al usuario
      const ingresoExistente = await prisma.ingreso.findFirst({
        where: {
          id,
          usuario_id: userId,
          estado: 'activo'
        }
      });

      if (!ingresoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Ingreso no encontrado'
        });
      }

      // Verificar categoría si se proporciona
      if (categoria_id) {
        const categoria = await prisma.categoria.findFirst({
          where: {
            id: categoria_id,
            tipo: 'ingreso',
            activa: true
          }
        });

        if (!categoria) {
          return res.status(400).json({
            success: false,
            message: 'Categoría de ingreso no válida'
          });
        }
      }

      // Actualizar el ingreso
      const ingreso = await prisma.ingreso.update({
        where: { id },
        data: {
          ...(descripcion && { descripcion }),
          ...(categoria_id && { categoria_id }),
          ...(monto && { monto: parseFloat(monto) }),
          ...(fecha_ingreso && { fecha_ingreso: new Date(fecha_ingreso) }),
          estado: 'modificado'
        },
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: ingreso,
        message: 'Ingreso actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar ingreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar un ingreso (soft delete)
   */
  async deleteIncome(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar que el ingreso existe y pertenece al usuario
      const ingresoExistente = await prisma.ingreso.findFirst({
        where: {
          id,
          usuario_id: userId,
          estado: 'activo'
        }
      });

      if (!ingresoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Ingreso no encontrado'
        });
      }

      // Soft delete - cambiar estado a 'eliminado'
      await prisma.ingreso.update({
        where: { id },
        data: { estado: 'eliminado' }
      });

      res.json({
        success: true,
        message: 'Ingreso eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar ingreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de ingresos del usuario
   */
  async getIncomeStats(req, res) {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      // Construir filtros de fecha
      const where = {
        usuario_id: userId,
        estado: 'activo'
      };

      if (start_date || end_date) {
        where.fecha_ingreso = {};
        if (start_date) where.fecha_ingreso.gte = new Date(start_date);
        if (end_date) where.fecha_ingreso.lte = new Date(end_date);
      }

      // Obtener estadísticas
      const [
        totalIngresos,
        ingresosPorCategoria,
        ingresosPorMes
      ] = await Promise.all([
        // Total de ingresos
        prisma.ingreso.aggregate({
          where,
          _sum: { monto: true },
          _count: { id: true }
        }),
        
        // Ingresos por categoría
        prisma.ingreso.groupBy({
          by: ['categoria_id'],
          where,
          _sum: { monto: true },
          _count: { id: true }
        }),
        
        // Ingresos por mes (últimos 12 meses)
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', fecha_ingreso) as mes,
            SUM(monto) as total,
            COUNT(*) as cantidad
          FROM ingreso 
          WHERE usuario_id = ${userId} 
            AND estado = 'activo'
            ${start_date ? `AND fecha_ingreso >= ${new Date(start_date)}` : ''}
            ${end_date ? `AND fecha_ingreso <= ${new Date(end_date)}` : ''}
          GROUP BY DATE_TRUNC('month', fecha_ingreso)
          ORDER BY mes DESC
          LIMIT 12
        `
      ]);

      // Obtener nombres de categorías
      const categoriasConNombres = await Promise.all(
        ingresosPorCategoria.map(async (grupo) => {
          const categoria = await prisma.categoria.findUnique({
            where: { id: grupo.categoria_id },
            select: { nombre: true }
          });
          return {
            categoria: categoria.nombre,
            total: grupo._sum.monto,
            cantidad: grupo._count.id
          };
        })
      );

      res.json({
        success: true,
        data: {
          total: totalIngresos._sum.monto || 0,
          cantidad: totalIngresos._count.id || 0,
          porCategoria: categoriasConNombres,
          porMes: ingresosPorMes
        },
        message: 'Estadísticas de ingresos obtenidas exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de ingresos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new IncomeController();
