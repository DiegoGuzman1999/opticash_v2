require('dotenv').config();
const express = require('express');
const database = require('./config/database');

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await database.healthCheck();
  res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
    server: 'running',
    database: dbHealth
  });
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor OptiCash v2 funcionando 🚀',
    version: '1.0.0',
    status: 'active'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

const PORT = process.env.PORT || 4000;

// Iniciar servidor con manejo de conexión a BD
async function startServer() {
  try {
    // Conectar a la base de datos
    await database.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor OptiCash v2 escuchando en puerto ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await database.disconnect();
  process.exit(0);
});

// Iniciar aplicación
startServer();
