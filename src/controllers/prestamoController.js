const prestamoService = require('../services/prestamoService');

class PrestamoController {
  // Crear préstamo
  async crearPrestamo(req, res) {
    try {
      const prestamoData = {
        ...req.body,
        usuario_id: req.user.id // Usuario autenticado
      };
      
      const resultado = await prestamoService.crearPrestamo(prestamoData);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener préstamo por ID
  async obtenerPrestamoPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await prestamoService.obtenerPrestamoPorId(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Listar préstamos del usuario autenticado
  async listarMisPrestamos(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const resultado = await prestamoService.listarPrestamos(
        parseInt(page),
        parseInt(limit),
        search,
        req.user.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Listar todos los préstamos (admin)
  async listarTodosPrestamos(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const resultado = await prestamoService.listarPrestamos(
        parseInt(page),
        parseInt(limit),
        search
      );
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar estado del préstamo (admin)
  async actualizarEstadoPrestamo(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const resultado = await prestamoService.actualizarEstadoPrestamo(id, estado);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener resumen de préstamos del usuario
  async obtenerResumenPrestamos(req, res) {
    try {
      const resultado = await prestamoService.obtenerResumenPrestamos(req.user.id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener cuotas de un préstamo
  async obtenerCuotasPrestamo(req, res) {
    try {
      const { id } = req.params;
      const database = require('../config/database');
      const prisma = database.getClient();

      const cuotas = await prisma.cuota.findMany({
        where: { prestamo_id: id },
        orderBy: { vencimiento: 'asc' }
      });

      res.status(200).json({
        success: true,
        data: cuotas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener estadísticas de préstamos (admin)
  async obtenerEstadisticasPrestamos(req, res) {
    try {
      const database = require('../config/database');
      const prisma = database.getClient();

      const [
        totalPrestamos,
        prestamosActivos,
        prestamosPagados,
        prestamosVencidos,
        montoTotalPrestado,
        prestamosPorTipo
      ] = await Promise.all([
        prisma.prestamo.count(),
        prisma.prestamo.count({ where: { estado: 'activo' } }),
        prisma.prestamo.count({ where: { estado: 'pagado' } }),
        prisma.prestamo.count({ where: { estado: 'vencido' } }),
        prisma.prestamo.aggregate({
          _sum: { monto: true }
        }),
        prisma.prestamo.groupBy({
          by: ['tipo_prestamo'],
          _count: { tipo_prestamo: true }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalPrestamos,
          prestamosActivos,
          prestamosPagados,
          prestamosVencidos,
          montoTotalPrestado: montoTotalPrestado._sum.monto || 0,
          prestamosPorTipo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PrestamoController();
