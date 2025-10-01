#!/usr/bin/env node

/**
 * Servidor simplificado para probar OptiCash
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Endpoint principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OptiCash API v2 funcionando 🚀',
    version: '1.0.0',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Información de API
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'OptiCash API v2',
      version: '1.0.0',
      description: 'API para gestión financiera personal',
      endpoints: {
        health: '/health',
        info: '/api/info',
        usuarios: '/api/usuarios',
        prestamos: '/api/prestamos',
        pagos: '/api/pagos',
        income: '/api/income',
        categories: '/api/categories'
      }
    },
    message: 'Información de la API obtenida exitosamente'
  });
});

// Categorías (sin autenticación para prueba)
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', nombre: 'Alimentación', tipo: 'gasto', descripcion: 'Gastos en comida' },
      { id: '2', nombre: 'Transporte', tipo: 'gasto', descripcion: 'Gastos de transporte' },
      { id: '3', nombre: 'Salario', tipo: 'ingreso', descripcion: 'Ingresos por trabajo' }
    ],
    message: 'Categorías obtenidas exitosamente'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor OptiCash v2 escuchando en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API: http://localhost:${PORT}/`);
  console.log(`🏷️ Categorías: http://localhost:${PORT}/api/categories`);
});
