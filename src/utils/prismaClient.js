const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton
 * Ensures only one instance of PrismaClient exists across the application
 * This prevents connection pool exhaustion and memory leaks
 */
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

module.exports = prisma;
