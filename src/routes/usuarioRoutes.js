const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateUsuario, 
  validateUUID, 
  validatePagination, 
  validateSearch 
} = require('../middleware/validation');

// Rutas públicas
router.post('/registro', validateUsuario, usuarioController.crearUsuario);
router.post('/login', usuarioController.autenticarUsuario);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Perfil del usuario autenticado
router.get('/perfil', usuarioController.obtenerPerfil);
router.put('/perfil', usuarioController.actualizarPerfil);

// Resumen personal
// router.get('/resumen', usuarioController.obtenerResumenPrestamos); // TODO: Implementar método

// Rutas de administración (requieren rol admin)
router.get('/admin/usuarios', 
  requireRole('administrador'), 
  validatePagination, 
  validateSearch, 
  usuarioController.listarUsuarios
);

router.get('/admin/usuarios/:id', 
  requireRole('administrador'), 
  validateUUID, 
  usuarioController.obtenerUsuarioPorId
);

router.put('/admin/usuarios/:id', 
  requireRole('administrador'), 
  validateUUID, 
  validateUsuario, 
  usuarioController.actualizarUsuario
);

router.delete('/admin/usuarios/:id', 
  requireRole('administrador'), 
  validateUUID, 
  usuarioController.eliminarUsuario
);

router.get('/admin/estadisticas', 
  requireRole('administrador'), 
  usuarioController.obtenerEstadisticas
);

module.exports = router;
