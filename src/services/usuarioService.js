const database = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

class UsuarioService {
  constructor() {
    this.prisma = database.getClient();
  }

  // Crear nuevo usuario
  async crearUsuario(usuarioData) {
    try {
      const { nombre, email, password, rol = 'usuario' } = usuarioData;

      // Verificar si el email ya existe
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { email }
      });

      if (usuarioExistente) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const nuevoUsuario = await this.prisma.usuario.create({
        data: {
          nombre,
          email,
          estado: 'activo',
          rol,
          autenticacion: {
            create: {
              proveedor: 'local',
              hash_password: hashedPassword
            }
          }
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          estado: true,
          rol: true,
          creado_en: true
        }
      });

      return {
        success: true,
        data: nuevoUsuario,
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Autenticar usuario
  async autenticarUsuario(email, password) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { email },
        include: {
          autenticacion: true
        }
      });

      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      if (usuario.estado !== 'activo') {
        throw new Error('Usuario inactivo');
      }

      const authData = usuario.autenticacion.find(auth => auth.proveedor === 'local');
      if (!authData) {
        throw new Error('Método de autenticación no disponible');
      }

      const passwordMatch = await bcrypt.compare(password, authData.hash_password);
      if (!passwordMatch) {
        throw new Error('Credenciales inválidas');
      }

      // Generar tokens
      const token = generateToken(usuario.id, usuario.email, usuario.rol);
      const refreshToken = generateRefreshToken(usuario.id);

      // Actualizar último login
      await this.prisma.autenticacion.update({
        where: { id: authData.id },
        data: { ultimo_login: new Date() }
      });

      return {
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          },
          token,
          refreshToken
        },
        message: 'Autenticación exitosa'
      };
    } catch (error) {
      throw new Error(`Error en autenticación: ${error.message}`);
    }
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          email: true,
          estado: true,
          rol: true,
          creado_en: true,
          actualizado_en: true
        }
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        data: usuario
      };
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // Listar usuarios con paginación
  async listarUsuarios(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [usuarios, total] = await Promise.all([
        this.prisma.usuario.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            nombre: true,
            email: true,
            estado: true,
            rol: true,
            creado_en: true
          },
          orderBy: { creado_en: 'desc' }
        }),
        this.prisma.usuario.count({ where })
      ]);

      return {
        success: true,
        data: {
          usuarios,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al listar usuarios: ${error.message}`);
    }
  }

  // Actualizar usuario
  async actualizarUsuario(id, updateData) {
    try {
      const { nombre, email, estado, rol } = updateData;

      // Verificar si el usuario existe
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar email único si se está cambiando
      if (email && email !== usuarioExistente.email) {
        const emailExistente = await this.prisma.usuario.findUnique({
          where: { email }
        });

        if (emailExistente) {
          throw new Error('El email ya está en uso');
        }
      }

      const usuarioActualizado = await this.prisma.usuario.update({
        where: { id },
        data: {
          ...(nombre && { nombre }),
          ...(email && { email }),
          ...(estado && { estado }),
          ...(rol && { rol }),
          actualizado_en: new Date()
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          estado: true,
          rol: true,
          actualizado_en: true
        }
      });

      return {
        success: true,
        data: usuarioActualizado,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // Eliminar usuario (soft delete)
  async eliminarUsuario(id) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      await this.prisma.usuario.update({
        where: { id },
        data: {
          estado: 'inactivo',
          actualizado_en: new Date()
        }
      });

      return {
        success: true,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = new UsuarioService();
