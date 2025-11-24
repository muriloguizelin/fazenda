import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development/serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const prismaPlugin = fp(async (fastify) => {
  fastify.decorate('prisma', prisma);
});



