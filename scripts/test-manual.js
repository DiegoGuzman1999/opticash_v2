#!/usr/bin/env node

/**
 * Script para probar manualmente los endpoints de OptiCash
 */

const http = require('http');

// Función para hacer requests HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ 
            status: res.statusCode, 
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Probando endpoints de OptiCash manualmente...\n');

  try {
    // 1. Health Check
    console.log('1. 🏥 Health Check');
    try {
      const health = await makeRequest('GET', '/health');
      console.log(`   Status: ${health.status}`);
      console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // 2. Endpoint principal
    console.log('2. 🏠 Endpoint Principal');
    try {
      const main = await makeRequest('GET', '/');
      console.log(`   Status: ${main.status}`);
      console.log(`   Response: ${JSON.stringify(main.data, null, 2)}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // 3. Información de API
    console.log('3. 📋 Información de API');
    try {
      const info = await makeRequest('GET', '/api/info');
      console.log(`   Status: ${info.status}`);
      console.log(`   Response: ${JSON.stringify(info.data, null, 2)}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // 4. Categorías (sin autenticación)
    console.log('4. 🏷️ Categorías (sin auth)');
    try {
      const categories = await makeRequest('GET', '/api/categories');
      console.log(`   Status: ${categories.status}`);
      if (categories.data.success) {
        console.log(`   ✅ Total categorías: ${categories.data.data.length}`);
        console.log(`   📊 Gastos: ${categories.data.data.filter(c => c.tipo === 'gasto').length}`);
        console.log(`   📊 Ingresos: ${categories.data.data.filter(c => c.tipo === 'ingreso').length}\n`);
      } else {
        console.log(`   ❌ Error: ${categories.data.message}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // 5. Crear usuario
    console.log('5. 👤 Crear Usuario');
    try {
      const userData = {
        nombre: 'Usuario Prueba Manual',
        email: 'prueba-manual@opticash.com',
        password: 'password123'
      };
      
      const register = await makeRequest('POST', '/api/usuarios/registro', userData);
      console.log(`   Status: ${register.status}`);
      if (register.data.success) {
        console.log(`   ✅ Usuario creado: ${register.data.data.usuario.nombre}`);
        console.log(`   🔑 Token: ${register.data.data.token.substring(0, 20)}...\n`);
        
        const token = register.data.data.token;
        const userId = register.data.data.usuario.id;

        // 6. Login
        console.log('6. 🔐 Login');
        try {
          const login = await makeRequest('POST', '/api/usuarios/login', {
            email: userData.email,
            password: userData.password
          });
          console.log(`   Status: ${login.status}`);
          if (login.data.success) {
            console.log(`   ✅ Login exitoso\n`);
          } else {
            console.log(`   ❌ Error: ${login.data.message}\n`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
        }

        // 7. Obtener categorías con auth
        console.log('7. 🏷️ Categorías (con auth)');
        try {
          const authCategories = await makeRequest('GET', '/api/categories', null, {
            'Authorization': `Bearer ${token}`
          });
          console.log(`   Status: ${authCategories.status}`);
          if (authCategories.data.success) {
            console.log(`   ✅ Categorías obtenidas: ${authCategories.data.data.length}\n`);
          } else {
            console.log(`   ❌ Error: ${authCategories.data.message}\n`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
        }

        // 8. Crear ingreso
        console.log('8. 💰 Crear Ingreso');
        try {
          const incomeData = {
            descripcion: 'Salario de prueba manual',
            categoria_id: authCategories.data.data.find(c => c.tipo === 'ingreso')?.id,
            monto: 2500.00,
            fecha_ingreso: '2024-01-15'
          };
          
          const income = await makeRequest('POST', '/api/income', incomeData, {
            'Authorization': `Bearer ${token}`
          });
          console.log(`   Status: ${income.status}`);
          if (income.data.success) {
            console.log(`   ✅ Ingreso creado: ${income.data.data.descripcion} - $${income.data.data.monto}`);
            console.log(`   🏷️ Categoría: ${income.data.data.categoria.nombre}\n`);
            
            const incomeId = income.data.data.id;

            // 9. Obtener ingresos
            console.log('9. 📊 Obtener Ingresos');
            try {
              const incomes = await makeRequest('GET', '/api/income', null, {
                'Authorization': `Bearer ${token}`
              });
              console.log(`   Status: ${incomes.status}`);
              if (incomes.data.success) {
                console.log(`   ✅ Total ingresos: ${incomes.data.data.total}`);
                console.log(`   📊 En página: ${incomes.data.data.ingresos.length}\n`);
              } else {
                console.log(`   ❌ Error: ${incomes.data.message}\n`);
              }
            } catch (error) {
              console.log(`   ❌ Error: ${error.message}\n`);
            }

            // 10. Estadísticas de ingresos
            console.log('10. 📈 Estadísticas de Ingresos');
            try {
              const stats = await makeRequest('GET', '/api/income/stats', null, {
                'Authorization': `Bearer ${token}`
              });
              console.log(`   Status: ${stats.status}`);
              if (stats.data.success) {
                console.log(`   ✅ Total: $${stats.data.data.total}`);
                console.log(`   📊 Cantidad: ${stats.data.data.cantidad}\n`);
              } else {
                console.log(`   ❌ Error: ${stats.data.message}\n`);
              }
            } catch (error) {
              console.log(`   ❌ Error: ${error.message}\n`);
            }

          } else {
            console.log(`   ❌ Error: ${income.data.message}\n`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
        }

      } else {
        console.log(`   ❌ Error: ${register.data.message}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    console.log('🎉 ¡Pruebas manuales completadas!');

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar pruebas
testEndpoints();
