#!/usr/bin/env node

/**
 * Script para agregar categorías por defecto a la base de datos
 */

const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Iniciando seed de categorías...');
  
  try {
    // Verificar si ya existen categorías
    const existingCategories = await prisma.categoria.count();
    if (existingCategories > 0) {
      console.log('✅ Las categorías ya existen, saltando seed...');
      return;
    }

    // Crear categorías de gastos
    console.log('📊 Creando categorías de gastos...');
    const gastosCategories = [
      { nombre: 'Alimentación', tipo: 'gasto', descripcion: 'Gastos en comida y bebida' },
      { nombre: 'Transporte', tipo: 'gasto', descripcion: 'Gastos de transporte público y privado' },
      { nombre: 'Vivienda', tipo: 'gasto', descripcion: 'Gastos de alquiler, servicios, mantenimiento' },
      { nombre: 'Salud', tipo: 'gasto', descripcion: 'Gastos médicos y farmacéuticos' },
      { nombre: 'Entretenimiento', tipo: 'gasto', descripcion: 'Gastos de ocio y entretenimiento' },
      { nombre: 'Educación', tipo: 'gasto', descripcion: 'Gastos educativos y de formación' },
      { nombre: 'Ropa', tipo: 'gasto', descripcion: 'Gastos en vestimenta y calzado' },
      { nombre: 'Tecnología', tipo: 'gasto', descripcion: 'Gastos en dispositivos y servicios tecnológicos' },
      { nombre: 'Otros', tipo: 'gasto', descripcion: 'Gastos diversos no categorizados' }
    ];

    for (const category of gastosCategories) {
      await prisma.categoria.create({ data: category });
    }

    // Crear categorías de ingresos
    console.log('📈 Creando categorías de ingresos...');
    const ingresosCategories = [
      { nombre: 'Salario', tipo: 'ingreso', descripcion: 'Ingresos por trabajo dependiente' },
      { nombre: 'Freelance', tipo: 'ingreso', descripcion: 'Ingresos por trabajo independiente' },
      { nombre: 'Inversiones', tipo: 'ingreso', descripcion: 'Ingresos por inversiones y dividendos' },
      { nombre: 'Negocio', tipo: 'ingreso', descripcion: 'Ingresos por negocio propio' },
      { nombre: 'Bonificaciones', tipo: 'ingreso', descripcion: 'Bonificaciones y comisiones' },
      { nombre: 'Alquileres', tipo: 'ingreso', descripcion: 'Ingresos por alquiler de propiedades' },
      { nombre: 'Pensiones', tipo: 'ingreso', descripcion: 'Ingresos por pensiones y jubilación' },
      { nombre: 'Otros', tipo: 'ingreso', descripcion: 'Ingresos diversos no categorizados' }
    ];

    for (const category of ingresosCategories) {
      await prisma.categoria.create({ data: category });
    }

    // Verificar categorías creadas
    const totalCategories = await prisma.categoria.count();
    const gastosCount = await prisma.categoria.count({ where: { tipo: 'gasto' } });
    const ingresosCount = await prisma.categoria.count({ where: { tipo: 'ingreso' } });

    console.log('✅ Seed completado exitosamente!');
    console.log(`📊 Total de categorías: ${totalCategories}`);
    console.log(`💸 Categorías de gastos: ${gastosCount}`);
    console.log(`💰 Categorías de ingresos: ${ingresosCount}`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('🎉 Seed finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { seedCategories };
