const pagoService = require('../services/pagoService');

class PagoController {
  // Procesar pago
  async procesarPago(req, res) {
    try {
      const pagoData = {
        ...req.body,
        usuario_id: req.user.id // Usuario autenticado
      };
      
      const resultado = await pagoService.procesarPago(pagoData);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener pago por ID
  async obtenerPagoPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await pagoService.obtenerPagoPorId(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Listar pagos del usuario autenticado
  async listarMisPagos(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const resultado = await pagoService.listarPagos(
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

  // Listar todos los pagos (admin)
  async listarTodosPagos(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const resultado = await pagoService.listarPagos(
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

  // Obtener historial de pagos del usuario
  async obtenerHistorialPagos(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const resultado = await pagoService.obtenerHistorialPagos(
        req.user.id,
        fecha_inicio,
        fecha_fin
      );
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener cuotas pendientes del usuario
  async obtenerCuotasPendientes(req, res) {
    try {
      const resultado = await pagoService.obtenerCuotasPendientes(req.user.id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener estadísticas de pagos (admin)
  async obtenerEstadisticasPagos(req, res) {
    try {
      const database = require('../config/database');
      const prisma = database.getClient();

      const [
        totalPagos,
        montoTotalRecaudado,
        pagosHoy,
        pagosEsteMes,
        pagosPorEstado
      ] = await Promise.all([
        prisma.pago.count(),
        prisma.pago.aggregate({
          _sum: { monto_total: true }
        }),
        prisma.pago.count({
          where: {
            creado_en: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.pago.count({
          where: {
            creado_en: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.pago.groupBy({
          by: ['estado'],
          _count: { estado: true }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalPagos,
          montoTotalRecaudado: montoTotalRecaudado._sum.monto_total || 0,
          pagosHoy,
          pagosEsteMes,
          pagosPorEstado
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener resumen de pagos del usuario
  async obtenerResumenPagos(req, res) {
    try {
      const database = require('../config/database');
      const prisma = database.getClient();
      const usuarioId = req.user.id;

      const [
        totalPagos,
        montoTotalPagado,
        pagosEsteMes,
        cuotasPendientes
      ] = await Promise.all([
        prisma.pago.count({ where: { usuario_id: usuarioId } }),
        prisma.pago.aggregate({
          where: { usuario_id: usuarioId },
          _sum: { monto_total: true }
        }),
        prisma.pago.count({
          where: {
            usuario_id: usuarioId,
            creado_en: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.cuota.count({
          where: {
            prestamo: { usuario_id: usuarioId },
            estado: 'activo'
          }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalPagos,
          montoTotalPagado: montoTotalPagado._sum.monto_total || 0,
          pagosEsteMes,
          cuotasPendientes
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

module.exports = new PagoController();
