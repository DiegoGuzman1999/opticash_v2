const database = require('../config/database');

class PagoService {
  constructor() {
    this.prisma = database.getClient();
  }

  // Procesar pago
  async procesarPago(pagoData) {
    try {
      const { usuario_id, monto_total, referencia, cuotas_ids } = pagoData;

      // Verificar que el usuario existe
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuario_id }
      });

      if (!usuario || usuario.estado !== 'activo') {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Verificar que las cuotas existen y están activas
      const cuotas = await this.prisma.cuota.findMany({
        where: {
          id: { in: cuotas_ids },
          estado: 'activo'
        },
        include: {
          prestamo: true
        }
      });

      if (cuotas.length !== cuotas_ids.length) {
        throw new Error('Una o más cuotas no son válidas');
      }

      // Verificar que el monto total coincida con la suma de las cuotas
      const montoTotalCuotas = cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.saldo_pendiente), 0);
      if (Math.abs(monto_total - montoTotalCuotas) > 0.01) {
        throw new Error('El monto total no coincide con las cuotas seleccionadas');
      }

      // Generar clave de idempotencia
      const idempotencyKey = `pago_${usuario_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear pago
      const nuevoPago = await this.prisma.pago.create({
        data: {
          usuario_id,
          monto_total,
          referencia,
          estado: 'procesado',
          idempotency_key: idempotencyKey
        }
      });

      // Crear detalles de pago y actualizar cuotas
      const detallesPago = [];
      for (const cuota of cuotas) {
        // Crear detalle de pago
        const detalle = await this.prisma.pago_detalle.create({
          data: {
            pago_id: nuevoPago.id,
            cuota_id: cuota.id,
            monto_aplicado: cuota.saldo_pendiente
          }
        });

        // Actualizar cuota como pagada
        await this.prisma.cuota.update({
          where: { id: cuota.id },
          data: {
            saldo_pendiente: 0,
            estado: 'pagado'
          }
        });

        detallesPago.push(detalle);
      }

      // Verificar si el préstamo está completamente pagado
      await this.verificarPrestamoCompletado(cuotas[0].prestamo_id);

      return {
        success: true,
        data: {
          pago: nuevoPago,
          detalles: detallesPago
        },
        message: 'Pago procesado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al procesar pago: ${error.message}`);
    }
  }

  // Verificar si un préstamo está completamente pagado
  async verificarPrestamoCompletado(prestamoId) {
    try {
      const cuotasPendientes = await this.prisma.cuota.count({
        where: {
          prestamo_id: prestamoId,
          estado: 'activo'
        }
      });

      if (cuotasPendientes === 0) {
        // Actualizar préstamo como pagado
        await this.prisma.prestamo.update({
          where: { id: prestamoId },
          data: {
            estado: 'pagado',
            actualizado_en: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error al verificar préstamo completado:', error);
    }
  }

  // Obtener pago por ID
  async obtenerPagoPorId(id) {
    try {
      const pago = await this.prisma.pago.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          pago_detalle: {
            include: {
              cuota: {
                include: {
                  prestamo: true
                }
              }
            }
          }
        }
      });

      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      return {
        success: true,
        data: pago
      };
    } catch (error) {
      throw new Error(`Error al obtener pago: ${error.message}`);
    }
  }

  // Listar pagos con paginación
  async listarPagos(page = 1, limit = 10, search = '', usuarioId = null) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        ...(usuarioId && { usuario_id: usuarioId }),
        ...(search && {
          OR: [
            { referencia: { contains: search, mode: 'insensitive' } },
            { usuario: { nombre: { contains: search, mode: 'insensitive' } } }
          ]
        })
      };

      const [pagos, total] = await Promise.all([
        this.prisma.pago.findMany({
          where,
          skip,
          take: limit,
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            },
            pago_detalle: {
              include: {
                cuota: {
                  include: {
                    prestamo: true
                  }
                }
              }
            }
          },
          orderBy: { creado_en: 'desc' }
        }),
        this.prisma.pago.count({ where })
      ]);

      return {
        success: true,
        data: {
          pagos,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al listar pagos: ${error.message}`);
    }
  }

  // Obtener historial de pagos por usuario
  async obtenerHistorialPagos(usuarioId, fechaInicio = null, fechaFin = null) {
    try {
      const where = {
        usuario_id: usuarioId,
        ...(fechaInicio && fechaFin && {
          creado_en: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          }
        })
      };

      const pagos = await this.prisma.pago.findMany({
        where,
        include: {
          pago_detalle: {
            include: {
              cuota: {
                include: {
                  prestamo: true
                }
              }
            }
          }
        },
        orderBy: { creado_en: 'desc' }
      });

      // Calcular totales
      const totalPagos = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto_total), 0);
      const totalCuotasPagadas = pagos.reduce((sum, pago) => sum + pago.pago_detalle.length, 0);

      return {
        success: true,
        data: {
          pagos,
          resumen: {
            totalPagos,
            totalCuotasPagadas,
            cantidadPagos: pagos.length
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error.message}`);
    }
  }

  // Obtener cuotas pendientes por usuario
  async obtenerCuotasPendientes(usuarioId) {
    try {
      const cuotasPendientes = await this.prisma.cuota.findMany({
        where: {
          prestamo: {
            usuario_id: usuarioId
          },
          estado: 'activo'
        },
        include: {
          prestamo: {
            select: {
              id: true,
              tipo_prestamo: true,
              monto: true
            }
          }
        },
        orderBy: { vencimiento: 'asc' }
      });

      const montoTotalPendiente = cuotasPendientes.reduce(
        (sum, cuota) => sum + parseFloat(cuota.saldo_pendiente), 
        0
      );

      return {
        success: true,
        data: {
          cuotas: cuotasPendientes,
          montoTotalPendiente,
          cantidadCuotas: cuotasPendientes.length
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener cuotas pendientes: ${error.message}`);
    }
  }
}

module.exports = new PagoService();
