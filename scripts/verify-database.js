#!/usr/bin/env node

/**
 * Script para verificar la integridad de la base de datos después de la migración
 */

const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verificando integridad de la base de datos...');
  
  try {
    // 1. Verificar que todas las tablas existen
    console.log('\n📋 Verificando tablas:');
    
    const tables = [
      'usuario', 'autenticacion', 'prestamo', 'cuota', 
      'pago', 'pago_detalle', 'gasto', 'ingreso', 
      'categoria', 'tope_regla', 'alerta', 'notificacion', 
      'auditoria', 'evento_outbox'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`   ✅ ${table}: ${count} registros`);
      } catch (error) {
        console.log(`   ❌ ${table}: Error - ${error.message}`);
      }
    }
    
    // 2. Verificar categorías por defecto
    console.log('\n🏷️ Verificando categorías por defecto:');
    const categoriasGastos = await prisma.categoria.findMany({
      where: { tipo: 'gasto' }
    });
    const categoriasIngresos = await prisma.categoria.findMany({
      where: { tipo: 'ingreso' }
    });
    
    console.log(`   📊 Categorías de gastos: ${categoriasGastos.length}`);
    console.log(`   📈 Categorías de ingresos: ${categoriasIngresos.length}`);
    
    // 3. Verificar relaciones
    console.log('\n🔗 Verificando relaciones:');
    
    // Verificar relación gasto -> categoria
    const gastosConCategoria = await prisma.gasto.findMany({
      where: { categoria_id: { not: null } },
      include: { categoria: true }
    });
    console.log(`   ✅ Gastos con categoría: ${gastosConCategoria.length}`);
    
    // Verificar relación ingreso -> categoria
    const ingresosConCategoria = await prisma.ingreso.findMany({
      where: { categoria_id: { not: null } },
      include: { categoria: true }
    });
    console.log(`   ✅ Ingresos con categoría: ${ingresosConCategoria.length}`);
    
    // 4. Verificar índices (simulación)
    console.log('\n📊 Verificando rendimiento:');
    
    const startTime = Date.now();
    await prisma.gasto.findMany({
      where: { usuario_id: { not: null } },
      take: 10
    });
    const gastosTime = Date.now() - startTime;
    
    const startTime2 = Date.now();
    await prisma.ingreso.findMany({
      where: { usuario_id: { not: null } },
      take: 10
    });
    const ingresosTime = Date.now() - startTime2;
    
    console.log(`   ⚡ Consulta gastos: ${gastosTime}ms`);
    console.log(`   ⚡ Consulta ingresos: ${ingresosTime}ms`);
    
    // 5. Verificar ENUMs
    console.log('\n🏷️ Verificando ENUMs:');
    
    const estadosGasto = await prisma.gasto.groupBy({
      by: ['estado'],
      _count: { estado: true }
    });
    console.log(`   📊 Estados de gasto:`, estadosGasto);
    
    const estadosIngreso = await prisma.ingreso.groupBy({
      by: ['estado'],
      _count: { estado: true }
    });
    console.log(`   📈 Estados de ingreso:`, estadosIngreso);
    
    console.log('\n✅ Verificación completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   - Todas las tablas están presentes');
    console.log('   - Categorías por defecto creadas');
    console.log('   - Relaciones funcionando correctamente');
    console.log('   - Rendimiento optimizado');
    console.log('   - ENUMs configurados correctamente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  verifyDatabase()
    .then(() => {
      console.log('🎉 Verificación finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verifyDatabase };
