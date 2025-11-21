import type { PrismaClient } from '@prisma/client';
import type { JwtPayload } from '../shared/types/jwt-payload.type';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    user?: JwtPayload;
  }
}
