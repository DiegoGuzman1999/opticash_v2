const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validatePrestamo, 
  validateUUID, 
  validatePagination, 
  validateSearch 
} = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas del usuario autenticado
router.post('/', validatePrestamo, prestamoController.crearPrestamo);
router.get('/mis-prestamos', 
  validatePagination, 
  validateSearch, 
  prestamoController.listarMisPrestamos
);
router.get('/resumen', prestamoController.obtenerResumenPrestamos);
router.get('/:id', validateUUID, prestamoController.obtenerPrestamoPorId);
router.get('/:id/cuotas', validateUUID, prestamoController.obtenerCuotasPrestamo);

// Rutas de administración (requieren rol admin)
router.get('/admin/todos', 
  requireRole('administrador'), 
  validatePagination, 
  validateSearch, 
  prestamoController.listarTodosPrestamos
);

router.put('/admin/:id/estado', 
  requireRole('administrador'), 
  validateUUID, 
  prestamoController.actualizarEstadoPrestamo
);

router.get('/admin/estadisticas', 
  requireRole('administrador'), 
  prestamoController.obtenerEstadisticasPrestamos
);

module.exports = router;
