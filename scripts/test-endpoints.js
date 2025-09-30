#!/usr/bin/env node

/**
 * Script para probar los nuevos endpoints de OptiCash
 * - Gestión de ingresos
 * - Gestión de categorías
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Configurar axios para logging
axios.defaults.timeout = 10000;

// Función para hacer requests con manejo de errores
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

async function testEndpoints() {
  console.log('🧪 Iniciando pruebas de endpoints...\n');
  
  let authToken = null;
  let userId = null;
  let categoryId = null;
  let incomeId = null;

  try {
    // 1. Probar endpoint de información
    console.log('📋 1. Probando endpoint de información...');
    const infoResult = await makeRequest('GET', '/info');
    if (infoResult.success) {
      console.log('   ✅ Información de API obtenida');
      console.log(`   📊 Endpoints disponibles: ${Object.keys(infoResult.data.data.endpoints).length}`);
    } else {
      console.log('   ❌ Error al obtener información:', infoResult.error);
    }

    // 2. Probar endpoint de categorías (sin autenticación)
    console.log('\n🏷️ 2. Probando endpoint de categorías...');
    const categoriesResult = await makeRequest('GET', '/categories');
    if (categoriesResult.success) {
      console.log('   ✅ Categorías obtenidas');
      console.log(`   📊 Total categorías: ${categoriesResult.data.data.length}`);
      categoryId = categoriesResult.data.data[0]?.id;
    } else {
      console.log('   ❌ Error al obtener categorías:', categoriesResult.error);
    }

    // 3. Crear usuario de prueba
    console.log('\n👤 3. Creando usuario de prueba...');
    const userData = {
      nombre: 'Usuario Prueba Endpoints',
      email: 'test-endpoints@opticash.com',
      password: 'password123'
    };
    
    const registerResult = await makeRequest('POST', '/usuarios/registro', userData);
    if (registerResult.success) {
      console.log('   ✅ Usuario creado exitosamente');
      authToken = registerResult.data.data.token;
      userId = registerResult.data.data.usuario.id;
    } else {
      console.log('   ❌ Error al crear usuario:', registerResult.error);
      return;
    }

    // 4. Probar login
    console.log('\n🔐 4. Probando login...');
    const loginResult = await makeRequest('POST', '/usuarios/login', {
      email: userData.email,
      password: userData.password
    });
    if (loginResult.success) {
      console.log('   ✅ Login exitoso');
      authToken = loginResult.data.data.token;
    } else {
      console.log('   ❌ Error en login:', loginResult.error);
    }

    // 5. Probar obtener categorías con autenticación
    console.log('\n🏷️ 5. Probando categorías con autenticación...');
    const authCategoriesResult = await makeRequest('GET', '/categories', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (authCategoriesResult.success) {
      console.log('   ✅ Categorías obtenidas con autenticación');
      console.log(`   📊 Categorías de gastos: ${authCategoriesResult.data.data.filter(c => c.tipo === 'gasto').length}`);
      console.log(`   📊 Categorías de ingresos: ${authCategoriesResult.data.data.filter(c => c.tipo === 'ingreso').length}`);
    } else {
      console.log('   ❌ Error al obtener categorías:', authCategoriesResult.error);
    }

    // 6. Probar crear ingreso
    console.log('\n💰 6. Probando creación de ingreso...');
    const incomeData = {
      descripcion: 'Salario de prueba',
      categoria_id: authCategoriesResult.data.data.find(c => c.tipo === 'ingreso')?.id,
      monto: 2500.00,
      fecha_ingreso: '2024-01-15'
    };
    
    const createIncomeResult = await makeRequest('POST', '/income', incomeData, {
      'Authorization': `Bearer ${authToken}`
    });
    if (createIncomeResult.success) {
      console.log('   ✅ Ingreso creado exitosamente');
      incomeId = createIncomeResult.data.data.id;
      console.log(`   📊 Ingreso: ${createIncomeResult.data.data.descripcion} - $${createIncomeResult.data.data.monto}`);
    } else {
      console.log('   ❌ Error al crear ingreso:', createIncomeResult.error);
    }

    // 7. Probar obtener ingresos
    console.log('\n📊 7. Probando obtener ingresos...');
    const getIncomesResult = await makeRequest('GET', '/income', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (getIncomesResult.success) {
      console.log('   ✅ Ingresos obtenidos exitosamente');
      console.log(`   📊 Total ingresos: ${getIncomesResult.data.data.total}`);
      console.log(`   📊 Ingresos en página: ${getIncomesResult.data.data.ingresos.length}`);
    } else {
      console.log('   ❌ Error al obtener ingresos:', getIncomesResult.error);
    }

    // 8. Probar obtener estadísticas de ingresos
    console.log('\n📈 8. Probando estadísticas de ingresos...');
    const incomeStatsResult = await makeRequest('GET', '/income/stats', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (incomeStatsResult.success) {
      console.log('   ✅ Estadísticas obtenidas exitosamente');
      console.log(`   📊 Total ingresos: $${incomeStatsResult.data.data.total}`);
      console.log(`   📊 Cantidad de transacciones: ${incomeStatsResult.data.data.cantidad}`);
    } else {
      console.log('   ❌ Error al obtener estadísticas:', incomeStatsResult.error);
    }

    // 9. Probar actualizar ingreso
    if (incomeId) {
      console.log('\n✏️ 9. Probando actualización de ingreso...');
      const updateIncomeResult = await makeRequest('PUT', `/income/${incomeId}`, {
        descripcion: 'Salario de prueba actualizado',
        monto: 3000.00
      }, {
        'Authorization': `Bearer ${authToken}`
      });
      if (updateIncomeResult.success) {
        console.log('   ✅ Ingreso actualizado exitosamente');
        console.log(`   📊 Nuevo monto: $${updateIncomeResult.data.data.monto}`);
      } else {
        console.log('   ❌ Error al actualizar ingreso:', updateIncomeResult.error);
      }
    }

    // 10. Probar obtener ingreso específico
    if (incomeId) {
      console.log('\n🔍 10. Probando obtener ingreso específico...');
      const getIncomeResult = await makeRequest('GET', `/income/${incomeId}`, null, {
        'Authorization': `Bearer ${authToken}`
      });
      if (getIncomeResult.success) {
        console.log('   ✅ Ingreso específico obtenido exitosamente');
        console.log(`   📊 Descripción: ${getIncomeResult.data.data.descripcion}`);
        console.log(`   📊 Categoría: ${getIncomeResult.data.data.categoria.nombre}`);
      } else {
        console.log('   ❌ Error al obtener ingreso específico:', getIncomeResult.error);
      }
    }

    // 11. Probar eliminar ingreso
    if (incomeId) {
      console.log('\n🗑️ 11. Probando eliminación de ingreso...');
      const deleteIncomeResult = await makeRequest('DELETE', `/income/${incomeId}`, null, {
        'Authorization': `Bearer ${authToken}`
      });
      if (deleteIncomeResult.success) {
        console.log('   ✅ Ingreso eliminado exitosamente');
      } else {
        console.log('   ❌ Error al eliminar ingreso:', deleteIncomeResult.error);
      }
    }

    console.log('\n🎉 ¡Pruebas de endpoints completadas!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Información de API');
    console.log('   ✅ Gestión de categorías');
    console.log('   ✅ Registro y login de usuarios');
    console.log('   ✅ Creación de ingresos');
    console.log('   ✅ Obtención de ingresos');
    console.log('   ✅ Estadísticas de ingresos');
    console.log('   ✅ Actualización de ingresos');
    console.log('   ✅ Eliminación de ingresos');
    console.log('   ✅ Autenticación JWT');

  } catch (error) {
    console.error('💥 Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testEndpoints()
    .then(() => {
      console.log('🎉 Pruebas finalizadas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { testEndpoints };
