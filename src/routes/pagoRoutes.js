const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validatePago, 
  validateUUID, 
  validatePagination, 
  validateSearch 
} = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas del usuario autenticado
router.post('/', validatePago, pagoController.procesarPago);
router.get('/mis-pagos', 
  validatePagination, 
  validateSearch, 
  pagoController.listarMisPagos
);
router.get('/historial', pagoController.obtenerHistorialPagos);
router.get('/cuotas-pendientes', pagoController.obtenerCuotasPendientes);
router.get('/resumen', pagoController.obtenerResumenPagos);
router.get('/:id', validateUUID, pagoController.obtenerPagoPorId);

// Rutas de administración (requieren rol admin)
router.get('/admin/todos', 
  requireRole('administrador'), 
  validatePagination, 
  validateSearch, 
  pagoController.listarTodosPagos
);

router.get('/admin/estadisticas', 
  requireRole('administrador'), 
  pagoController.obtenerEstadisticasPagos
);

module.exports = router;
