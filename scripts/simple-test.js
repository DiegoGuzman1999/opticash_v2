#!/usr/bin/env node

/**
 * Script simple para probar los endpoints básicos
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testBasicEndpoints() {
  console.log('🧪 Probando endpoints básicos...\n');
  
  try {
    // 1. Probar health check
    console.log('1. Probando health check...');
    const healthResult = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/health',
      method: 'GET'
    });
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Response: ${JSON.stringify(healthResult.data, null, 2)}\n`);

    // 2. Probar endpoint principal
    console.log('2. Probando endpoint principal...');
    const mainResult = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/',
      method: 'GET'
    });
    console.log(`   Status: ${mainResult.status}`);
    console.log(`   Response: ${JSON.stringify(mainResult.data, null, 2)}\n`);

    // 3. Probar endpoint de información de API
    console.log('3. Probando información de API...');
    const infoResult = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/info',
      method: 'GET'
    });
    console.log(`   Status: ${infoResult.status}`);
    console.log(`   Response: ${JSON.stringify(infoResult.data, null, 2)}\n`);

    // 4. Probar categorías
    console.log('4. Probando categorías...');
    const categoriesResult = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/categories',
      method: 'GET'
    });
    console.log(`   Status: ${categoriesResult.status}`);
    if (categoriesResult.data.success) {
      console.log(`   Total categorías: ${categoriesResult.data.data.length}`);
    } else {
      console.log(`   Error: ${categoriesResult.data.message}`);
    }

    console.log('\n✅ Pruebas básicas completadas!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testBasicEndpoints();
