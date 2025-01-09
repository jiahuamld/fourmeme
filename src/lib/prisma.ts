import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    }
  },
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
