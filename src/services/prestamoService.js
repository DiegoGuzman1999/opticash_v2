const database = require('../config/database');

class PrestamoService {
  constructor() {
    this.prisma = database.getClient();
  }

  // Crear nuevo préstamo
  async crearPrestamo(prestamoData) {
    try {
      const { usuario_id, monto, plazo_meses, calendario, tipo_prestamo } = prestamoData;

      // Verificar que el usuario existe y está activo
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuario_id }
      });

      if (!usuario || usuario.estado !== 'activo') {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Crear préstamo
      const nuevoPrestamo = await this.prisma.prestamo.create({
        data: {
          usuario_id,
          monto,
          plazo_meses,
          calendario,
          tipo_prestamo,
          estado: 'activo'
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      });

      // Generar cuotas del préstamo
      await this.generarCuotas(nuevoPrestamo.id, monto, plazo_meses, calendario);

      return {
        success: true,
        data: nuevoPrestamo,
        message: 'Préstamo creado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al crear préstamo: ${error.message}`);
    }
  }

  // Generar cuotas del préstamo
  async generarCuotas(prestamoId, monto, plazoMeses, calendario) {
    try {
      const cuotas = [];
      const montoCuota = monto / plazoMeses;
      const fechaInicio = new Date();

      for (let i = 0; i < plazoMeses; i++) {
        const fechaVencimiento = new Date(fechaInicio);
        
        switch (calendario) {
          case 'mensual':
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i + 1);
            break;
          case 'quincenal':
            fechaVencimiento.setDate(fechaVencimiento.getDate() + (i + 1) * 15);
            break;
          case 'semanal':
            fechaVencimiento.setDate(fechaVencimiento.getDate() + (i + 1) * 7);
            break;
        }

        cuotas.push({
          prestamo_id: prestamoId,
          vencimiento: fechaVencimiento,
          monto: montoCuota,
          saldo_pendiente: montoCuota,
          estado: 'activo'
        });
      }

      await this.prisma.cuota.createMany({
        data: cuotas
      });

      return cuotas;
    } catch (error) {
      throw new Error(`Error al generar cuotas: ${error.message}`);
    }
  }

  // Obtener préstamo por ID
  async obtenerPrestamoPorId(id) {
    try {
      const prestamo = await this.prisma.prestamo.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          cuota: {
            orderBy: { vencimiento: 'asc' }
          }
        }
      });

      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      return {
        success: true,
        data: prestamo
      };
    } catch (error) {
      throw new Error(`Error al obtener préstamo: ${error.message}`);
    }
  }

  // Listar préstamos con paginación
  async listarPrestamos(page = 1, limit = 10, search = '', usuarioId = null) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        ...(usuarioId && { usuario_id: usuarioId }),
        ...(search && {
          OR: [
            { tipo_prestamo: { contains: search, mode: 'insensitive' } },
            { usuario: { nombre: { contains: search, mode: 'insensitive' } } }
          ]
        })
      };

      const [prestamos, total] = await Promise.all([
        this.prisma.prestamo.findMany({
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
            cuota: {
              select: {
                id: true,
                vencimiento: true,
                monto: true,
                saldo_pendiente: true,
                estado: true
              }
            }
          },
          orderBy: { creado_en: 'desc' }
        }),
        this.prisma.prestamo.count({ where })
      ]);

      return {
        success: true,
        data: {
          prestamos,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al listar préstamos: ${error.message}`);
    }
  }

  // Actualizar estado del préstamo
  async actualizarEstadoPrestamo(id, nuevoEstado) {
    try {
      const estadosValidos = ['activo', 'pagado', 'vencido'];
      
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado inválido');
      }

      const prestamo = await this.prisma.prestamo.findUnique({
        where: { id }
      });

      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      const prestamoActualizado = await this.prisma.prestamo.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          actualizado_en: new Date()
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        data: prestamoActualizado,
        message: 'Estado del préstamo actualizado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al actualizar préstamo: ${error.message}`);
    }
  }

  // Obtener resumen de préstamos por usuario
  async obtenerResumenPrestamos(usuarioId) {
    try {
      const [prestamosActivos, prestamosPagados, prestamosVencidos] = await Promise.all([
        this.prisma.prestamo.count({
          where: { usuario_id: usuarioId, estado: 'activo' }
        }),
        this.prisma.prestamo.count({
          where: { usuario_id: usuarioId, estado: 'pagado' }
        }),
        this.prisma.prestamo.count({
          where: { usuario_id: usuarioId, estado: 'vencido' }
        })
      ]);

      const montoTotalActivo = await this.prisma.prestamo.aggregate({
        where: { usuario_id: usuarioId, estado: 'activo' },
        _sum: { monto: true }
      });

      return {
        success: true,
        data: {
          prestamosActivos,
          prestamosPagados,
          prestamosVencidos,
          montoTotalActivo: montoTotalActivo._sum.monto || 0
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }
}

module.exports = new PrestamoService();
