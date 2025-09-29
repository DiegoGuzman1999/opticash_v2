const usuarioService = require('../services/usuarioService');

class UsuarioController {
  // Crear usuario
  async crearUsuario(req, res) {
    try {
      const resultado = await usuarioService.crearUsuario(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Autenticar usuario
  async autenticarUsuario(req, res) {
    try {
      const { email, password } = req.body;
      const resultado = await usuarioService.autenticarUsuario(email, password);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener perfil del usuario autenticado
  async obtenerPerfil(req, res) {
    try {
      const resultado = await usuarioService.obtenerUsuarioPorId(req.user.id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener usuario por ID (admin)
  async obtenerUsuarioPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await usuarioService.obtenerUsuarioPorId(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Listar usuarios
  async listarUsuarios(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const resultado = await usuarioService.listarUsuarios(
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

  // Actualizar perfil del usuario autenticado
  async actualizarPerfil(req, res) {
    try {
      const { id } = req.user;
      const { nombre, email } = req.body;
      
      const resultado = await usuarioService.actualizarUsuario(id, {
        nombre,
        email
      });
      
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar usuario (admin)
  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const resultado = await usuarioService.actualizarUsuario(id, req.body);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Eliminar usuario
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      const resultado = await usuarioService.eliminarUsuario(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener estadísticas de usuarios (admin)
  async obtenerEstadisticas(req, res) {
    try {
      const database = require('../config/database');
      const prisma = database.getClient();

      const [
        totalUsuarios,
        usuariosActivos,
        usuariosInactivos,
        usuariosPorRol
      ] = await Promise.all([
        prisma.usuario.count(),
        prisma.usuario.count({ where: { estado: 'activo' } }),
        prisma.usuario.count({ where: { estado: 'inactivo' } }),
        prisma.usuario.groupBy({
          by: ['rol'],
          _count: { rol: true }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsuarios,
          usuariosActivos,
          usuariosInactivos,
          usuariosPorRol
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

module.exports = new UsuarioController();
