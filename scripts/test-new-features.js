#!/usr/bin/env node

/**
 * Script para probar las nuevas funcionalidades de OptiCash
 * - Gestión de ingresos
 * - Categorización de gastos e ingresos
 */

const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function testNewFeatures() {
  console.log('🧪 Iniciando pruebas de nuevas funcionalidades...');
  
  try {
    // 1. Verificar categorías disponibles
    console.log('\n📊 Verificando categorías disponibles:');
    const categoriasGastos = await prisma.categoria.findMany({
      where: { tipo: 'gasto' },
      select: { id: true, nombre: true, descripcion: true }
    });
    
    const categoriasIngresos = await prisma.categoria.findMany({
      where: { tipo: 'ingreso' },
      select: { id: true, nombre: true, descripcion: true }
    });
    
    console.log('💸 Categorías de gastos:');
    categoriasGastos.forEach(cat => {
      console.log(`   - ${cat.nombre}: ${cat.descripcion}`);
    });
    
    console.log('\n💰 Categorías de ingresos:');
    categoriasIngresos.forEach(cat => {
      console.log(`   - ${cat.nombre}: ${cat.descripcion}`);
    });

    // 2. Crear un usuario de prueba si no existe
    console.log('\n👤 Creando usuario de prueba...');
    let usuario = await prisma.usuario.findFirst({
      where: { email: 'test@opticash.com' }
    });
    
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nombre: 'Usuario de Prueba',
          email: 'test@opticash.com',
          estado: 'activo',
          rol: 'usuario'
        }
      });
      console.log('✅ Usuario de prueba creado');
    } else {
      console.log('✅ Usuario de prueba ya existe');
    }

    // 3. Crear algunos gastos de prueba
    console.log('\n💸 Creando gastos de prueba...');
    const gastosData = [
      {
        usuario_id: usuario.id,
        descripcion: 'Supermercado semanal',
        categoria_id: categoriasGastos.find(c => c.nombre === 'Alimentación')?.id,
        monto: 150.50,
        fecha_registro: new Date('2024-01-15'),
        estado: 'activo'
      },
      {
        usuario_id: usuario.id,
        descripcion: 'Transporte público',
        categoria_id: categoriasGastos.find(c => c.nombre === 'Transporte')?.id,
        monto: 25.00,
        fecha_registro: new Date('2024-01-15'),
        estado: 'activo'
      },
      {
        usuario_id: usuario.id,
        descripcion: 'Netflix mensual',
        categoria_id: categoriasGastos.find(c => c.nombre === 'Entretenimiento')?.id,
        monto: 12.99,
        fecha_registro: new Date('2024-01-01'),
        estado: 'activo'
      }
    ];

    for (const gastoData of gastosData) {
      const gasto = await prisma.gasto.create({
        data: gastoData,
        include: { categoria: true }
      });
      console.log(`   ✅ Gasto creado: ${gasto.descripcion} - $${gasto.monto} (${gasto.categoria.nombre})`);
    }

    // 4. Crear algunos ingresos de prueba
    console.log('\n💰 Creando ingresos de prueba...');
    const ingresosData = [
      {
        usuario_id: usuario.id,
        descripcion: 'Salario mensual',
        categoria_id: categoriasIngresos.find(c => c.nombre === 'Salario')?.id,
        monto: 3000.00,
        fecha_ingreso: new Date('2024-01-01'),
        estado: 'activo'
      },
      {
        usuario_id: usuario.id,
        descripcion: 'Proyecto freelance',
        categoria_id: categoriasIngresos.find(c => c.nombre === 'Freelance')?.id,
        monto: 500.00,
        fecha_ingreso: new Date('2024-01-10'),
        estado: 'activo'
      },
      {
        usuario_id: usuario.id,
        descripcion: 'Dividendos de inversión',
        categoria_id: categoriasIngresos.find(c => c.nombre === 'Inversiones')?.id,
        monto: 150.00,
        fecha_ingreso: new Date('2024-01-05'),
        estado: 'activo'
      }
    ];

    for (const ingresoData of ingresosData) {
      const ingreso = await prisma.ingreso.create({
        data: ingresoData,
        include: { categoria: true }
      });
      console.log(`   ✅ Ingreso creado: ${ingreso.descripcion} - $${ingreso.monto} (${ingreso.categoria.nombre})`);
    }

    // 5. Calcular resumen financiero
    console.log('\n📊 Resumen financiero del usuario:');
    
    const totalGastos = await prisma.gasto.aggregate({
      where: { 
        usuario_id: usuario.id,
        estado: 'activo'
      },
      _sum: { monto: true }
    });
    
    const totalIngresos = await prisma.ingreso.aggregate({
      where: { 
        usuario_id: usuario.id,
        estado: 'activo'
      },
      _sum: { monto: true }
    });
    
    const liquidez = (totalIngresos._sum.monto || 0) - (totalGastos._sum.monto || 0);
    
    console.log(`   💰 Total ingresos: $${totalIngresos._sum.monto || 0}`);
    console.log(`   💸 Total gastos: $${totalGastos._sum.monto || 0}`);
    console.log(`   💵 Liquidez disponible: $${liquidez}`);

    // 6. Mostrar gastos por categoría
    console.log('\n📈 Gastos por categoría:');
    const gastosPorCategoria = await prisma.gasto.groupBy({
      by: ['categoria_id'],
      where: { 
        usuario_id: usuario.id,
        estado: 'activo'
      },
      _sum: { monto: true },
      _count: { id: true }
    });

    for (const grupo of gastosPorCategoria) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: grupo.categoria_id }
      });
      console.log(`   - ${categoria.nombre}: $${grupo._sum.monto} (${grupo._count.id} transacciones)`);
    }

    // 7. Mostrar ingresos por categoría
    console.log('\n📈 Ingresos por categoría:');
    const ingresosPorCategoria = await prisma.ingreso.groupBy({
      by: ['categoria_id'],
      where: { 
        usuario_id: usuario.id,
        estado: 'activo'
      },
      _sum: { monto: true },
      _count: { id: true }
    });

    for (const grupo of ingresosPorCategoria) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: grupo.categoria_id }
      });
      console.log(`   - ${categoria.nombre}: $${grupo._sum.monto} (${grupo._count.id} transacciones)`);
    }

    console.log('\n✅ Pruebas completadas exitosamente!');
    console.log('\n🎯 Funcionalidades probadas:');
    console.log('   ✅ Gestión de categorías');
    console.log('   ✅ Creación de gastos con categorías');
    console.log('   ✅ Creación de ingresos con categorías');
    console.log('   ✅ Cálculo de liquidez');
    console.log('   ✅ Agrupación por categorías');
    console.log('   ✅ Relaciones entre tablas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testNewFeatures()
    .then(() => {
      console.log('🎉 Pruebas finalizadas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { testNewFeatures };
