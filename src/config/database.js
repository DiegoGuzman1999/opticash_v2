const { PrismaClient } = require('../../generated/prisma');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ Base de datos PostgreSQL conectada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar la conexión:', error.message);
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Base de datos conectada' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  getClient() {
    return this.prisma;
  }
}

// Singleton instance
const database = new Database();

module.exports = database;
