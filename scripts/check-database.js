#!/usr/bin/env node

/**
 * Script para verificar la conexión a PostgreSQL
 */

const { PrismaClient } = require('../generated/prisma');

async function checkDatabase() {
  console.log('🔍 Verificando conexión a PostgreSQL...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Verificar conexión básica
    console.log('1. 🔌 Probando conexión básica...');
    await prisma.$connect();
    console.log('   ✅ Conexión establecida exitosamente\n');
    
    // 2. Verificar tablas principales
    console.log('2. 📊 Verificando tablas principales...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`   ✅ Tablas encontradas: ${tables.length}`);
    tables.forEach(table => {
      console.log(`      - ${table.table_name}`);
    });
    console.log();
    
    // 3. Verificar datos de categorías
    console.log('3. 🏷️ Verificando categorías...');
    const categories = await prisma.categoria.findMany();
    console.log(`   ✅ Total categorías: ${categories.length}`);
    console.log(`   📊 Gastos: ${categories.filter(c => c.tipo === 'gasto').length}`);
    console.log(`   📊 Ingresos: ${categories.filter(c => c.tipo === 'ingreso').length}\n`);
    
    // 4. Verificar usuarios
    console.log('4. 👥 Verificando usuarios...');
    const users = await prisma.usuario.findMany();
    console.log(`   ✅ Total usuarios: ${users.length}\n`);
    
    // 5. Verificar ingresos
    console.log('5. 💰 Verificando ingresos...');
    const incomes = await prisma.ingreso.findMany();
    console.log(`   ✅ Total ingresos: ${incomes.length}\n`);
    
    // 6. Verificar gastos
    console.log('6. 💸 Verificando gastos...');
    const expenses = await prisma.gasto.findMany();
    console.log(`   ✅ Total gastos: ${expenses.length}\n`);
    
    // 7. Prueba de consulta compleja
    console.log('7. 🔍 Probando consulta compleja...');
    const summary = await prisma.$queryRaw`
      SELECT 
        'ingresos' as tipo,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto), 0) as total
      FROM ingreso 
      WHERE estado = 'activo'
      UNION ALL
      SELECT 
        'gastos' as tipo,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto), 0) as total
      FROM gasto 
      WHERE estado = 'activo'
    `;
    
    console.log('   ✅ Resumen financiero:');
    summary.forEach(item => {
      console.log(`      ${item.tipo}: ${item.cantidad} registros, $${item.total}`);
    });
    console.log();
    
    console.log('🎉 ¡Base de datos funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error.message);
    console.error('   Detalles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
