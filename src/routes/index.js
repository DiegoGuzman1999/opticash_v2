const express = require('express');
const router = express.Router();

// Importar rutas específicas
const usuarioRoutes = require('./usuarioRoutes');
const prestamoRoutes = require('./prestamoRoutes');
const pagoRoutes = require('./pagoRoutes');

// Middleware de logging para todas las rutas
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Rutas principales
router.use('/usuarios', usuarioRoutes);
router.use('/prestamos', prestamoRoutes);
router.use('/pagos', pagoRoutes);

// Ruta de información de la API
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'OptiCash v2 API',
      version: '1.0.0',
      description: 'API para gestión de préstamos y pagos',
      endpoints: {
        usuarios: '/api/usuarios',
        prestamos: '/api/prestamos',
        pagos: '/api/pagos',
        health: '/api/health'
      },
      documentation: 'https://api.opticash.com/docs',
      support: 'support@opticash.com'
    }
  });
});

// Ruta de estado de la API
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    }
  });
});

// Middleware para rutas no encontradas
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    availableEndpoints: [
      'GET /api/info - Información de la API',
      'GET /api/status - Estado de la API',
      'GET /api/health - Health check',
      'POST /api/usuarios/registro - Registro de usuario',
      'POST /api/usuarios/login - Login de usuario',
      'GET /api/usuarios/perfil - Perfil del usuario',
      'POST /api/prestamos - Crear préstamo',
      'GET /api/prestamos/mis-prestamos - Mis préstamos',
      'POST /api/pagos - Procesar pago',
      'GET /api/pagos/mis-pagos - Mis pagos'
    ]
  });
});

module.exports = router;
