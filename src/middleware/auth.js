const jwt = require('jsonwebtoken');
const database = require('../config/database');

// Middleware de autenticación JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Verificar que el usuario existe y está activo
    const usuario = await database.getClient().usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        estado: true,
        rol: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (usuario.estado !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar usuario a la request
    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const userRole = req.user.rol;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario accede a sus propios recursos
const requireOwnership = (resourceParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const resourceUserId = req.params[resourceParam] || req.body[resourceParam];
    const currentUserId = req.user.id;

    // Administradores pueden acceder a cualquier recurso
    if (req.user.rol === 'administrador') {
      return next();
    }

    // Usuarios solo pueden acceder a sus propios recursos
    if (resourceUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes acceder a tus propios recursos'
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const usuario = await database.getClient().usuario.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          nombre: true,
          email: true,
          estado: true,
          rol: true
        }
      });

      if (usuario && usuario.estado === 'activo') {
        req.user = usuario;
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }

  next();
};

// Generar token JWT
const generateToken = (userId, email, rol) => {
  return jwt.sign(
    { userId, email, rol },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Generar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  optionalAuth,
  generateToken,
  generateRefreshToken
};
