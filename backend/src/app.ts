import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import { prismaPlugin } from './utils/prisma.js';
import { registerAllRoutes } from './routes.js';

export async function buildApp() {
  const server = Fastify({ 
    logger: true,
    // Vercel serverless timeout workaround
    disableRequestLogging: true
  });

  await server.register(cors, { 
    origin: process.env.CORS_ORIGIN?.split(',') ?? true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });
  
  await server.register(cookie);
  await server.register(formbody);
  await server.register(multipart);
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    cookie: { cookieName: 'refreshToken', signed: false },
  });

  await server.register(prismaPlugin);
  
  server.get('/api/v1/health', async () => ({ ok: true }));
  
  await registerAllRoutes(server);

  return server;
}
