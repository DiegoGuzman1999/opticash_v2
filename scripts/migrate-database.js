#!/usr/bin/env node

/**
 * Script para migrar la base de datos de OptiCash
 * Agrega las tablas faltantes: categoria e ingreso
 */

const { PrismaClient } = require('../generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateDatabase() {
  console.log('🚀 Iniciando migración de base de datos...');
  
  try {
    // 1. Leer el archivo SQL de migración
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/add_missing_tables.sql'), 
      'utf8'
    );
    
    // 2. Ejecutar la migración
    console.log('📝 Ejecutando migración SQL...');
    await prisma.$executeRawUnsafe(migrationSQL);
    
    // 3. Verificar que las tablas se crearon correctamente
    console.log('✅ Verificando tablas creadas...');
    
    const categorias = await prisma.categoria.findMany();
    console.log(`📊 Categorías creadas: ${categorias.length}`);
    
    // 4. Generar el cliente de Prisma actualizado
    console.log('🔄 Generando cliente de Prisma...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Migración completada exitosamente!');
    console.log('📋 Tablas agregadas:');
    console.log('   - categoria (con datos por defecto)');
    console.log('   - ingreso');
    console.log('   - Relaciones actualizadas');
    console.log('   - Índices optimizados');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('🎉 Migración finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
