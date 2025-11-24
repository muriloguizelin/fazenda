import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import { prismaPlugin } from './utils/prisma.js';
import { registerAllRoutes } from './routes.js';

const server = Fastify({ logger: true });

await server.register(cors, { origin: process.env.CORS_ORIGIN?.split(',') ?? true, credentials: true });
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

const port = Number(process.env.PORT || 3000);
server
  .listen({ port, host: '0.0.0.0' })
  .then(addr => server.log.info(`listening at ${addr}`))
  .catch(err => {
    server.log.error(err);
    process.exit(1);
  });
